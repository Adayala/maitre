import type { ArcaEndpoints, ArcaEnvironment } from "./environment.js";
import { resolveArcaEndpoints } from "./environment.js";
import { ArcaError } from "./errors.js";
import type {
  ArcaClock,
  ArcaDiagnostics,
  ArcaHttpTransport,
  WsaaTicket,
} from "./ports.js";
import { noOpDiagnostics, systemClock } from "./ports.js";
import type {
  ArcaMessage,
  WsfeAuth,
  WsfeCaeDetailRequest,
  WsfeCaeDetailResult,
  WsfeCaeRequest,
  WsfeCaeResult,
  WsfeHealth,
  WsfeLastAuthorized,
  WsfeLastAuthorizedRequest,
  WsfeParameterItem,
  WsfeParameterKind,
  WsfeVoucherQuery,
  WsfeVoucherResult,
} from "./wsfev1-types.js";
import { escapeXml, parseXml } from "./xml.js";

export interface WsfeTicketProvider {
  getTicket(): Promise<WsaaTicket>;
}

export interface Wsfev1ClientOptions {
  environment: ArcaEnvironment;
  representedCuit: string;
  transport: ArcaHttpTransport;
  tickets: WsfeTicketProvider;
  endpoints?: Partial<ArcaEndpoints>;
  clock?: ArcaClock;
  diagnostics?: ArcaDiagnostics;
}

type XmlRecord = Record<string, unknown>;

function record(value: unknown): XmlRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as XmlRecord)
    : {};
}

function deep(value: unknown, key: string): unknown {
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = deep(child, key);
      if (found !== undefined) return found;
    }
    return undefined;
  }
  const current = record(value);
  if (key in current) return current[key];
  for (const child of Object.values(current)) {
    const found = deep(child, key);
    if (found !== undefined) return found;
  }
  return undefined;
}

function array(value: unknown): unknown[] {
  if (value === undefined || value === null || value === "") return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
}

function integer(value: unknown): number {
  const parsed = Number.parseInt(text(value), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function messages(root: unknown, containerName: string, itemName: string): ArcaMessage[] {
  const container = record(deep(root, containerName));
  return array(container[itemName]).map((item) => {
    const row = record(item);
    return {
      code: integer(row["Code"] ?? row["Id"]),
      message: text(row["Msg"] ?? row["Desc"]),
    };
  });
}

function assertNoSoapFault(parsed: unknown): void {
  const fault = deep(parsed, "Fault");
  if (fault === undefined) return;
  const row = record(fault);
  const detail = record(row["detail"] ?? row["Detail"]);
  const code = text(row["faultcode"] ?? detail["code"]);
  throw new ArcaError(
    text(row["faultstring"] ?? deep(row["Reason"], "Text"), "WSFEv1 SOAP fault"),
    { kind: "SOAP_FAULT", ...(code ? { code } : {}) },
  );
}

function authXml(auth: WsfeAuth): string {
  return (
    "<Auth>" +
    `<Token>${escapeXml(auth.token)}</Token>` +
    `<Sign>${escapeXml(auth.sign)}</Sign>` +
    `<Cuit>${escapeXml(auth.cuit)}</Cuit>` +
    "</Auth>"
  );
}

function optionalTag(name: string, value: string | number | undefined): string {
  return value === undefined ? "" : `<${name}>${escapeXml(String(value))}</${name}>`;
}

function detailXml(detail: WsfeCaeDetailRequest): string {
  const vat = detail.vat?.length
    ? `<Iva>${detail.vat
        .map(
          (item) =>
            "<AlicIva>" +
            `<Id>${item.id}</Id><BaseImp>${item.taxableBase}</BaseImp><Importe>${item.amount}</Importe>` +
            "</AlicIva>",
        )
        .join("")}</Iva>`
    : "";
  const taxes = detail.taxes?.length
    ? `<Tributos>${detail.taxes
        .map(
          (item) =>
            "<Tributo>" +
            `<Id>${item.id}</Id><Desc>${escapeXml(item.description)}</Desc>` +
            `<BaseImp>${item.taxableBase}</BaseImp><Alic>${item.rate}</Alic><Importe>${item.amount}</Importe>` +
            "</Tributo>",
        )
        .join("")}</Tributos>`
    : "";
  const associated = detail.associatedVouchers?.length
    ? `<CbtesAsoc>${detail.associatedVouchers
        .map(
          (item) =>
            "<CbteAsoc>" +
            `<Tipo>${item.voucherType}</Tipo><PtoVta>${item.pointOfSale}</PtoVta><Nro>${item.voucherNumber}</Nro>` +
            optionalTag("Cuit", item.cuit) +
            optionalTag("CbteFch", item.date) +
            "</CbteAsoc>",
        )
        .join("")}</CbtesAsoc>`
    : "";
  const optionals = detail.optionalFields?.length
    ? `<Opcionales>${detail.optionalFields
        .map(
          (item) =>
            `<Opcional><Id>${escapeXml(item.id)}</Id><Valor>${escapeXml(item.value)}</Valor></Opcional>`,
        )
        .join("")}</Opcionales>`
    : "";

  return (
    "<FECAEDetRequest>" +
    `<Concepto>${detail.concept}</Concepto>` +
    `<DocTipo>${detail.recipientDocumentType}</DocTipo>` +
    `<DocNro>${escapeXml(detail.recipientDocumentNumber)}</DocNro>` +
    `<CbteDesde>${detail.voucherFrom}</CbteDesde><CbteHasta>${detail.voucherTo}</CbteHasta>` +
    `<CbteFch>${escapeXml(detail.voucherDate)}</CbteFch>` +
    `<ImpTotal>${detail.totalAmount}</ImpTotal><ImpTotConc>${detail.nonTaxedAmount}</ImpTotConc>` +
    `<ImpNeto>${detail.netAmount}</ImpNeto><ImpOpEx>${detail.exemptAmount}</ImpOpEx>` +
    `<ImpTrib>${detail.taxAmount}</ImpTrib><ImpIVA>${detail.vatAmount}</ImpIVA>` +
    optionalTag("FchServDesde", detail.serviceFrom) +
    optionalTag("FchServHasta", detail.serviceTo) +
    optionalTag("FchVtoPago", detail.paymentDueDate) +
    `<MonId>${escapeXml(detail.currencyId)}</MonId><MonCotiz>${detail.currencyRate}</MonCotiz>` +
    optionalTag("CondicionIVAReceptorId", detail.recipientVatConditionId) +
    associated +
    taxes +
    vat +
    optionals +
    "</FECAEDetRequest>"
  );
}

function parseDetail(value: unknown): WsfeCaeDetailResult {
  const row = record(value);
  const result = text(row["Resultado"], "R");
  return {
    concept: integer(row["Concepto"]),
    recipientDocumentType: integer(row["DocTipo"]),
    recipientDocumentNumber: text(row["DocNro"]),
    voucherFrom: integer(row["CbteDesde"]),
    voucherTo: integer(row["CbteHasta"]),
    voucherDate: text(row["CbteFch"]),
    result: result === "A" || result === "P" ? result : "R",
    ...(text(row["CAE"]) ? { cae: text(row["CAE"]) } : {}),
    ...(text(row["CAEFchVto"]) ? { caeExpirationDate: text(row["CAEFchVto"]) } : {}),
    observations: messages(row, "Observaciones", "Obs"),
  };
}

const parameterOperations: Record<
  WsfeParameterKind,
  { operation: string; result: string; item: string }
> = {
  "voucher-types": { operation: "FEParamGetTiposCbte", result: "ResultGet", item: "CbteTipo" },
  "document-types": { operation: "FEParamGetTiposDoc", result: "ResultGet", item: "DocTipo" },
  "vat-rates": { operation: "FEParamGetTiposIva", result: "ResultGet", item: "IvaTipo" },
  currencies: { operation: "FEParamGetTiposMonedas", result: "ResultGet", item: "Moneda" },
  concepts: { operation: "FEParamGetTiposConcepto", result: "ResultGet", item: "ConceptoTipo" },
  "recipient-vat-conditions": {
    operation: "FEParamGetCondicionIvaReceptor",
    result: "ResultGet",
    item: "CondicionIvaReceptor",
  },
};

export class Wsfev1Client {
  private readonly options: Wsfev1ClientOptions;
  private readonly endpoints: ArcaEndpoints;
  private readonly clock: ArcaClock;
  private readonly diagnostics: ArcaDiagnostics;

  constructor(options: Wsfev1ClientOptions) {
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

  private async invoke(operation: string, body: (auth: WsfeAuth) => string): Promise<unknown> {
    const startedAt = this.clock.now().getTime();
    try {
      const ticket = await this.options.tickets.getTicket();
      const auth = {
        token: ticket.token,
        sign: ticket.sign,
        cuit: this.options.representedCuit,
      };
      const response = await this.options.transport.send({
        url: this.endpoints.wsfev1Url,
        method: "POST",
        headers: {
          "content-type": "text/xml; charset=utf-8",
          soapaction: `http://ar.gov.afip.dif.FEV1/${operation}`,
        },
        body:
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
          `<soap:Body><${operation} xmlns="http://ar.gov.afip.dif.FEV1/">` +
          `${body(auth)}</${operation}></soap:Body>` +
          "</soap:Envelope>",
      });
      if (response.status < 200 || response.status >= 300) {
        throw new ArcaError(`WSFEv1 returned HTTP ${response.status}`, {
          kind: "TRANSPORT",
          httpStatus: response.status,
          retryable: response.status >= 500,
          outcomeAmbiguous: operation === "FECAESolicitar",
        });
      }
      const parsed = parseXml(response.body);
      assertNoSoapFault(parsed);
      this.diagnostics.record({
        operation: `wsfev1.${operation}`,
        environment: this.options.environment,
        outcome: "success",
        durationMs: this.clock.now().getTime() - startedAt,
        status: response.status,
      });
      return parsed;
    } catch (cause) {
      const code = cause instanceof ArcaError ? cause.code : undefined;
      this.diagnostics.record({
        operation: `wsfev1.${operation}`,
        environment: this.options.environment,
        outcome: cause instanceof ArcaError && cause.outcomeAmbiguous ? "ambiguous" : "failure",
        durationMs: this.clock.now().getTime() - startedAt,
        ...(code ? { code } : {}),
      });
      if (cause instanceof ArcaError) throw cause;
      throw new ArcaError(`WSFEv1 ${operation} failed`, {
        kind: "TRANSPORT",
        retryable: true,
        outcomeAmbiguous: operation === "FECAESolicitar",
        cause,
      });
    }
  }

  async health(): Promise<WsfeHealth> {
    const parsed = await this.invoke("FEDummy", () => "");
    const result = record(deep(parsed, "FEDummyResult"));
    return {
      appServer: text(result["AppServer"]),
      dbServer: text(result["DbServer"]),
      authServer: text(result["AuthServer"]),
    };
  }

  async getLastAuthorized(request: WsfeLastAuthorizedRequest): Promise<WsfeLastAuthorized> {
    const parsed = await this.invoke(
      "FECompUltimoAutorizado",
      (auth) =>
        authXml(auth) +
        `<PtoVta>${request.pointOfSale}</PtoVta><CbteTipo>${request.voucherType}</CbteTipo>`,
    );
    const result = record(deep(parsed, "FECompUltimoAutorizadoResult"));
    return {
      pointOfSale: integer(result["PtoVta"]),
      voucherType: integer(result["CbteTipo"]),
      voucherNumber: integer(result["CbteNro"]),
      errors: messages(result, "Errors", "Err"),
      events: messages(result, "Events", "Evt"),
    };
  }

  async requestCae(request: WsfeCaeRequest): Promise<WsfeCaeResult> {
    if (request.details.length === 0) {
      throw new ArcaError("At least one voucher detail is required", {
        kind: "CONFIGURATION",
      });
    }
    const parsed = await this.invoke(
      "FECAESolicitar",
      (auth) =>
        authXml(auth) +
        "<FeCAEReq><FeCabReq>" +
        `<CantReg>${request.details.length}</CantReg>` +
        `<PtoVta>${request.pointOfSale}</PtoVta><CbteTipo>${request.voucherType}</CbteTipo>` +
        "</FeCabReq>" +
        `<FeDetReq>${request.details.map(detailXml).join("")}</FeDetReq></FeCAEReq>`,
    );
    const result = record(deep(parsed, "FECAESolicitarResult"));
    const header = record(result["FeCabResp"]);
    const detailsContainer = record(result["FeDetResp"]);
    const rawResult = text(header["Resultado"], "R");
    return {
      pointOfSale: integer(header["PtoVta"]),
      voucherType: integer(header["CbteTipo"]),
      result: rawResult === "A" || rawResult === "P" ? rawResult : "R",
      ...(text(header["FchProceso"]) ? { processedAt: text(header["FchProceso"]) } : {}),
      details: array(detailsContainer["FECAEDetResponse"]).map(parseDetail),
      errors: messages(result, "Errors", "Err"),
      events: messages(result, "Events", "Evt"),
    };
  }

  async consultVoucher(query: WsfeVoucherQuery): Promise<WsfeVoucherResult> {
    const parsed = await this.invoke(
      "FECompConsultar",
      (auth) =>
        authXml(auth) +
        "<FeCompConsReq>" +
        `<CbteTipo>${query.voucherType}</CbteTipo><CbteNro>${query.voucherNumber}</CbteNro>` +
        `<PtoVta>${query.pointOfSale}</PtoVta></FeCompConsReq>`,
    );
    const result = record(deep(parsed, "FECompConsultarResult"));
    const detail = result["ResultGet"];
    return {
      found: detail !== undefined && Object.keys(record(detail)).length > 0,
      ...(detail !== undefined && Object.keys(record(detail)).length > 0
        ? { detail: parseDetail(detail) }
        : {}),
      errors: messages(result, "Errors", "Err"),
      events: messages(result, "Events", "Evt"),
    };
  }

  async getParameters(kind: WsfeParameterKind): Promise<WsfeParameterItem[]> {
    const descriptor = parameterOperations[kind];
    const parsed = await this.invoke(descriptor.operation, authXml);
    const result = record(deep(parsed, `${descriptor.operation}Result`));
    const container = record(result[descriptor.result]);
    return array(container[descriptor.item]).map((value) => {
      const row = record(value);
      return {
        id: text(row["Id"]),
        description: text(row["Desc"]),
        ...(text(row["FchDesde"]) ? { validFrom: text(row["FchDesde"]) } : {}),
        ...(text(row["FchHasta"]) ? { validTo: text(row["FchHasta"]) } : {}),
      };
    });
  }
}
