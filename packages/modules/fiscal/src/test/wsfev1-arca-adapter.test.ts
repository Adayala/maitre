import assert from "node:assert/strict";
import test from "node:test";
import { ArcaError } from "@maitre/arca-client";
import {
  Wsfev1ArcaAdapter,
  type ArcaAuthorizationRequest,
  type Wsfev1ClientPort,
} from "../index.js";

function request(): ArcaAuthorizationRequest {
  return {
    tenantId: "tenant-1",
    fiscalEntityId: "fiscal-1",
    environment: "HOMOLOGATION",
    pointOfSaleCode: "00003",
    voucherType: "FACTURA_B",
    number: 2,
    cuit: "30712345678",
    currency: "ARS",
    issuedAt: new Date("2026-07-29T15:00:00.000Z"),
    recipientDocumentType: 99,
    recipientDocumentNumber: "0",
    recipientVatConditionId: 5,
    taxableBaseMinorUnits: 100_00,
    nonTaxedBaseMinorUnits: 0,
    exemptBaseMinorUnits: 0,
    taxAmountMinorUnits: 21_00,
    grossMinorUnits: 121_00,
    vatBreakdown: [
      {
        officialCode: "5",
        taxableBaseMinorUnits: 100_00,
        taxAmountMinorUnits: 21_00,
      },
    ],
  };
}

test("adapter uses ARCA official sequence instead of the local candidate", async () => {
  let caeRequest: Parameters<Wsfev1ClientPort["requestCae"]>[0] | undefined;
  const client: Wsfev1ClientPort = {
    getLastAuthorized: async () => ({
      pointOfSale: 3,
      voucherType: 6,
      voucherNumber: 40,
      errors: [],
      events: [],
    }),
    requestCae: async (input) => {
      caeRequest = input;
      return {
        pointOfSale: 3,
        voucherType: 6,
        result: "A",
        details: [
          {
            concept: 1,
            recipientDocumentType: 99,
            recipientDocumentNumber: "0",
            voucherFrom: 41,
            voucherTo: 41,
            voucherDate: "20260729",
            result: "A",
            cae: "76123456789012",
            caeExpirationDate: "20260808",
            observations: [],
          },
        ],
        errors: [],
        events: [],
      };
    },
  };
  const adapter = new Wsfev1ArcaAdapter({ clientFor: () => client });

  const result = await adapter.authorize(request());

  assert.equal(result.outcome, "AUTHORIZED");
  assert.equal(result.assignedNumber, 41);
  assert.equal(caeRequest?.details[0]?.voucherFrom, 41);
  assert.equal(caeRequest?.details[0]?.totalAmount, 121);
  assert.deepEqual(caeRequest?.details[0]?.vat, [
    { id: 5, taxableBase: 100, amount: 21 },
  ]);
});

test("adapter preserves the official number when authorization outcome is ambiguous", async () => {
  const client: Wsfev1ClientPort = {
    getLastAuthorized: async () => ({
      pointOfSale: 3,
      voucherType: 6,
      voucherNumber: 40,
      errors: [],
      events: [],
    }),
    requestCae: async () => {
      throw new ArcaError("timeout", {
        kind: "TRANSPORT",
        retryable: true,
        outcomeAmbiguous: true,
      });
    },
  };
  const adapter = new Wsfev1ArcaAdapter({ clientFor: () => client });

  const result = await adapter.authorize(request());

  assert.equal(result.outcome, "PENDING_RECONCILIATION");
  assert.equal(result.assignedNumber, 41);
  assert.match(result.providerRef ?? "", /:3:6:41$/);
});

test("adapter reconciles an observed authorization with FECompConsultar", async () => {
  const client: Wsfev1ClientPort = {
    getLastAuthorized: async () => ({
      pointOfSale: 3,
      voucherType: 6,
      voucherNumber: 41,
      errors: [],
      events: [],
    }),
    requestCae: async () => {
      throw new Error("not used");
    },
    consultVoucher: async () => ({
      found: true,
      detail: {
        concept: 1,
        recipientDocumentType: 99,
        recipientDocumentNumber: "0",
        voucherFrom: 41,
        voucherTo: 41,
        voucherDate: "20260729",
        result: "A",
        cae: "76123456789012",
        caeExpirationDate: "20260808",
        observations: [],
      },
      errors: [],
      events: [],
    }),
  };
  const adapter = new Wsfev1ArcaAdapter({ clientFor: () => client });

  const result = await adapter.reconcile({
    cuit: "30712345678",
    environment: "HOMOLOGATION",
    pointOfSaleCode: "00003",
    voucherType: "FACTURA_B",
    number: 41,
  });

  assert.equal(result.outcome, "AUTHORIZED");
  assert.equal(result.cae, "76123456789012");
});
