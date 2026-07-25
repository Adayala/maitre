import type { BreakFindingReasonCode } from "../domain/break-log.js";

export type BreakClockOutPolicyMode = "REJECT" | "AUTO_CLOSE";

export interface BreakClockOutPolicy {
  mode: BreakClockOutPolicyMode;
}

export const OPEN_BREAK_REQUIRES_RESOLUTION_REASON_CODE: BreakFindingReasonCode =
  "OPEN_BREAK_REQUIRES_RESOLUTION";

export const AUTO_CLOSED_ON_CLOCK_OUT_REASON_CODE: BreakFindingReasonCode =
  "AUTO_CLOSED_ON_CLOCK_OUT";

export function resolveBreakClockOutPolicy(laborPolicyVersion: string): BreakClockOutPolicy {
  const mode: BreakClockOutPolicyMode = laborPolicyVersion.includes("AUTO_CLOSE_BREAK_ON_CLOCK_OUT")
    ? "AUTO_CLOSE"
    : "REJECT";
  return { mode };
}

export function shouldAutoCloseBreakOnClockOut(laborPolicyVersion: string): boolean {
  return resolveBreakClockOutPolicy(laborPolicyVersion).mode === "AUTO_CLOSE";
}
