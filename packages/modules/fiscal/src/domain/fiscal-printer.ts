// SPEC-139 — FiscalPrinter. An optional per-branch adapter/capability. This is a
// simple CRUD entity: it is NOT the authority for Invoice numbering or ARCA
// authorization and never hard-blocks emission.
//
// DEFERRED (documented): no real hardware/SDK integration. `configSecretRef` is
// an opaque placeholder string (no secret material lives here). `test` is a
// no-op that returns a canned success — there is no device handshake, no health
// probe, no pending/failed-job orchestration.

export type FiscalPrinterStatus = "ACTIVE" | "DEGRADED" | "OFFLINE" | "RETIRED";

export interface FiscalPrinterHealthSnapshot {
  checkedAt: Date;
  ok: boolean;
  detail?: string | null;
}

export interface FiscalPrinter {
  id: string;
  tenantId: string;
  branchId: string;
  provider: string;
  model: string;
  deviceId: string;
  capabilities: string[];
  configSecretRef?: string | null;
  configVersion: number;
  healthSnapshot?: FiscalPrinterHealthSnapshot | null;
  status: FiscalPrinterStatus;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<FiscalPrinterStatus, FiscalPrinterStatus[]> = {
  ACTIVE: ["DEGRADED", "OFFLINE", "RETIRED"],
  DEGRADED: ["ACTIVE", "OFFLINE", "RETIRED"],
  OFFLINE: ["ACTIVE", "DEGRADED", "RETIRED"],
  RETIRED: [],
};

export class InvalidFiscalPrinterTransitionError extends Error {
  constructor(from: FiscalPrinterStatus, to: FiscalPrinterStatus) {
    super(`FiscalPrinter cannot transition from ${from} to ${to}`);
    this.name = "InvalidFiscalPrinterTransitionError";
  }
}

export function assertPrinterTransition(from: FiscalPrinterStatus, to: FiscalPrinterStatus): void {
  if (!allowedTransitions[from].includes(to)) {
    throw new InvalidFiscalPrinterTransitionError(from, to);
  }
}
