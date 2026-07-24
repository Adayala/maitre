// SPEC-070 — CancellationPolicy domain model.
//
// SCOPE NOTE (approved "CRUD simple + invariantes clave" decision): the spec
// models a policy versioned per branch/channel with effective intervals and
// an override workflow (CancellationOverride entity). This implementation
// is a single fixed record per tenant (not versioned, not branch/channel
// scoped) with a basic hours-before-start cutoff and a free-text
// feeDescription. Reservation just references the policy id — there is no
// snapshot-freeze-at-confirm mechanics and no CancellationOverride entity.
// I0 never charges a penalty automatically (matches spec).

export interface CancellationPolicy {
  id: string;
  tenantId: string;
  name: string;
  hoursBeforeStartCutoff: number;
  feeDescription?: string;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CancellationEvaluation {
  allowed: boolean;
  withinFreeCancellationWindow: boolean;
  reason: string;
}

// Pure evaluation: given a policy, the reservation startAt and asOf, tells
// whether cancellation is inside the free-cancellation window. I0 never
// blocks cancellation outright (allowed is always true) — it only reports
// the classification for informational purposes, per spec ("I0 nunca cobra
// penalidad automáticamente").
export function evaluateCancellation(
  policy: CancellationPolicy | null,
  startAt: Date,
  asOf: Date,
): CancellationEvaluation {
  if (!policy) {
    return { allowed: true, withinFreeCancellationWindow: true, reason: "NO_POLICY" };
  }
  const cutoffMs = policy.hoursBeforeStartCutoff * 60 * 60 * 1000;
  const withinFreeCancellationWindow = startAt.getTime() - asOf.getTime() >= cutoffMs;
  return {
    allowed: true,
    withinFreeCancellationWindow,
    reason: withinFreeCancellationWindow ? "WITHIN_WINDOW" : "PAST_CUTOFF",
  };
}
