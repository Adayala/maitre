// SPEC-127/131 — Discount + DiscountApplication use cases: create, publish,
// deactivate, evaluate (read-only), apply.

import { randomUUID } from "node:crypto";
import {
  type Discount,
  type DiscountType,
  assertDiscountTransition,
  assertValidDiscountValue,
  computeAppliedAmountMinorUnits,
  DiscountNotPublishedError,
  InvalidDiscountValueError,
} from "../domain/discount.js";
import {
  type DiscountApplication,
  assertApplicationTarget,
} from "../domain/discount-application.js";
import type {
  DiscountRepositoryPort,
  DiscountApplicationRepositoryPort,
} from "./ports.js";

export interface DiscountDeps {
  discounts: DiscountRepositoryPort;
  now?: () => Date;
}

function nowFrom(deps: { now?: () => Date }): Date {
  return (deps.now ?? (() => new Date()))();
}

async function loadDiscount(deps: DiscountDeps, tenantId: string, id: string): Promise<Discount> {
  const discount = await deps.discounts.findById(tenantId, id);
  if (!discount) throw new Error(`Discount ${id} not found`);
  return discount;
}

export interface CreateDiscountInput {
  id?: string;
  tenantId: string;
  name: string;
  type: DiscountType;
  value: number;
  scope: string;
  validFrom?: Date;
  validUntil?: Date;
}

export async function createDiscount(deps: DiscountDeps, input: CreateDiscountInput): Promise<Discount> {
  assertValidDiscountValue(input.type, input.value);
  const now = nowFrom(deps);
  const discount: Discount = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    name: input.name,
    type: input.type,
    value: input.value,
    scope: input.scope,
    status: "DRAFT",
    revision: 1,
    createdAt: now,
    updatedAt: now,
    validFrom: input.validFrom ?? null,
    validUntil: input.validUntil ?? null,
  };
  await deps.discounts.save(discount);
  return discount;
}

export async function listDiscounts(deps: DiscountDeps, tenantId: string): Promise<Discount[]> {
  return deps.discounts.listByTenant(tenantId);
}

// POST /publish — DRAFT -> PUBLISHED. Freezes the policy (only deactivate
// remains). Bumps the revision, which becomes the frozen version referenced by
// applications.
export async function publishDiscount(
  deps: DiscountDeps,
  input: { tenantId: string; id: string },
): Promise<Discount> {
  const discount = await loadDiscount(deps, input.tenantId, input.id);
  assertDiscountTransition(discount.status, "PUBLISHED");
  const now = nowFrom(deps);
  const updated: Discount = {
    ...discount,
    status: "PUBLISHED",
    revision: discount.revision + 1,
    updatedAt: now,
  };
  await deps.discounts.save(updated);
  return updated;
}

export async function deactivateDiscount(
  deps: DiscountDeps,
  input: { tenantId: string; id: string },
): Promise<Discount> {
  const discount = await loadDiscount(deps, input.tenantId, input.id);
  assertDiscountTransition(discount.status, "DEACTIVATED");
  const now = nowFrom(deps);
  const updated: Discount = {
    ...discount,
    status: "DEACTIVATED",
    revision: discount.revision + 1,
    updatedAt: now,
  };
  await deps.discounts.save(updated);
  return updated;
}

export interface DiscountEvaluation {
  discountId: string;
  discountVersion: number;
  type: DiscountType;
  eligibleBaseMinorUnits: number;
  appliedAmountMinorUnits: number;
  currency: string;
}

// GET/POST evaluate — read-only. Returns what the applied amount WOULD be for a
// given discount + eligible base. Writes no state and reserves no usage.
export async function evaluateDiscount(
  deps: DiscountDeps,
  input: { tenantId: string; id: string; eligibleBaseMinorUnits: number; currency: string },
): Promise<DiscountEvaluation> {
  const discount = await loadDiscount(deps, input.tenantId, input.id);
  const applied = computeAppliedAmountMinorUnits(
    discount.type,
    discount.value,
    input.eligibleBaseMinorUnits,
  );
  return {
    discountId: discount.id,
    discountVersion: discount.revision,
    type: discount.type,
    eligibleBaseMinorUnits: input.eligibleBaseMinorUnits,
    appliedAmountMinorUnits: applied,
    currency: input.currency,
  };
}

export interface ApplyDiscountDeps extends DiscountDeps {
  applications: DiscountApplicationRepositoryPort;
}

export interface ApplyDiscountInput {
  tenantId: string;
  discountId: string;
  orderId?: string;
  checkId?: string;
  eligibleBaseMinorUnits: number;
  currency: string;
  actorRef: string;
  reasonCode?: string;
}

// POST /apply — creates a DiscountApplication record. Only a PUBLISHED discount
// can be applied. The applied amount is computed server-side; a client-supplied
// amount is never trusted.
//
// SCOPE NOTE: this records the application as its own audit trail only; it does
// NOT mutate a Floor Check total (see discount-application.ts — deferred
// Floor/Cash integration).
export async function applyDiscount(
  deps: ApplyDiscountDeps,
  input: ApplyDiscountInput,
): Promise<DiscountApplication> {
  assertApplicationTarget(input.orderId, input.checkId);
  const discount = await loadDiscount(deps, input.tenantId, input.discountId);
  if (discount.status !== "PUBLISHED") {
    throw new DiscountNotPublishedError(discount.id, discount.status);
  }
  if (!Number.isInteger(input.eligibleBaseMinorUnits) || input.eligibleBaseMinorUnits < 0) {
    throw new InvalidDiscountValueError(
      `eligibleBaseMinorUnits ${input.eligibleBaseMinorUnits} must be a non-negative integer`,
    );
  }

  const applied = computeAppliedAmountMinorUnits(
    discount.type,
    discount.value,
    input.eligibleBaseMinorUnits,
  );
  const now = nowFrom(deps);
  const application: DiscountApplication = {
    id: randomUUID(),
    tenantId: input.tenantId,
    discountId: discount.id,
    discountVersion: discount.revision,
    discountType: discount.type,
    eligibleBaseMinorUnits: input.eligibleBaseMinorUnits,
    appliedAmountMinorUnits: applied,
    currency: input.currency,
    actorRef: input.actorRef,
    createdAt: now,
    orderId: input.orderId ?? null,
    checkId: input.checkId ?? null,
    reasonCode: input.reasonCode ?? null,
  };
  await deps.applications.save(application);
  return application;
}
