// Client-side mirrors of the Kitchen domain shapes served by the API.
// Only the fields the KDS UI consumes are declared. Kept in sync by hand with
// packages/modules/kitchen/src/domain/{command,station,kitchen-alert}.ts.

export type CommandStatus =
  | "RECEIVED"
  | "CLAIMED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export interface CommandPayload {
  displayName: string;
  quantity: number;
  modifierSummary?: string;
  notes?: string;
  allergenFlags: string[];
}

export interface Command {
  id: string;
  tenantId: string;
  branchId: string;
  stationId: string;
  status: CommandStatus;
  priority: number;
  ownerActorRef?: string | null;
  payload: CommandPayload;
  cancelReason?: string | null;
  receivedAt: string;
  claimedAt?: string | null;
  startedAt?: string | null;
  readyAt?: string | null;
}

export type StationStatus = "ACTIVE" | "INACTIVE";

export interface Station {
  id: string;
  tenantId: string;
  branchId: string;
  code: string;
  displayName: string;
  capabilities: string[];
  status: StationStatus;
  displayOrder: number;
}

export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH";
export type AlertStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED" | "ESCALATED";

export interface KitchenAlert {
  id: string;
  branchId: string;
  stationId?: string | null;
  commandId: string;
  ruleCode: string;
  severity: AlertSeverity;
  status: AlertStatus;
  openedAt: string;
}

// GET /v1/kitchen/stations/:id/production-queue payload (SPEC-100/104): a
// computed read model, not a bare list — commands are pre-ordered by the server.
export interface ProductionQueue {
  stationId: string;
  asOf: string;
  commands: Command[];
}

export interface ApiData<T> {
  data: T;
}
