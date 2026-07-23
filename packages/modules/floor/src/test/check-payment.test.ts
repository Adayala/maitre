import { test } from "node:test";
import assert from "node:assert/strict";
import {
  openVisit,
  createCheck,
  addCheckLine,
  requestPaymentCheck,
  settleCheck,
  createPayment,
  capturePayment,
  refundPayment,
  CheckNotBalancedError,
  PaymentExceedsBalanceError,
} from "../index.js";
import {
  FakeVisitRepository,
  FakeOccupancyRepository,
  FakeCheckRepository,
  FakePaymentRepository,
  FakeOutboxRepository,
} from "./fakes.js";

function deps() {
  return {
    visits: new FakeVisitRepository(),
    occupancies: new FakeOccupancyRepository(),
    checks: new FakeCheckRepository(),
    payments: new FakePaymentRepository(),
    outbox: new FakeOutboxRepository(),
  };
}

test("Check settle requires balance zero, then Payment capture/refund flow", async () => {
  const d = deps();
  const visit = await openVisit(d, { tenantId: "t1", branchId: "b1", tableIds: ["table-1"], guestCount: 2 });
  const check = await createCheck(d, { tenantId: "t1", visitId: visit.id, currency: "ARS" });
  const withLine = await addCheckLine(d, {
    tenantId: "t1",
    checkId: check.id,
    description: "Empanadas",
    amountMinorUnits: 1000,
  });
  assert.equal(withLine.lines.length, 1);

  await requestPaymentCheck(d, { tenantId: "t1", checkId: check.id });

  await assert.rejects(() => settleCheck(d, { tenantId: "t1", checkId: check.id }), CheckNotBalancedError);

  const payment = await createPayment(d, {
    tenantId: "t1",
    branchId: "b1",
    checkId: check.id,
    amountMinorUnits: 1000,
    currency: "ARS",
    method: "CASH",
    idempotencyKey: "idem-1",
  });
  assert.equal(payment.status, "PENDING");

  const captured = await capturePayment(d, { tenantId: "t1", paymentId: payment.id });
  assert.equal(captured.status, "CAPTURED");
  assert.equal(d.outbox.records.some((r) => r.eventName === "payment.captured.v1"), true);

  const settled = await settleCheck(d, { tenantId: "t1", checkId: check.id });
  assert.equal(settled.status, "SETTLED");

  const refunded = await refundPayment(d, { tenantId: "t1", paymentId: payment.id, amountMinorUnits: 500 });
  assert.equal(refunded.refund?.status, "SUCCEEDED");
  assert.equal(refunded.refund?.amountMinorUnits, 500);
});

test("Payment capture cannot exceed Check balance", async () => {
  const d = deps();
  const visit = await openVisit(d, { tenantId: "t1", branchId: "b1", tableIds: ["table-1"], guestCount: 2 });
  const check = await createCheck(d, { tenantId: "t1", visitId: visit.id, currency: "ARS" });
  await addCheckLine(d, { tenantId: "t1", checkId: check.id, description: "Item", amountMinorUnits: 500 });

  const payment = await createPayment(d, {
    tenantId: "t1",
    branchId: "b1",
    checkId: check.id,
    amountMinorUnits: 999999,
    currency: "ARS",
    method: "CARD",
    idempotencyKey: "idem-2",
  });

  await assert.rejects(() => capturePayment(d, { tenantId: "t1", paymentId: payment.id }), PaymentExceedsBalanceError);
});

test("createPayment is idempotent on idempotencyKey", async () => {
  const d = deps();
  const visit = await openVisit(d, { tenantId: "t1", branchId: "b1", tableIds: ["table-1"], guestCount: 2 });
  const check = await createCheck(d, { tenantId: "t1", visitId: visit.id, currency: "ARS" });

  const input = {
    tenantId: "t1",
    branchId: "b1",
    checkId: check.id,
    amountMinorUnits: 100,
    currency: "ARS",
    method: "CASH" as const,
    idempotencyKey: "idem-x",
  };
  const p1 = await createPayment(d, input);
  const p2 = await createPayment(d, input);
  assert.equal(p1.id, p2.id);
});
