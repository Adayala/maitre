import assert from "node:assert/strict";
import test from "node:test";
import {
  ARCA_ENDPOINTS,
  ArcaError,
  MemoryWsaaTicketCache,
  WsaaClient,
  Wsfev1Client,
  type ArcaHttpRequest,
  type ArcaHttpResponse,
  type ArcaHttpTransport,
} from "../index.js";

const NOW = new Date("2026-07-29T12:00:00.000Z");
const clock = { now: () => new Date(NOW) };

class QueueTransport implements ArcaHttpTransport {
  readonly requests: ArcaHttpRequest[] = [];

  constructor(private readonly responses: Array<ArcaHttpResponse | Error>) {}

  async send(request: ArcaHttpRequest): Promise<ArcaHttpResponse> {
    this.requests.push(request);
    const response = this.responses.shift();
    if (!response) throw new Error("No queued response");
    if (response instanceof Error) throw response;
    return response;
  }
}

const ok = (body: string): ArcaHttpResponse => ({
  status: 200,
  headers: { "content-type": "text/xml" },
  body,
});

const ticket = {
  token: "test-token",
  sign: "test-sign",
  generationTime: new Date("2026-07-29T11:50:00.000Z"),
  expirationTime: new Date("2026-07-29T23:50:00.000Z"),
};

test("official environments remain explicit and separated", () => {
  assert.equal(
    ARCA_ENDPOINTS.homologation.wsfev1Url,
    "https://wswhomo.afip.gov.ar/wsfev1/service.asmx",
  );
  assert.equal(
    ARCA_ENDPOINTS.production.wsfev1Url,
    "https://servicios1.afip.gov.ar/wsfev1/service.asmx",
  );
  assert.notEqual(ARCA_ENDPOINTS.homologation.wsaaUrl, ARCA_ENDPOINTS.production.wsaaUrl);
});

test("WSAA obtains, parses and caches a ticket without exposing credentials", async () => {
  const inner =
    "<loginTicketResponse><header>" +
    "<generationTime>2026-07-29T11:50:00.000Z</generationTime>" +
    "<expirationTime>2026-07-29T23:50:00.000Z</expirationTime>" +
    "</header><credentials><token>test-token</token><sign>test-sign</sign>" +
    "</credentials></loginTicketResponse>";
  const escaped = inner.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const transport = new QueueTransport([
    ok(
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        `<soap:Body><loginCmsResponse><loginCmsReturn>${escaped}</loginCmsReturn>` +
        "</loginCmsResponse></soap:Body></soap:Envelope>",
    ),
  ]);
  const cache = new MemoryWsaaTicketCache();
  const client = new WsaaClient({
    environment: "homologation",
    representedCuit: "30712345678",
    transport,
    cache,
    clock,
    credentials: {
      getCredentials: async () => ({
        representedCuit: "30712345678",
        certificatePem: "SECRET CERTIFICATE",
        privateKeyPem: "SECRET PRIVATE KEY",
      }),
    },
    signer: {
      sign: async ({ content }) => {
        assert.match(content, /<service>wsfe<\/service>/);
        return "signed-cms";
      },
    },
  });

  assert.deepEqual(await client.getTicket(), ticket);
  assert.deepEqual(await client.getTicket(), ticket);
  assert.equal(transport.requests.length, 1);
  assert.equal(transport.requests[0]?.url, ARCA_ENDPOINTS.homologation.wsaaUrl);
  assert.doesNotMatch(transport.requests[0]?.body ?? "", /SECRET PRIVATE KEY/);
  assert.match(transport.requests[0]?.body ?? "", /signed-cms/);
});

test("WSAA renews a cached ticket inside the safety margin", async () => {
  const inner =
    "<loginTicketResponse><header>" +
    "<generationTime>2026-07-29T11:50:00.000Z</generationTime>" +
    "<expirationTime>2026-07-29T23:50:00.000Z</expirationTime>" +
    "</header><credentials><token>renewed-token</token><sign>renewed-sign</sign>" +
    "</credentials></loginTicketResponse>";
  const escaped = inner.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const transport = new QueueTransport([
    ok(
      "<Envelope><Body><loginCmsResponse>" +
        `<loginCmsReturn>${escaped}</loginCmsReturn>` +
        "</loginCmsResponse></Body></Envelope>",
    ),
  ]);
  const cache = new MemoryWsaaTicketCache();
  await cache.set(
    {
      environment: "homologation",
      representedCuit: "30712345678",
      service: "wsfe",
    },
    {
      ...ticket,
      expirationTime: new Date("2026-07-29T12:05:00.000Z"),
    },
  );
  const client = new WsaaClient({
    environment: "homologation",
    representedCuit: "30712345678",
    transport,
    cache,
    clock,
    credentials: {
      getCredentials: async () => ({
        representedCuit: "30712345678",
        certificatePem: "certificate",
        privateKeyPem: "private-key",
      }),
    },
    signer: { sign: async () => "renewed-cms" },
  });

  const renewed = await client.getTicket();

  assert.equal(renewed.token, "renewed-token");
  assert.equal(transport.requests.length, 1);
});

test("WSFEv1 queries official numbering with ticket authentication", async () => {
  const transport = new QueueTransport([
    ok(
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        "<soap:Body><FECompUltimoAutorizadoResponse><FECompUltimoAutorizadoResult>" +
        "<PtoVta>3</PtoVta><CbteTipo>6</CbteTipo><CbteNro>142</CbteNro>" +
        "</FECompUltimoAutorizadoResult></FECompUltimoAutorizadoResponse></soap:Body></soap:Envelope>",
    ),
  ]);
  const client = new Wsfev1Client({
    environment: "homologation",
    representedCuit: "30712345678",
    transport,
    tickets: { getTicket: async () => ticket },
    clock,
  });

  const result = await client.getLastAuthorized({ pointOfSale: 3, voucherType: 6 });

  assert.equal(result.voucherNumber, 142);
  assert.equal(transport.requests[0]?.url, ARCA_ENDPOINTS.homologation.wsfev1Url);
  assert.match(transport.requests[0]?.body ?? "", /<Token>test-token<\/Token>/);
  assert.match(transport.requests[0]?.body ?? "", /<PtoVta>3<\/PtoVta>/);
});

test("WSFEv1 normalizes an approved CAE and observations", async () => {
  const transport = new QueueTransport([
    ok(
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>' +
        "<FECAESolicitarResponse><FECAESolicitarResult><FeCabResp>" +
        "<Cuit>30712345678</Cuit><PtoVta>3</PtoVta><CbteTipo>6</CbteTipo>" +
        "<FchProceso>20260729120500</FchProceso><Resultado>A</Resultado></FeCabResp>" +
        "<FeDetResp><FECAEDetResponse><Concepto>1</Concepto><DocTipo>99</DocTipo>" +
        "<DocNro>0</DocNro><CbteDesde>143</CbteDesde><CbteHasta>143</CbteHasta>" +
        "<CbteFch>20260729</CbteFch><Resultado>A</Resultado><CAE>76123456789012</CAE>" +
        "<CAEFchVto>20260808</CAEFchVto><Observaciones><Obs><Code>10017</Code>" +
        "<Msg>Dato observado</Msg></Obs></Observaciones></FECAEDetResponse></FeDetResp>" +
        "</FECAESolicitarResult></FECAESolicitarResponse></soap:Body></soap:Envelope>",
    ),
  ]);
  const client = new Wsfev1Client({
    environment: "homologation",
    representedCuit: "30712345678",
    transport,
    tickets: { getTicket: async () => ticket },
    clock,
  });

  const result = await client.requestCae({
    pointOfSale: 3,
    voucherType: 6,
    details: [
      {
        concept: 1,
        recipientDocumentType: 99,
        recipientDocumentNumber: "0",
        voucherFrom: 143,
        voucherTo: 143,
        voucherDate: "20260729",
        totalAmount: 1210,
        nonTaxedAmount: 0,
        netAmount: 1000,
        exemptAmount: 0,
        vatAmount: 210,
        taxAmount: 0,
        currencyId: "PES",
        currencyRate: 1,
        vat: [{ id: 5, taxableBase: 1000, amount: 210 }],
      },
    ],
  });

  assert.equal(result.result, "A");
  assert.equal(result.details[0]?.cae, "76123456789012");
  assert.deepEqual(result.details[0]?.observations, [
    { code: 10017, message: "Dato observado" },
  ]);
  assert.match(transport.requests[0]?.body ?? "", /<AlicIva><Id>5<\/Id>/);
  assert.doesNotMatch(transport.requests[0]?.body ?? "", /undefined/);
});

test("WSFEv1 normalizes the authorization fields returned by FECompConsultar", async () => {
  const transport = new QueueTransport([
    ok(
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>' +
        "<FECompConsultarResponse><FECompConsultarResult><ResultGet>" +
        "<Concepto>1</Concepto><DocTipo>99</DocTipo><DocNro>0</DocNro>" +
        "<CbteDesde>143</CbteDesde><CbteHasta>143</CbteHasta><CbteFch>20260729</CbteFch>" +
        "<Resultado>A</Resultado><CodAutorizacion>76123456789012</CodAutorizacion>" +
        "<EmisionTipo>CAE</EmisionTipo><FchVto>20260808</FchVto>" +
        "</ResultGet></FECompConsultarResult></FECompConsultarResponse>" +
        "</soap:Body></soap:Envelope>",
    ),
  ]);
  const client = new Wsfev1Client({
    environment: "homologation",
    representedCuit: "30712345678",
    transport,
    tickets: { getTicket: async () => ticket },
    clock,
  });

  const result = await client.consultVoucher({
    pointOfSale: 3,
    voucherType: 6,
    voucherNumber: 143,
  });

  assert.equal(result.found, true);
  assert.equal(result.detail?.result, "A");
  assert.equal(result.detail?.cae, "76123456789012");
  assert.equal(result.detail?.caeExpirationDate, "20260808");
});

test("a transport failure during CAE authorization is marked ambiguous", async () => {
  const transport = new QueueTransport([new Error("socket closed")]);
  const client = new Wsfev1Client({
    environment: "homologation",
    representedCuit: "30712345678",
    transport,
    tickets: { getTicket: async () => ticket },
    clock,
  });

  await assert.rejects(
    client.requestCae({
      pointOfSale: 3,
      voucherType: 6,
      details: [
        {
          concept: 1,
          recipientDocumentType: 99,
          recipientDocumentNumber: "0",
          voucherFrom: 143,
          voucherTo: 143,
          voucherDate: "20260729",
          totalAmount: 1210,
          nonTaxedAmount: 0,
          netAmount: 1000,
          exemptAmount: 0,
          vatAmount: 210,
          taxAmount: 0,
          currencyId: "PES",
          currencyRate: 1,
        },
      ],
    }),
    (error: unknown) =>
      error instanceof ArcaError &&
      error.kind === "TRANSPORT" &&
      error.outcomeAmbiguous,
  );
});
