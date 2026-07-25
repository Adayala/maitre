// SPEC-127 — DiscountApplication domain model (simplified per approved scope).
//
// A DiscountApplication is the recorded fact of a published Discount being
// applied to an Order or Check. `appliedAmountMinorUnits` is always
// server-computed (see computeAppliedAmountMinorUnits in discount.ts) — a
// client-supplied amount is never trusted.
//
// SCOPE NOTES (deferred, documented):
//   - `eligibleBaseMinorUnits` is caller-supplied for now. Real eligibility
//     calculation against the Order/Check lines (exclusions, taxable base, etc.)
//     is deferred.
//   - INTEGRATION GAP: applying a discount records this audit-trail row only; it
//     does NOT mutate the Floor Check total. Floor's Check already carries its
//     own `adjustments` array (from the Floor domain), so double-writing would
//     risk divergence. Wiring a DiscountApplication to actually reduce a Check's
//     total is deferred to a future Floor/Cash integration pass.
//   - Corrections are expressed as a new compensating application (not a
//     destructive edit); the compensating-application flow itself is left for a
//     future pass — the immutable-record shape is in place.

import type { DiscountType } from "./discount.js";

export interface DiscountApplication {
  id: string;
  tenantId: string;
  discountId: string;
  discountVersion: number;
  discountType: DiscountType;
  orderId?: string | null;
  checkId?: string | null;
  eligibleBaseMinorUnits: number;
  appliedAmountMinorUnits: number;
  currency: string;
  actorRef: string;
  reasonCode?: string | null;
  createdAt: Date;
}

export class MissingApplicationTargetError extends Error {
  constructor() {
    super("A DiscountApplication requires at least one of orderId or checkId");
    this.name = "MissingApplicationTargetError";
  }
}

export function assertApplicationTarget(orderId?: string, checkId?: string): void {
  if (!orderId && !checkId) throw new MissingApplicationTargetError();
}
