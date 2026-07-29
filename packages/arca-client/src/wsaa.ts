import type { ArcaEndpoints, ArcaEnvironment } from "./environment.js";
import { resolveArcaEndpoints } from "./environment.js";
import { ArcaError } from "./errors.js";
import type {
  ArcaClock,
  ArcaCredentialProvider,
  ArcaDiagnostics,
  ArcaHttpTransport,
  CmsSigner,
  WsaaTicket,
  WsaaTicketCache,
} from "./ports.js";
import { noOpDiagnostics, systemClock } from "./ports.js";
import { asRecord, escapeXml, parseXml, stringValue } from "./xml.js";

const WSAA_SERVICE = "wsfe";
const DEFAULT_TICKET_LIFETIME_MS = 12 * 60 * 60 * 1000;
const DEFAULT_RENEWAL_MARGIN_MS = 10 * 60 * 1000;
const DEFAULT_GENERATION_SKEW_MS = 10 * 60 * 1000;

export interface WsaaClientOptions {
  environment: ArcaEnvironment;
  representedCuit: string;
  transport: ArcaHttpTransport;
  credentials: ArcaCredentialProvider;
  signer: CmsSigner;
  cache: WsaaTicketCache;
  endpoints?: Partial<ArcaEndpoints>;
  clock?: ArcaClock;
  diagnostics?: ArcaDiagnostics;
  renewalMarginMs?: number;
  ticketLifetimeMs?: number;
  generationSkewMs?: number;
}

function findDeep(value: unknown, key: string): unknown {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findDeep(item, key);
      if (found !== undefined) return found;
    }
    return undefined;
  }
  if (typeof value !== "object" || value === null) return undefined;
  const record = value as Record<string, unknown>;
  if (key in record) return record[key];
  for (const child of Object.values(record)) {
    const found = findDeep(child, key);
    if (found !== undefined) return found;
  }
  return undefined;
}

function decodeSoapText(value: string): string {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

function parseWsaaTicket(xml: string): WsaaTicket {
  const outer = parseXml(xml);
  const fault = findDeep(outer, "Fault");
  if (fault !== undefined) {
    const record = asRecord(fault, "SOAP Fault");
    const message = record["faultstring"] ?? record["Reason"] ?? "WSAA SOAP fault";
    throw new ArcaError(String(message), { kind: "SOAP_FAULT" });
  }

  const loginCmsReturn = findDeep(outer, "loginCmsReturn");
  if (loginCmsReturn === undefined) {
    throw new ArcaError("WSAA response does not contain loginCmsReturn", {
      kind: "INVALID_RESPONSE",
    });
  }
  const ticketXml = decodeSoapText(stringValue(loginCmsReturn, "loginCmsReturn"));
  const ticketDocument = parseXml(ticketXml);
  const credentials = asRecord(
    findDeep(ticketDocument, "credentials"),
    "loginTicketResponse.credentials",
  );
  const header = asRecord(
    findDeep(ticketDocument, "header"),
    "loginTicketResponse.header",
  );

  const generationTime = new Date(stringValue(header["generationTime"], "generationTime"));
  const expirationTime = new Date(stringValue(header["expirationTime"], "expirationTime"));
  if (!Number.isFinite(generationTime.getTime()) || !Number.isFinite(expirationTime.getTime())) {
    throw new ArcaError("WSAA response contains invalid ticket timestamps", {
      kind: "INVALID_RESPONSE",
    });
  }
  return {
    token: stringValue(credentials["token"], "credentials.token"),
    sign: stringValue(credentials["sign"], "credentials.sign"),
    generationTime,
    expirationTime,
  };
}

export class WsaaClient {
  private readonly options: WsaaClientOptions;
  private readonly endpoints: ArcaEndpoints;
  private readonly clock: ArcaClock;
  private readonly diagnostics: ArcaDiagnostics;

  constructor(options: WsaaClientOptions) {
    if (!/^\d{11}$/.test(options.representedCuit)) {
      throw new ArcaError("representedCuit must contain exactly 11 digits", {
        kind: "CONFIGURATION",
      });
    }
    this.options = options;
    this.endpoints = resolveArcaEndpoints(options.environment, options.endpoints);
    this.clock = options.clock ?? systemClock;
    this.diagnostics = options.diagnostics ?? noOpDiagnostics;
  }

  async getTicket(): Promise<WsaaTicket> {
    const key = {
      environment: this.options.environment,
      representedCuit: this.options.representedCuit,
      service: WSAA_SERVICE,
    };
    const cached = await this.options.cache.get(key);
    const renewalMarginMs = this.options.renewalMarginMs ?? DEFAULT_RENEWAL_MARGIN_MS;
    if (cached && cached.expirationTime.getTime() - this.clock.now().getTime() > renewalMarginMs) {
      return cached;
    }

    const startedAt = this.clock.now().getTime();
    try {
      const credential = await this.options.credentials.getCredentials({
        environment: this.options.environment,
        representedCuit: this.options.representedCuit,
      });
      if (credential.representedCuit !== this.options.representedCuit) {
        throw new ArcaError("Credential CUIT does not match representedCuit", {
          kind: "CONFIGURATION",
        });
      }
      const tra = this.buildLoginTicketRequest();
      const cms = await this.options.signer.sign({
        content: tra,
        certificatePem: credential.certificatePem,
        privateKeyPem: credential.privateKeyPem,
      });
      const response = await this.options.transport.send({
        url: this.endpoints.wsaaUrl,
        method: "POST",
        headers: {
          "content-type": "text/xml; charset=utf-8",
          soapaction: "",
        },
        body:
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' +
          'xmlns:wsaa="http://wsaa.view.sua.dvadac.desein.afip.gov">' +
          `<soapenv:Body><wsaa:loginCms><wsaa:in0>${escapeXml(cms)}</wsaa:in0>` +
          "</wsaa:loginCms></soapenv:Body></soapenv:Envelope>",
      });
      if (response.status < 200 || response.status >= 300) {
        // SOAP 1.1 commonly transports a useful, sanitized Fault with HTTP 500.
        // Parse it before reducing the response to an HTTP-only error.
        if (response.body.includes("Fault")) {
          parseWsaaTicket(response.body);
        }
        throw new ArcaError(`WSAA returned HTTP ${response.status}`, {
          kind: "AUTHENTICATION",
          httpStatus: response.status,
          retryable: response.status >= 500,
        });
      }
      const ticket = parseWsaaTicket(response.body);
      await this.options.cache.set(key, ticket);
      this.diagnostics.record({
        operation: "wsaa.loginCms",
        environment: this.options.environment,
        outcome: "success",
        durationMs: this.clock.now().getTime() - startedAt,
        status: response.status,
      });
      return ticket;
    } catch (cause) {
      const code = cause instanceof ArcaError ? cause.code : undefined;
      this.diagnostics.record({
        operation: "wsaa.loginCms",
        environment: this.options.environment,
        outcome: cause instanceof ArcaError && cause.outcomeAmbiguous ? "ambiguous" : "failure",
        durationMs: this.clock.now().getTime() - startedAt,
        ...(code ? { code } : {}),
      });
      if (cause instanceof ArcaError) throw cause;
      throw new ArcaError("Unable to obtain WSAA access ticket", {
        kind: "AUTHENTICATION",
        cause,
      });
    }
  }

  buildLoginTicketRequest(): string {
    const now = this.clock.now();
    const generation = new Date(
      now.getTime() - (this.options.generationSkewMs ?? DEFAULT_GENERATION_SKEW_MS),
    );
    const expiration = new Date(
      now.getTime() + (this.options.ticketLifetimeMs ?? DEFAULT_TICKET_LIFETIME_MS),
    );
    // WSAA's schema defines uniqueId as an unsigned numeric value.
    const uniqueId = Math.floor(now.getTime() / 1000);
    return (
      '<?xml version="1.0" encoding="UTF-8"?>' +
      "<loginTicketRequest><header>" +
      `<uniqueId>${uniqueId}</uniqueId>` +
      `<generationTime>${generation.toISOString()}</generationTime>` +
      `<expirationTime>${expiration.toISOString()}</expirationTime>` +
      "</header>" +
      `<service>${WSAA_SERVICE}</service>` +
      "</loginTicketRequest>"
    );
  }
}
