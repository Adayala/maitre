import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FakeInvoiceRepository,
  FakePointOfSaleRepository,
  FakeTaxRateRepository,
  FakeTemplateRepository,
  FakeOutboxRepository,
} from "./fakes.js";
import { SimulatedArcaAdapter } from "../adapters/simulated-arca-adapter.js";
import { createPointOfSale } from "../application/point-of-sale-commands.js";
import { createTaxRate, publishTaxRate, resolveTaxRateQuery, supersedeTaxRate } from "../application/tax-rate-commands.js";
import {
  createInvoice,
  validateInvoice,
  issueInvoice,
  creditInvoice,
  voidDraftInvoice,
  type InvoiceDeps,
} from "../application/invoice-commands.js";
import { buildInvoiceExportManifest } from "../application/invoice-export.js";
import { createTemplate, publishTemplate } from "../application/template-commands.js";
import { buildFiscalQrCode } from "../domain/fiscal-qr-code.js";
import { OverlappingTaxRateError, NoEffectiveTaxRateError } from "../domain/tax-rate.js";
import { InvalidInvoiceTransitionError, InvoiceNotCreditableError, InvalidInvoiceTemplateTransitionError } from "../index.js";
import { PointOfSaleRegistrationError, assertCanEmit } from "../domain/fiscal-point-of-sale.js";

const NOW = new Date("2026-07-20T12:00:00.000Z");
const clock = () => NOW;
const TENANT = "t1";
const FE = "fe1";

test("production emission requires verified ARCA point-of-sale registration", () => {
  assert.throws(
    () =>
      assertCanEmit(
        {
          id: "pos-prod",
          tenantId: TENANT,
          fiscalEntityId: FE,
          environment: "PRODUCTION",
          officialCode: "1",
          issuingSystem: "WSFEV1",
          registrationStatus: "DECLARED",
          allowedVoucherTypes: ["FACTURA_A"],
          status: "ACTIVE",
          revision: 1,
          createdAt: NOW,
          updatedAt: NOW,
        },
        "FACTURA_A",
      ),
    PointOfSaleRegistrationError,
  );
});

function makeDeps(): InvoiceDeps & { outbox: FakeOutboxRepository; pointsOfSale: FakePointOfSaleRepository } {
  return {
    invoices: new FakeInvoiceRepository(),
    pointsOfSale: new FakePointOfSaleRepository(),
    taxRates: new FakeTaxRateRepository(),
    arca: new SimulatedArcaAdapter({ now: clock }),
    outbox: new FakeOutboxRepository(),
    now: clock,
  } as InvoiceDeps & { outbox: FakeOutboxRepository; pointsOfSale: FakePointOfSaleRepository };
}

async function seedRateAndPos(deps: ReturnType<typeof makeDeps>) {
  const rate = await createTaxRate(deps, {
    jurisdiction: "AR",
    taxType: "IVA",
    officialCode: "5",
    treatment: "TAXED",
    decimalRate: 2100,
    includedInPrice: false,
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    normativeSourceVersion: "AR-IVA-2026",
  });
  await publishTaxRate(deps, { id: rate.id });
  const pos = await createPointOfSale(deps, {
    tenantId: TENANT,
    fiscalEntityId: FE,
    environment: "HOMOLOGATION",
    officialCode: "0001",
    allowedVoucherTypes: ["FACTURA_A", "NOTA_CREDITO_A", "NOTA_DEBITO_A"],
  });
  return { pos };
}

async function seedDraft(deps: ReturnType<typeof makeDeps>, posId: string) {
  return createInvoice(deps, {
    tenantId: TENANT,
    fiscalEntityId: FE,
    environment: "HOMOLOGATION",
    pointOfSaleId: posId,
    voucherType: "FACTURA_A",
    currency: "ARS",
    lines: [{ id: "l1", description: "Item", quantity: 2, unit: "unit", unitNetMinorUnits: 100000 }],
    sourceCheckId: "check-1",
    sourceCheckRevision: 3,
  });
}

test("tax calculation: 21% IVA on 200000 net => 42000 tax, 242000 gross", async () => {
  const deps = makeDeps();
  const { pos } = await seedRateAndPos(deps);
  const invoice = await seedDraft(deps, pos.id);
  assert.equal(invoice.totals.netMinorUnits, 200000);
  assert.equal(invoice.totals.taxableBaseMinorUnits, 200000);
  assert.equal(invoice.totals.taxAmountMinorUnits, 42000);
  assert.equal(invoice.totals.grossMinorUnits, 242000);
  assert.equal(invoice.status, "DRAFT");
  assert.equal(invoice.number, null);
});

test("createInvoice fails closed when no PUBLISHED tax rate is in effect", async () => {
  const deps = makeDeps();
  // POS but no published rate.
  const pos = await createPointOfSale(deps, {
    tenantId: TENANT,
    fiscalEntityId: FE,
    environment: "HOMOLOGATION",
    officialCode: "0002",
    allowedVoucherTypes: ["FACTURA_A"],
  });
  await assert.rejects(() => seedDraft(deps, pos.id), NoEffectiveTaxRateError);
});

test("state machine: DRAFT -> VALIDATED -> AUTHORIZED with fake CAE and number 1", async () => {
  const deps = makeDeps();
  const { pos } = await seedRateAndPos(deps);
  const draft = await seedDraft(deps, pos.id);
  const validated = await validateInvoice(deps, { tenantId: TENANT, id: draft.id });
  assert.equal(validated.status, "VALIDATED");
  assert.ok(deps.outbox.records.some((r) => r.eventName === "fiscal.invoice.validated.v1"));

  const issued = await issueInvoice(deps, { tenantId: TENANT, id: draft.id, cuit: "20111111112" });
  assert.equal(issued.status, "AUTHORIZED");
  assert.equal(issued.number, 1);
  assert.ok(issued.cae && issued.cae.startsWith("SIM"));
  assert.ok(issued.caeExpiresAt instanceof Date);
  assert.ok(deps.outbox.records.some((r) => r.eventName === "fiscal.invoice.authorized.v1"));
});

test("AUTHORIZED invoice is immutable: re-issuing conflicts", async () => {
  const deps = makeDeps();
  const { pos } = await seedRateAndPos(deps);
  const draft = await seedDraft(deps, pos.id);
  await issueInvoice(deps, { tenantId: TENANT, id: draft.id, cuit: "20111111112" });
  await assert.rejects(
    () => issueInvoice(deps, { tenantId: TENANT, id: draft.id, cuit: "20111111112" }),
    InvalidInvoiceTransitionError,
  );
});

test("sequential numbering per (pointOfSale, voucherType): no gaps, no reuse", async () => {
  const deps = makeDeps();
  const { pos } = await seedRateAndPos(deps);
  const first = await issueInvoice(deps, { tenantId: TENANT, id: (await seedDraft(deps, pos.id)).id, cuit: "20111111112" });
  const second = await issueInvoice(deps, { tenantId: TENANT, id: (await seedDraft(deps, pos.id)).id, cuit: "20111111112" });
  const third = await issueInvoice(deps, { tenantId: TENANT, id: (await seedDraft(deps, pos.id)).id, cuit: "20111111112" });
  assert.deepEqual([first.number, second.number, third.number], [1, 2, 3]);
});

test("void-draft is allowed before issue and is terminal", async () => {
  const deps = makeDeps();
  const { pos } = await seedRateAndPos(deps);
  const draft = await seedDraft(deps, pos.id);
  const voided = await voidDraftInvoice(deps, { tenantId: TENANT, id: draft.id });
  assert.equal(voided.status, "VOIDED_DRAFT");
  await assert.rejects(() => issueInvoice(deps, { tenantId: TENANT, id: draft.id, cuit: "20111111112" }), InvalidInvoiceTransitionError);
});

test("credit note links to the original AUTHORIZED invoice without mutating it", async () => {
  const deps = makeDeps();
  const { pos } = await seedRateAndPos(deps);
  const original = await issueInvoice(deps, { tenantId: TENANT, id: (await seedDraft(deps, pos.id)).id, cuit: "20111111112" });
  const note = await creditInvoice(deps, { tenantId: TENANT, id: original.id });
  assert.equal(note.voucherType, "NOTA_CREDITO_A");
  assert.equal(note.linkedInvoiceId, original.id);
  assert.equal(note.status, "DRAFT");
  assert.equal(note.number, null);
  assert.deepEqual(note.totals, original.totals);

  // Original unchanged.
  const reloaded = await deps.invoices.findById(TENANT, original.id);
  assert.equal(reloaded?.status, "AUTHORIZED");
  assert.equal(reloaded?.number, 1);
  assert.equal(reloaded?.linkedInvoiceId, null);

  // The note goes through the same issue/numbering flow (own sequence).
  const issuedNote = await issueInvoice(deps, { tenantId: TENANT, id: note.id, cuit: "20111111112" });
  assert.equal(issuedNote.status, "AUTHORIZED");
  assert.equal(issuedNote.number, 1); // first NOTA_CREDITO_A on this POS
});

test("credit/debit only applies to AUTHORIZED invoices", async () => {
  const deps = makeDeps();
  const { pos } = await seedRateAndPos(deps);
  const draft = await seedDraft(deps, pos.id);
  await assert.rejects(() => creditInvoice(deps, { tenantId: TENANT, id: draft.id }), InvoiceNotCreditableError);
});

test("TaxRate publish rejects overlapping intervals for the same key", async () => {
  const deps = makeDeps();
  const a = await createTaxRate(deps, {
    jurisdiction: "AR",
    taxType: "IVA",
    officialCode: "5",
    treatment: "TAXED",
    decimalRate: 2100,
    includedInPrice: false,
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    normativeSourceVersion: "v1",
  });
  await publishTaxRate(deps, { id: a.id });
  const b = await createTaxRate(deps, {
    jurisdiction: "AR",
    taxType: "IVA",
    officialCode: "5",
    treatment: "TAXED",
    decimalRate: 1050,
    includedInPrice: false,
    effectiveFrom: new Date("2026-06-01T00:00:00.000Z"),
    normativeSourceVersion: "v2",
  });
  await assert.rejects(() => publishTaxRate(deps, { id: b.id }), OverlappingTaxRateError);
});

test("TaxRate resolve fails closed for an unknown key", async () => {
  const deps = makeDeps();
  const res = await resolveTaxRateQuery(deps, { jurisdiction: "AR", taxType: "GANANCIAS", at: NOW });
  assert.equal(res.resolved, null);
});

test("TaxRate supersede + publish with a closed prior interval does not overlap", async () => {
  const deps = makeDeps();
  const a = await createTaxRate(deps, {
    jurisdiction: "AR",
    taxType: "IIBB",
    officialCode: "9",
    treatment: "TAXED",
    decimalRate: 300,
    includedInPrice: false,
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    effectiveTo: new Date("2026-06-01T00:00:00.000Z"),
    normativeSourceVersion: "v1",
  });
  await publishTaxRate(deps, { id: a.id });
  const b = await supersedeTaxRate(deps, {
    supersedesId: a.id,
    jurisdiction: "AR",
    taxType: "IIBB",
    officialCode: "9",
    treatment: "TAXED",
    decimalRate: 350,
    includedInPrice: false,
    effectiveFrom: new Date("2026-06-01T00:00:00.000Z"),
    normativeSourceVersion: "v2",
  });
  const published = await publishTaxRate(deps, { id: b.id });
  assert.equal(published.status, "PUBLISHED");
  assert.equal(published.supersedes, a.id);
});

test("FiscalQrCode payload/hash is deterministic across two calls", async () => {
  const input = {
    cuit: "20111111112",
    voucherType: "FACTURA_A",
    pointOfSaleCode: "0001",
    number: 1,
    amountMinorUnits: 242000,
    currency: "ARS",
    cae: "SIM00000000000001",
    caeExpiresAt: new Date("2026-07-30T12:00:00.000Z"),
    authorizedAt: new Date("2026-07-20T12:00:00.000Z"),
  };
  const a = buildFiscalQrCode(input);
  const b = buildFiscalQrCode({ ...input });
  assert.equal(a.canonicalPayload, b.canonicalPayload);
  assert.equal(a.payloadHash, b.payloadHash);
  assert.equal(a.payloadHash.length, 64);
});

test("invoice export manifest sums authorized totals and lists exceptions", async () => {
  const deps = makeDeps();
  const { pos } = await seedRateAndPos(deps);
  await issueInvoice(deps, { tenantId: TENANT, id: (await seedDraft(deps, pos.id)).id, cuit: "20111111112" });
  await issueInvoice(deps, { tenantId: TENANT, id: (await seedDraft(deps, pos.id)).id, cuit: "20111111112" });
  // A DRAFT (never issued) must appear in exceptions, not in totals.
  await seedDraft(deps, pos.id);

  const manifest = await buildInvoiceExportManifest(deps, {
    tenantId: TENANT,
    fiscalEntityId: FE,
    periodFrom: new Date("2026-07-01T00:00:00.000Z"),
    periodTo: new Date("2026-07-31T23:59:59.000Z"),
  });
  assert.equal(manifest.authorizedCount, 2);
  assert.equal(manifest.grandTotalGrossMinorUnits, 484000);
  assert.equal(manifest.grandTotalTaxMinorUnits, 84000);
  assert.equal(manifest.exceptions.length, 1);
  assert.equal(manifest.presented, false);
  const factA = manifest.totalsByVoucher.find((v) => v.voucherType === "FACTURA_A");
  assert.equal(factA?.count, 2);
});

test("InvoiceTemplate publish freezes and blocks further publish", async () => {
  const deps = { templates: new FakeTemplateRepository(), now: clock };
  const t = await createTemplate(deps, {
    tenantId: TENANT,
    name: "Default",
    channel: "PDF",
    contentRef: "ref-1",
    variableSchemaVersion: 1,
    layoutNormativeVersion: "layout-1",
  });
  const published = await publishTemplate(deps, { tenantId: TENANT, id: t.id, publishedBy: "u1" });
  assert.equal(published.status, "PUBLISHED");
  assert.ok(published.publishedAt);
  await assert.rejects(
    () => publishTemplate(deps, { tenantId: TENANT, id: t.id, publishedBy: "u1" }),
    InvalidInvoiceTemplateTransitionError,
  );
});
