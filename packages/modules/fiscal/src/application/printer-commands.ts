// SPEC-139/146 — FiscalPrinter use cases: register, list, activate, test (no-op),
// retire. `test` returns a canned success and does NOT touch real hardware/SDK.

import { randomUUID } from "node:crypto";
import {
  type FiscalPrinter,
  type FiscalPrinterStatus,
  assertPrinterTransition,
} from "../domain/fiscal-printer.js";
import type { FiscalPrinterRepositoryPort } from "./ports.js";

export interface PrinterDeps {
  printers: FiscalPrinterRepositoryPort;
  now?: () => Date;
}

function nowFrom(deps: { now?: () => Date }): Date {
  return (deps.now ?? (() => new Date()))();
}

export interface RegisterPrinterInput {
  id?: string;
  tenantId: string;
  branchId: string;
  provider: string;
  model: string;
  deviceId: string;
  capabilities: string[];
  configSecretRef?: string;
}

export async function registerPrinter(deps: PrinterDeps, input: RegisterPrinterInput): Promise<FiscalPrinter> {
  const now = nowFrom(deps);
  const printer: FiscalPrinter = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    branchId: input.branchId,
    provider: input.provider,
    model: input.model,
    deviceId: input.deviceId,
    capabilities: input.capabilities,
    configSecretRef: input.configSecretRef ?? null,
    configVersion: 1,
    healthSnapshot: null,
    status: "ACTIVE",
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };
  await deps.printers.save(printer);
  return printer;
}

export async function listPrinters(deps: PrinterDeps, tenantId: string, branchId: string): Promise<FiscalPrinter[]> {
  return deps.printers.listByBranch(tenantId, branchId);
}

async function transitionPrinter(deps: PrinterDeps, tenantId: string, id: string, to: FiscalPrinterStatus): Promise<FiscalPrinter> {
  const printer = await deps.printers.findById(tenantId, id);
  if (!printer) throw new Error(`FiscalPrinter ${id} not found`);
  assertPrinterTransition(printer.status, to);
  const updated: FiscalPrinter = { ...printer, status: to, revision: printer.revision + 1, updatedAt: nowFrom(deps) };
  await deps.printers.save(updated);
  return updated;
}

export function activatePrinter(deps: PrinterDeps, input: { tenantId: string; id: string }): Promise<FiscalPrinter> {
  return transitionPrinter(deps, input.tenantId, input.id, "ACTIVE");
}

export function retirePrinter(deps: PrinterDeps, input: { tenantId: string; id: string }): Promise<FiscalPrinter> {
  return transitionPrinter(deps, input.tenantId, input.id, "RETIRED");
}

export interface PrinterTestResult {
  printerId: string;
  ok: true;
  simulated: true;
  message: string;
}

// SPEC-146 test — a NO-OP that stamps a canned health snapshot and returns
// success. No device handshake, no SDK, no real probe (deferred).
export async function testPrinter(deps: PrinterDeps, input: { tenantId: string; id: string }): Promise<PrinterTestResult> {
  const printer = await deps.printers.findById(input.tenantId, input.id);
  if (!printer) throw new Error(`FiscalPrinter ${input.id} not found`);
  const now = nowFrom(deps);
  const updated: FiscalPrinter = {
    ...printer,
    healthSnapshot: { checkedAt: now, ok: true, detail: "simulated no-op test" },
    updatedAt: now,
    revision: printer.revision + 1,
  };
  await deps.printers.save(updated);
  return { printerId: printer.id, ok: true, simulated: true, message: "Simulated printer test — no real hardware contacted" };
}
