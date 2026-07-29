import { chmod, readFile, writeFile } from "node:fs/promises";
import {
  FetchArcaHttpTransport,
  ForgeCmsSigner,
  WsaaClient,
  Wsfev1Client,
} from "../dist/index.js";

const [cuit, certificatePath, privateKeyPath] = process.argv.slice(2);
if (!cuit || !certificatePath || !privateKeyPath) {
  throw new Error(
    "Usage: node homologation-smoke.mjs <cuit> <certificate.pem> <private-key.pem>",
  );
}

const [certificatePem, privateKeyPem] = await Promise.all([
  readFile(certificatePath, "utf8"),
  readFile(privateKeyPath, "utf8"),
]);
const ticketCachePath = `${privateKeyPath}.wsfe-ticket.json`;
const fileTicketCache = {
  async get() {
    try {
      const stored = JSON.parse(await readFile(ticketCachePath, "utf8"));
      return {
        token: stored.token,
        sign: stored.sign,
        generationTime: new Date(stored.generationTime),
        expirationTime: new Date(stored.expirationTime),
      };
    } catch (error) {
      if (error && typeof error === "object" && error.code === "ENOENT") return null;
      throw error;
    }
  },
  async set(_key, ticket) {
    await writeFile(
      ticketCachePath,
      JSON.stringify({
        token: ticket.token,
        sign: ticket.sign,
        generationTime: ticket.generationTime.toISOString(),
        expirationTime: ticket.expirationTime.toISOString(),
      }),
      { mode: 0o600 },
    );
    await chmod(ticketCachePath, 0o600);
  },
};
const transport = new FetchArcaHttpTransport({ timeoutMs: 20_000 });
const wsaa = new WsaaClient({
  environment: "homologation",
  representedCuit: cuit,
  transport,
  signer: new ForgeCmsSigner(),
  cache: fileTicketCache,
  credentials: {
    async getCredentials() {
      return { representedCuit: cuit, certificatePem, privateKeyPem };
    },
  },
});
const wsfe = new Wsfev1Client({
  environment: "homologation",
  representedCuit: cuit,
  transport,
  tickets: wsaa,
});

const ticket = await wsaa.getTicket();
const health = await wsfe.health();
const [voucherTypes, recipientVatConditions, lastInvoiceB] = await Promise.all([
  wsfe.getParameters("voucher-types"),
  wsfe.getParameters("recipient-vat-conditions"),
  wsfe.getLastAuthorized({ pointOfSale: 1, voucherType: 6 }),
]);

console.log(
  JSON.stringify(
    {
      environment: "homologation",
      representedCuit: cuit,
      ticket: {
        acquired: true,
        generationTime: ticket.generationTime.toISOString(),
        expirationTime: ticket.expirationTime.toISOString(),
      },
      wsfev1: health,
      parameters: {
        voucherTypeCount: voucherTypes.length,
        recipientVatConditionCount: recipientVatConditions.length,
      },
      numberingProbe: {
        pointOfSale: lastInvoiceB.pointOfSale,
        voucherType: lastInvoiceB.voucherType,
        lastAuthorized: lastInvoiceB.voucherNumber,
        errors: lastInvoiceB.errors,
        events: lastInvoiceB.events,
      },
    },
    null,
    2,
  ),
);
