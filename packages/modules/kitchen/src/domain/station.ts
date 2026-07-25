// SPEC-099 — Station, a production centre configured per Branch (code unique
// per branch, capabilities, status, display order).
//
// SCOPE NOTE (approved "CRUD simple + invariantes clave" simplification vs.
// SPEC-099's full model): a Station is a plain configuration entity. The
// versioned/published RoutingPolicy (rules with explicit priority + specificity,
// "ambiguous rules fail to publish", frozen routingPolicyRevisionId per Command)
// is DEFERRED. Routing is simplified to: each Command is routed to a Station
// either by an explicit stationId the caller passes, or (if none) to the single
// first-active Station of the Branch (see firstActiveByBranch on the repository
// port). No rule-based auto-routing, no reject-ambiguous-policy validation.
//
// The one real lifecycle invariant kept: a Station cannot be deactivated while it
// still owns non-terminal Commands (enforced in station-commands.ts against the
// Command repository) — the SPEC-099 "inactivar exige cero Commands no terminales
// o transferencia" rule, minus the atomic-transfer alternative.

export type StationStatus = "ACTIVE" | "INACTIVE";

export interface Station {
  id: string;
  tenantId: string;
  brandId: string;
  branchId: string;
  code: string;
  displayName: string;
  capabilities: string[];
  status: StationStatus;
  displayOrder: number;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

export class InvalidStationStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidStationStateError";
  }
}

export class DuplicateStationCodeError extends Error {
  constructor(code: string, branchId: string) {
    super(`Station code "${code}" already exists in branch ${branchId}`);
    this.name = "DuplicateStationCodeError";
  }
}

export function isStationActive(station: Station): boolean {
  return station.status === "ACTIVE";
}
