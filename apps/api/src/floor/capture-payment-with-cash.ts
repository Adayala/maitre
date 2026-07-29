import {
  capturePayment,
  type Payment,
} from "@maitre/floor";
import {
  DuplicateSourceReferenceError,
  recordMovement,
  type CashSession,
} from "@maitre/cash";
import type { Container } from "../composition/container.js";

const sourceReference = (paymentId: string) => `FLOOR_PAYMENT:${paymentId}`;

export class CashSessionRequiredError extends Error {
  constructor(reason: "missing" | "ambiguous") {
    super(
      reason === "ambiguous"
        ? "cashSessionId is required because multiple cash sessions can accept this payment"
        : "An OPEN cash session is required to capture a CASH payment",
    );
    this.name = "CashSessionRequiredError";
  }
}

export class CashSessionMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CashSessionMismatchError";
  }
}

export class CashSessionNotFoundError extends Error {
  constructor(cashSessionId: string) {
    super(`CashSession ${cashSessionId} not found`);
    this.name = "CashSessionNotFoundError";
  }
}

export interface CapturePaymentWithCashInput {
  tenantId: string;
  paymentId: string;
  actorId: string;
  correlationId: string;
  cashSessionId?: string;
}

export async function capturePaymentWithCash(
  container: Container,
  input: CapturePaymentWithCashInput,
): Promise<Payment> {
  const payment = await container.payments.findById(
    input.tenantId,
    input.paymentId,
  );
  if (!payment) throw new Error(`Payment ${input.paymentId} not found`);

  if (payment.method !== "CASH") {
    return captureFloorPayment(container, input);
  }

  const session = await resolveCashSession(container, payment, input);
  assertCompatibleSession(payment, session);
  const existingMovement =
    await container.cashMovements.findByRegisterAndSourceReference(
      input.tenantId,
      session.cashRegisterId,
      sourceReference(payment.id),
    );
  if (payment.status === "CAPTURED" && existingMovement) return payment;

  const captured =
    payment.status === "CAPTURED"
      ? payment
      : await captureFloorPayment(container, input);

  try {
    await recordMovement(
      {
        sessions: container.cashSessions,
        movements: container.cashMovements,
        outbox: container.outbox,
      },
      {
        tenantId: input.tenantId,
        cashSessionId: session.id,
        type: "CASH_SALE",
        amountMinorUnits:
          captured.amountMinorUnits + (captured.tipMinorUnits ?? 0),
        currency: captured.currency,
        actor: input.actorId,
        sourceType: "FLOOR_PAYMENT",
        sourceReference: sourceReference(captured.id),
        idempotencyKey: `capture:${captured.id}`,
        correlationId: input.correlationId,
      },
    );
  } catch (error) {
    if (!(error instanceof DuplicateSourceReferenceError)) throw error;
  }
  return captured;
}

async function captureFloorPayment(
  container: Container,
  input: CapturePaymentWithCashInput,
): Promise<Payment> {
  return capturePayment(
    {
      payments: container.payments,
      checks: container.checks,
      outbox: container.outbox,
    },
    {
      tenantId: input.tenantId,
      paymentId: input.paymentId,
      correlationId: input.correlationId,
    },
  );
}

async function resolveCashSession(
  container: Container,
  payment: Payment,
  input: CapturePaymentWithCashInput,
): Promise<CashSession> {
  if (input.cashSessionId) {
    const session = await container.cashSessions.findById(
      input.tenantId,
      input.cashSessionId,
    );
    if (!session) throw new CashSessionNotFoundError(input.cashSessionId);
    return session;
  }

  const registers = await container.cashRegisters.listByBranch(
    input.tenantId,
    payment.branchId,
  );
  const candidates = (
    await Promise.all(
      registers.map((register) =>
        container.cashSessions.findLiveByRegisterAndCurrency(
          input.tenantId,
          register.id,
          payment.currency,
        ),
      ),
    )
  ).filter((session): session is CashSession => session?.status === "OPEN");

  if (candidates.length === 0) throw new CashSessionRequiredError("missing");
  if (candidates.length > 1) throw new CashSessionRequiredError("ambiguous");
  return candidates[0]!;
}

function assertCompatibleSession(
  payment: Payment,
  session: CashSession,
): void {
  if (session.branchId !== payment.branchId) {
    throw new CashSessionMismatchError(
      "Cash session and payment must belong to the same branch",
    );
  }
  if (session.currency !== payment.currency) {
    throw new CashSessionMismatchError(
      "Cash session and payment currencies must match",
    );
  }
  if (session.status !== "OPEN") {
    throw new CashSessionMismatchError(
      `Cash session ${session.id} is not OPEN`,
    );
  }
}
