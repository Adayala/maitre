import type { Station } from "../domain/station.js";
import type { Command } from "../domain/command.js";
import type { KitchenAlert } from "../domain/kitchen-alert.js";

export interface StationRepositoryPort {
  findById(tenantId: string, id: string): Promise<Station | null>;
  findByCode(tenantId: string, branchId: string, code: string): Promise<Station | null>;
  listByBranch(tenantId: string, branchId: string): Promise<Station[]>;
  // Simplified default routing: the first ACTIVE Station of a Branch, ordered by
  // displayOrder then code, is the fallback route when no explicit stationId is
  // supplied (see command.ts / station.ts scope notes).
  firstActiveByBranch(tenantId: string, branchId: string): Promise<Station | null>;
  save(station: Station): Promise<void>;
}

export interface CommandRepositoryPort {
  findById(tenantId: string, id: string): Promise<Command | null>;
  listByStation(tenantId: string, stationId: string): Promise<Command[]>;
  listByOrder(tenantId: string, orderId: string): Promise<Command[]>;
  listByBranch(tenantId: string, branchId: string): Promise<Command[]>;
  // Non-terminal Commands still owned by a Station — used to enforce the
  // deactivate invariant (SPEC-099).
  countNonTerminalByStation(tenantId: string, stationId: string): Promise<number>;
  save(command: Command): Promise<void>;
}

export interface KitchenAlertRepositoryPort {
  findById(tenantId: string, id: string): Promise<KitchenAlert | null>;
  // The one real dedup invariant: is there already an OPEN alert for this
  // (commandId + ruleCode)? (SPEC-101, simplified — no evidence-window fingerprint.)
  findOpenByCommandAndRule(tenantId: string, commandId: string, ruleCode: string): Promise<KitchenAlert | null>;
  listByBranch(tenantId: string, branchId: string): Promise<KitchenAlert[]>;
  save(alert: KitchenAlert): Promise<void>;
}
