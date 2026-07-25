import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FakeCashRegisterRepository,
  FakeCashSessionRepository,
  FakeCashMovementRepository,
  FakeCashReconciliationRepository,
  FakeDiscountRepository,
  FakeDiscountApplicationRepository,
  FakeOutboxRepository,
} from "./fakes.js";
import { createCashRegister } from "../application/register-commands.js";
import {
  openSession,
  beginCloseSession,
  closeSession,
  suspendSession,
  resumeSession,
} from "../application/session-commands.js";
import {
  recordMovement,
  compensateMovement,
  DuplicateSourceReferenceError,
  CurrencyMismatchError,
  SessionNotAcceptingMovementsError,
} from "../application/movement-commands.js";
import {
  recordCounts,
  submitReconciliation,
  approveReconciliation,
  rejectReconciliation,
  getExpectedSummary,
} from "../application/reconciliation-commands.js";
import {
  createDiscount,
  publishDiscount,
  deactivateDiscount,
  evaluateDiscount,
  applyDiscount,
} from "../application/discount-commands.js";
import { SessionAlreadyOpenError } from "../domain/cash-session.js";
import { DiscountNotPublishedError, computeAppliedAmountMinorUnits } from "../domain/discount.js";
import { calculateDailySettlement } from "../domain/daily-settlement.js";

function deps() {
  return {
    registers: new FakeCashRegisterRepository(),
    sessions: new FakeCashSessionRepository(),
    movements: new FakeCashMovementRepository(),
    reconciliations: new FakeCashReconciliationRepository(),
    discounts: new FakeDiscountRepository(),
    applications: new FakeDiscountApplicationRepository(),
    outbox: new FakeOutboxRepository(),
  };
}

async function seedRegister(d: ReturnType<typeof deps>) {
  return createCashRegister(d, {
    tenantId: "t1",
    branchId: "b1",
    code: "CAJA-1",
    displayName: "Caja 1",
    allowedCurrencies: ["ARS", "USD"],
  });
}

async function seedOpenSession(d: ReturnType<typeof deps>, opening = 100000) {
  const register = await seedRegister(d);
  const session = await openSession(d, {
    tenantId: "t1",
    cashRegisterId: register.id,
    currency: "ARS",
    businessDate: "2026-07-25",
    timezone: "America/Argentina/Buenos_Aires",
    openingAmountMinorUnits: opening,
    openedBy: "u-cashier",
  });
  return { register, session };
}

test("register: duplicate code per branch rejected", async () => {
  const d = deps();
  await seedRegister(d);
  await assert.rejects(() => seedRegister(d), /already exists/);
});

test("session: only one OPEN/CLOSING per register+currency", async () => {
  const d = deps();
  const { register } = await seedOpenSession(d);
  await assert.rejects(
    () =>
      openSession(d, {
        tenantId: "t1",
        cashRegisterId: register.id,
        currency: "ARS",
        businessDate: "2026-07-25",
        timezone: "America/Argentina/Buenos_Aires",
        openingAmountMinorUnits: 0,
        openedBy: "u2",
      }),
    SessionAlreadyOpenError,
  );
  // A different currency on the same register is allowed.
  const usd = await openSession(d, {
    tenantId: "t1",
    cashRegisterId: register.id,
    currency: "USD",
    businessDate: "2026-07-25",
    timezone: "America/Argentina/Buenos_Aires",
    openingAmountMinorUnits: 0,
    openedBy: "u2",
  });
  assert.equal(usd.currency, "USD");
});

test("session: rejects currency not allowed by register", async () => {
  const d = deps();
  const register = await seedRegister(d);
  await assert.rejects(
    () =>
      openSession(d, {
        tenantId: "t1",
        cashRegisterId: register.id,
        currency: "EUR",
        businessDate: "2026-07-25",
        timezone: "TZ",
        openingAmountMinorUnits: 0,
        openedBy: "u",
      }),
    /not allowed/,
  );
});

test("movement: records IN/OUT, bumps ledger revision, emits event", async () => {
  const d = deps();
  const { session } = await seedOpenSession(d);
  const sale = await recordMovement(d, {
    tenantId: "t1",
    cashSessionId: session.id,
    type: "CASH_SALE",
    amountMinorUnits: 50000,
    currency: "ARS",
    actor: "u-cashier",
  });
  assert.equal(sale.direction, "IN");
  assert.equal(sale.ledgerRevision, 1);
  const refund = await recordMovement(d, {
    tenantId: "t1",
    cashSessionId: session.id,
    type: "CASH_REFUND",
    amountMinorUnits: 20000,
    currency: "ARS",
    actor: "u-cashier",
  });
  assert.equal(refund.direction, "OUT");
  assert.equal(refund.ledgerRevision, 2);
  const events = d.outbox.records.map((r) => r.eventName);
  assert.deepEqual(events, ["cash.cash-movement.recorded.v1", "cash.cash-movement.recorded.v1"]);
});

test("movement: currency mismatch and invalid amount rejected", async () => {
  const d = deps();
  const { session } = await seedOpenSession(d);
  await assert.rejects(
    () => recordMovement(d, { tenantId: "t1", cashSessionId: session.id, type: "CASH_SALE", amountMinorUnits: 100, currency: "USD", actor: "u" }),
    CurrencyMismatchError,
  );
  await assert.rejects(
    () => recordMovement(d, { tenantId: "t1", cashSessionId: session.id, type: "CASH_SALE", amountMinorUnits: -5, currency: "ARS", actor: "u" }),
    /positive integer/,
  );
});

test("movement: ADJUSTMENT requires explicit direction", async () => {
  const d = deps();
  const { session } = await seedOpenSession(d);
  await assert.rejects(
    () => recordMovement(d, { tenantId: "t1", cashSessionId: session.id, type: "ADJUSTMENT", amountMinorUnits: 100, currency: "ARS", actor: "u" }),
    /explicit direction/,
  );
  const adj = await recordMovement(d, {
    tenantId: "t1",
    cashSessionId: session.id,
    type: "ADJUSTMENT",
    amountMinorUnits: 100,
    currency: "ARS",
    actor: "u",
    direction: "OUT",
  });
  assert.equal(adj.direction, "OUT");
});

test("movement: sourceReference dedup per register", async () => {
  const d = deps();
  const { session } = await seedOpenSession(d);
  await recordMovement(d, {
    tenantId: "t1",
    cashSessionId: session.id,
    type: "CASH_SALE",
    amountMinorUnits: 50000,
    currency: "ARS",
    actor: "u",
    sourceReference: "payment-123",
  });
  await assert.rejects(
    () =>
      recordMovement(d, {
        tenantId: "t1",
        cashSessionId: session.id,
        type: "CASH_SALE",
        amountMinorUnits: 50000,
        currency: "ARS",
        actor: "u",
        sourceReference: "payment-123",
      }),
    DuplicateSourceReferenceError,
  );
});

test("movement: compensate creates inverse ADJUSTMENT, never mutates original", async () => {
  const d = deps();
  const { session } = await seedOpenSession(d);
  const sale = await recordMovement(d, {
    tenantId: "t1",
    cashSessionId: session.id,
    type: "CASH_SALE",
    amountMinorUnits: 50000,
    currency: "ARS",
    actor: "u",
  });
  const comp = await compensateMovement(d, { tenantId: "t1", cashMovementId: sale.id, actor: "mgr" });
  assert.equal(comp.type, "ADJUSTMENT");
  assert.equal(comp.direction, "OUT");
  assert.equal(comp.amountMinorUnits, 50000);
  assert.equal(comp.compensatesMovementId, sale.id);
  // Original is unchanged.
  const original = await d.movements.findById("t1", sale.id);
  assert.equal(original!.direction, "IN");
  assert.equal(original!.amountMinorUnits, 50000);
});

test("begin-close blocks ordinary movements but allows CLOSING_COUNT", async () => {
  const d = deps();
  const { session } = await seedOpenSession(d);
  await beginCloseSession(d, { tenantId: "t1", id: session.id });
  await assert.rejects(
    () => recordMovement(d, { tenantId: "t1", cashSessionId: session.id, type: "CASH_SALE", amountMinorUnits: 100, currency: "ARS", actor: "u" }),
    SessionNotAcceptingMovementsError,
  );
  const count = await recordMovement(d, {
    tenantId: "t1",
    cashSessionId: session.id,
    type: "CLOSING_COUNT",
    amountMinorUnits: 130000,
    currency: "ARS",
    actor: "u",
  });
  assert.equal(count.type, "CLOSING_COUNT");
});

test("reconciliation: expected = opening + IN - OUT (CLOSING_COUNT excluded)", async () => {
  const d = deps();
  const { session } = await seedOpenSession(d, 100000);
  await recordMovement(d, { tenantId: "t1", cashSessionId: session.id, type: "CASH_SALE", amountMinorUnits: 50000, currency: "ARS", actor: "u" });
  await recordMovement(d, { tenantId: "t1", cashSessionId: session.id, type: "CASH_REFUND", amountMinorUnits: 20000, currency: "ARS", actor: "u" });
  await recordMovement(d, { tenantId: "t1", cashSessionId: session.id, type: "WITHDRAWAL", amountMinorUnits: 10000, currency: "ARS", actor: "u" });
  await recordMovement(d, { tenantId: "t1", cashSessionId: session.id, type: "CLOSING_COUNT", amountMinorUnits: 999999, currency: "ARS", actor: "u" });

  await beginCloseSession(d, { tenantId: "t1", id: session.id });
  const { reconciliation } = await closeSession(d, { tenantId: "t1", id: session.id, closedBy: "u-cashier" });
  // 100000 + 50000 - 20000 - 10000 = 120000; CLOSING_COUNT excluded.
  assert.equal(reconciliation.expectedMinorUnits, 120000);
  assert.equal(reconciliation.status, "DRAFT");
});

test("reconciliation: full submit/approve flow computes difference and emits reconciled event", async () => {
  const d = deps();
  const { session } = await seedOpenSession(d, 100000);
  await recordMovement(d, { tenantId: "t1", cashSessionId: session.id, type: "CASH_SALE", amountMinorUnits: 50000, currency: "ARS", actor: "u" });
  await beginCloseSession(d, { tenantId: "t1", id: session.id });
  const { reconciliation } = await closeSession(d, { tenantId: "t1", id: session.id, closedBy: "u-cashier" });

  const summary = await getExpectedSummary(d, { tenantId: "t1", id: reconciliation.id });
  assert.equal(summary.expectedMinorUnits, 150000);

  await recordCounts(d, { tenantId: "t1", id: reconciliation.id, countedMinorUnits: 149000 });
  const submitted = await submitReconciliation(d, { tenantId: "t1", id: reconciliation.id });
  assert.equal(submitted.status, "SUBMITTED");
  assert.equal(submitted.differenceMinorUnits, -1000);

  const approved = await approveReconciliation(d, { tenantId: "t1", id: reconciliation.id, approvedBy: "mgr" });
  assert.equal(approved.status, "APPROVED");
  const sessionAfter = await d.sessions.findById("t1", session.id);
  assert.equal(sessionAfter!.status, "RECONCILED");
  const reconciledEvents = d.outbox.records.filter((r) => r.eventName === "cash.cash-session.reconciled.v1");
  assert.equal(reconciledEvents.length, 1);
});

test("reconciliation: reject then re-drive a fresh attempt", async () => {
  const d = deps();
  const { session } = await seedOpenSession(d, 100000);
  await beginCloseSession(d, { tenantId: "t1", id: session.id });
  const { reconciliation } = await closeSession(d, { tenantId: "t1", id: session.id, closedBy: "u" });

  await recordCounts(d, { tenantId: "t1", id: reconciliation.id, countedMinorUnits: 90000 });
  await submitReconciliation(d, { tenantId: "t1", id: reconciliation.id });
  const rejected = await rejectReconciliation(d, { tenantId: "t1", id: reconciliation.id, rejectedBy: "mgr", reason: "recount" });
  assert.equal(rejected.status, "REJECTED");

  // A new attempt: record counts again bumps the attempt counter back to DRAFT.
  const redrive = await recordCounts(d, { tenantId: "t1", id: reconciliation.id, countedMinorUnits: 100000 });
  assert.equal(redrive.status, "DRAFT");
  assert.equal(redrive.attempt, 2);
  const submitted = await submitReconciliation(d, { tenantId: "t1", id: reconciliation.id });
  const approved = await approveReconciliation(d, { tenantId: "t1", id: reconciliation.id, approvedBy: "mgr" });
  assert.equal(approved.status, "APPROVED");
  assert.equal(approved.differenceMinorUnits, 0);
});

test("discount: FIXED and PERCENTAGE calculation caps at eligible base", () => {
  // FIXED below base.
  assert.equal(computeAppliedAmountMinorUnits("FIXED", 30000, 100000), 30000);
  // FIXED above base -> capped.
  assert.equal(computeAppliedAmountMinorUnits("FIXED", 150000, 100000), 100000);
  // PERCENTAGE 10.00% of 100000 = 10000.
  assert.equal(computeAppliedAmountMinorUnits("PERCENTAGE", 1000, 100000), 10000);
  // PERCENTAGE floors: 33.33% of 100 = 33.33 -> 33.
  assert.equal(computeAppliedAmountMinorUnits("PERCENTAGE", 3333, 100), 33);
  // Zero/neg base -> 0.
  assert.equal(computeAppliedAmountMinorUnits("PERCENTAGE", 1000, 0), 0);
});

test("discount: apply only after publish; evaluate is read-only", async () => {
  const d = deps();
  const discount = await createDiscount(d, {
    tenantId: "t1",
    name: "10% off",
    type: "PERCENTAGE",
    value: 1000,
    scope: "ALL",
  });
  // Cannot apply a DRAFT.
  await assert.rejects(
    () => applyDiscount(d, { tenantId: "t1", discountId: discount.id, checkId: "chk-1", eligibleBaseMinorUnits: 100000, currency: "ARS", actorRef: "u" }),
    DiscountNotPublishedError,
  );

  const evaluated = await evaluateDiscount(d, { tenantId: "t1", id: discount.id, eligibleBaseMinorUnits: 100000, currency: "ARS" });
  assert.equal(evaluated.appliedAmountMinorUnits, 10000);
  // Evaluate wrote nothing.
  assert.equal((await d.discounts.findById("t1", discount.id))!.status, "DRAFT");

  const published = await publishDiscount(d, { tenantId: "t1", id: discount.id });
  assert.equal(published.status, "PUBLISHED");
  const application = await applyDiscount(d, {
    tenantId: "t1",
    discountId: discount.id,
    checkId: "chk-1",
    eligibleBaseMinorUnits: 100000,
    currency: "ARS",
    actorRef: "u",
  });
  assert.equal(application.appliedAmountMinorUnits, 10000);
  assert.equal(application.discountVersion, published.revision);

  // Published discounts cannot be re-published; only deactivated.
  const deactivated = await deactivateDiscount(d, { tenantId: "t1", id: discount.id });
  assert.equal(deactivated.status, "DEACTIVATED");
});

test("daily settlement: aggregates openings, movements and differences per day", async () => {
  const d = deps();
  // Session A: opening 100000, sale 50000 -> expected 150000, counted 150000.
  const { session: a } = await seedOpenSession(d, 100000);
  await recordMovement(d, { tenantId: "t1", cashSessionId: a.id, type: "CASH_SALE", amountMinorUnits: 50000, currency: "ARS", actor: "u" });
  // Session B on a second register: opening 0, deposit 20000 OUT -> expected -20000.
  const registerB = await createCashRegister(d, { tenantId: "t1", branchId: "b1", code: "CAJA-2", displayName: "Caja 2", allowedCurrencies: ["ARS"] });
  const b = await openSession(d, {
    tenantId: "t1",
    cashRegisterId: registerB.id,
    currency: "ARS",
    businessDate: "2026-07-25",
    timezone: "TZ",
    openingAmountMinorUnits: 0,
    openedBy: "u",
  });
  await recordMovement(d, { tenantId: "t1", cashSessionId: b.id, type: "DEPOSIT", amountMinorUnits: 20000, currency: "ARS", actor: "u" });

  const sessions = await d.sessions.listByBranchAndBusinessDate("t1", "b1", "2026-07-25", "ARS");
  const movements = await d.movements.listByBranchAndSessions("t1", sessions.map((s) => s.id));

  const settlement = calculateDailySettlement({
    tenantId: "t1",
    branchId: "b1",
    businessDate: "2026-07-25",
    timezone: "TZ",
    currency: "ARS",
    sessions,
    movements,
    reconciliations: [{ cashSessionId: a.id, countedMinorUnits: 150000 }],
  });

  assert.equal(settlement.sessionCount, 2);
  assert.equal(settlement.openingsMinorUnits, 100000);
  assert.equal(settlement.expectedMinorUnits, 130000); // 150000 + (-20000)
  assert.equal(settlement.movementsByType["CASH_SALE"], 50000);
  assert.equal(settlement.movementsByType["DEPOSIT"], -20000);
  // Only session A counted: counted 150000, its expected 150000 -> diff 0.
  assert.equal(settlement.countedMinorUnits, 150000);
  assert.equal(settlement.differenceMinorUnits, 0);
});
