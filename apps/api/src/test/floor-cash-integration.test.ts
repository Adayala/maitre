import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import {
  DuplicateSourceReferenceError,
  type CashRegister,
  type CashSession,
} from "@maitre/cash";
import type { Check, Payment } from "@maitre/floor";
import { buildContainer, type Container } from "../composition/container.js";
import {
  capturePaymentWithCash,
  CashSessionMismatchError,
  CashSessionNotFoundError,
  CashSessionRequiredError,
} from "../floor/capture-payment-with-cash.js";
import { buildApp } from "../app.js";

const tenantId = "00000000-0000-0000-0000-000000000001";
const branchId = "00000000-0000-0000-0000-000000000003";

async function seedPayment(
  container: Container,
  method: Payment["method"] = "CASH",
  overrides: Partial<Payment> = {},
) {
  const now = new Date("2026-07-29T17:00:00.000Z");
  const check: Check = {
    id: randomUUID(),
    tenantId,
    branchId,
    visitId: randomUUID(),
    currency: "ARS",
    lines: [{ id: randomUUID(), description: "Cena", amountMinorUnits: 1000 }],
    adjustments: [],
    status: "PAYMENT_PENDING",
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };
  const payment: Payment = {
    id: randomUUID(),
    tenantId,
    branchId,
    checkId: check.id,
    amountMinorUnits: 1000,
    tipMinorUnits: 100,
    currency: "ARS",
    method,
    status: "PENDING",
    idempotencyKey: randomUUID(),
    revision: 1,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
  await container.checks.save(check);
  await container.payments.save(payment);
  return payment;
}

async function seedSession(
  container: Container,
  overrides: Partial<CashSession> = {},
) {
  const registers = await container.cashRegisters.listByBranch(
    tenantId,
    branchId,
  );
  const now = new Date("2026-07-29T17:00:00.000Z");
  const session: CashSession = {
    id: randomUUID(),
    tenantId,
    branchId,
    cashRegisterId: registers[0]!.id,
    currency: "ARS",
    businessDate: "2026-07-29",
    timezone: "America/Argentina/Buenos_Aires",
    openingAmountMinorUnits: 0,
    openedAt: now,
    openedBy: "user-test",
    ledgerRevision: 0,
    status: "OPEN",
    suspended: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
  await container.cashSessions.save(session);
  return session;
}

function capture(container: Container, paymentId: string, cashSessionId?: string) {
  return capturePaymentWithCash(container, {
    tenantId,
    paymentId,
    actorId: "user-test",
    correlationId: randomUUID(),
    ...(cashSessionId ? { cashSessionId } : {}),
  });
}

test("rejects a missing payment and CASH capture without a live session", async () => {
  const container = await buildContainer();
  await assert.rejects(
    () => capture(container, randomUUID()),
    /Payment .* not found/,
  );

  const payment = await seedPayment(container);
  await assert.rejects(
    () => capture(container, payment.id),
    (error) =>
      error instanceof CashSessionRequiredError &&
      error.message.includes("OPEN cash session"),
  );
});

test("captures non-CASH without requiring a cash session", async () => {
  const container = await buildContainer();
  const payment = await seedPayment(container, "CARD");
  const captured = await capture(container, payment.id);
  assert.equal(captured.status, "CAPTURED");
  assert.equal(captured.revision, 2);
});

test("requires an explicit session when more than one can accept CASH", async () => {
  const container = await buildContainer();
  const payment = await seedPayment(container);
  await seedSession(container);
  const now = new Date("2026-07-29T17:00:00.000Z");
  const secondRegister: CashRegister = {
    id: randomUUID(),
    tenantId,
    branchId,
    code: "SECOND",
    displayName: "Caja secundaria",
    allowedCurrencies: ["ARS"],
    status: "ACTIVE",
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };
  await container.cashRegisters.save(secondRegister);
  await seedSession(container, { cashRegisterId: secondRegister.id });

  await assert.rejects(
    () => capture(container, payment.id),
    (error) =>
      error instanceof CashSessionRequiredError &&
      error.message.includes("multiple cash sessions"),
  );
});

test("validates an explicitly selected cash session", async () => {
  const container = await buildContainer();
  const payment = await seedPayment(container);

  await assert.rejects(
    () => capture(container, payment.id, randomUUID()),
    (error) => error instanceof CashSessionNotFoundError,
  );

  const wrongBranch = await seedSession(container, { branchId: randomUUID() });
  await assert.rejects(
    () => capture(container, payment.id, wrongBranch.id),
    (error) =>
      error instanceof CashSessionMismatchError &&
      error.message.includes("same branch"),
  );

  const wrongCurrency = await seedSession(container, { currency: "USD" });
  await assert.rejects(
    () => capture(container, payment.id, wrongCurrency.id),
    (error) =>
      error instanceof CashSessionMismatchError &&
      error.message.includes("currencies must match"),
  );

  const closed = await seedSession(container, { status: "CLOSED" });
  await assert.rejects(
    () => capture(container, payment.id, closed.id),
    (error) =>
      error instanceof CashSessionMismatchError &&
      error.message.includes("is not OPEN"),
  );
});

test("returns a CashSession 404 instead of misreporting the Payment", async () => {
  const container = await buildContainer();
  const payment = await seedPayment(container);
  const app = await buildApp(container);
  const response = await app.inject({
    method: "POST",
    url: `/v1/payments/${payment.id}/capture`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { cashSessionId: randomUUID() },
  });

  assert.equal(response.statusCode, 404);
  assert.equal(response.json().title, "CashSession not found");
  await app.close();
});

test("records tip once and returns the captured payment on retry", async () => {
  const container = await buildContainer();
  const payment = await seedPayment(container);
  const session = await seedSession(container);

  const captured = await capture(container, payment.id, session.id);
  assert.equal(captured.status, "CAPTURED");
  const retried = await capture(container, payment.id, session.id);
  assert.equal(retried, captured);

  const movements = await container.cashMovements.listBySession(
    tenantId,
    session.id,
  );
  assert.equal(movements.length, 1);
  assert.equal(movements[0]!.amountMinorUnits, 1100);
});

test("repairs a captured CASH payment whose movement is missing", async () => {
  const container = await buildContainer();
  const payment = await seedPayment(container, "CASH", { status: "CAPTURED" });
  const session = await seedSession(container);

  const recovered = await capture(container, payment.id, session.id);
  assert.equal(recovered.status, "CAPTURED");
  const movements = await container.cashMovements.listBySession(
    tenantId,
    session.id,
  );
  assert.equal(movements.length, 1);
});

test("converges when another writer records the source reference first", async () => {
  const container = await buildContainer();
  const payment = await seedPayment(container);
  const session = await seedSession(container);
  const originalSave = container.cashMovements.save.bind(
    container.cashMovements,
  );
  container.cashMovements.save = async () => {
    throw new DuplicateSourceReferenceError(
      `FLOOR_PAYMENT:${payment.id}`,
      session.cashRegisterId,
    );
  };

  const captured = await capture(container, payment.id, session.id);
  assert.equal(captured.status, "CAPTURED");
  container.cashMovements.save = originalSave;
});
