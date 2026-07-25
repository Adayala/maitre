import type { Station } from "../domain/station.js";
import type { Command } from "../domain/command.js";
import type { KitchenAlert } from "../domain/kitchen-alert.js";
import { NON_TERMINAL_STATUSES } from "../domain/command.js";
import type {
  StationRepositoryPort,
  CommandRepositoryPort,
  KitchenAlertRepositoryPort,
} from "../application/ports.js";
import type { OutboxPort, OutboxRecord } from "../application/outbox.js";

export class FakeStationRepository implements StationRepositoryPort {
  private readonly items: Station[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((s) => s.tenantId === tenantId && s.id === id) ?? null;
  }
  async findByCode(tenantId: string, branchId: string, code: string) {
    return this.items.find((s) => s.tenantId === tenantId && s.branchId === branchId && s.code === code) ?? null;
  }
  async listByBranch(tenantId: string, branchId: string) {
    return this.items.filter((s) => s.tenantId === tenantId && s.branchId === branchId);
  }
  async firstActiveByBranch(tenantId: string, branchId: string) {
    return (
      this.items
        .filter((s) => s.tenantId === tenantId && s.branchId === branchId && s.status === "ACTIVE")
        .sort((a, b) => (a.displayOrder !== b.displayOrder ? a.displayOrder - b.displayOrder : a.code < b.code ? -1 : 1))[0] ??
      null
    );
  }
  async save(station: Station) {
    const i = this.items.findIndex((s) => s.id === station.id);
    if (i >= 0) this.items[i] = station;
    else this.items.push(station);
  }
}

export class FakeCommandRepository implements CommandRepositoryPort {
  private readonly items: Command[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((c) => c.tenantId === tenantId && c.id === id) ?? null;
  }
  async listByStation(tenantId: string, stationId: string) {
    return this.items.filter((c) => c.tenantId === tenantId && c.stationId === stationId);
  }
  async listByOrder(tenantId: string, orderId: string) {
    return this.items.filter((c) => c.tenantId === tenantId && c.orderId === orderId);
  }
  async listByBranch(tenantId: string, branchId: string) {
    return this.items.filter((c) => c.tenantId === tenantId && c.branchId === branchId);
  }
  async countNonTerminalByStation(tenantId: string, stationId: string) {
    return this.items.filter(
      (c) => c.tenantId === tenantId && c.stationId === stationId && NON_TERMINAL_STATUSES.includes(c.status),
    ).length;
  }
  async save(command: Command) {
    const i = this.items.findIndex((c) => c.id === command.id);
    if (i >= 0) this.items[i] = command;
    else this.items.push(command);
  }
}

export class FakeKitchenAlertRepository implements KitchenAlertRepositoryPort {
  private readonly items: KitchenAlert[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((a) => a.tenantId === tenantId && a.id === id) ?? null;
  }
  async findOpenByCommandAndRule(tenantId: string, commandId: string, ruleCode: string) {
    return (
      this.items.find(
        (a) =>
          a.tenantId === tenantId &&
          a.commandId === commandId &&
          a.ruleCode === ruleCode &&
          a.status !== "RESOLVED",
      ) ?? null
    );
  }
  async listByBranch(tenantId: string, branchId: string) {
    return this.items.filter((a) => a.tenantId === tenantId && a.branchId === branchId);
  }
  async save(alert: KitchenAlert) {
    const i = this.items.findIndex((a) => a.id === alert.id);
    if (i >= 0) this.items[i] = alert;
    else this.items.push(alert);
  }
}

export class FakeOutboxRepository implements OutboxPort {
  readonly records: OutboxRecord[] = [];
  async append(record: OutboxRecord) {
    this.records.push(record);
  }
}
