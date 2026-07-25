// SPEC-124/128 — CashRegister use cases (create + list + status change).

import { randomUUID } from "node:crypto";
import {
  type CashRegister,
  type CashRegisterStatus,
  assertCashRegisterTransition,
  DuplicateCashRegisterCodeError,
} from "../domain/cash-register.js";
import type { CashRegisterRepositoryPort } from "./ports.js";

export interface RegisterDeps {
  registers: CashRegisterRepositoryPort;
  now?: () => Date;
}

function nowFrom(deps: { now?: () => Date }): Date {
  return (deps.now ?? (() => new Date()))();
}

export interface CreateCashRegisterInput {
  id?: string;
  tenantId: string;
  branchId: string;
  code: string;
  displayName: string;
  allowedCurrencies: string[];
}

export async function createCashRegister(
  deps: RegisterDeps,
  input: CreateCashRegisterInput,
): Promise<CashRegister> {
  const existing = await deps.registers.findByCode(input.tenantId, input.branchId, input.code);
  if (existing) throw new DuplicateCashRegisterCodeError(input.code, input.branchId);

  const now = nowFrom(deps);
  const register: CashRegister = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    branchId: input.branchId,
    code: input.code,
    displayName: input.displayName,
    allowedCurrencies: input.allowedCurrencies,
    status: "ACTIVE",
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };
  await deps.registers.save(register);
  return register;
}

export async function listCashRegisters(
  deps: RegisterDeps,
  tenantId: string,
  branchId: string,
): Promise<CashRegister[]> {
  return deps.registers.listByBranch(tenantId, branchId);
}

export async function changeCashRegisterStatus(
  deps: RegisterDeps,
  input: { tenantId: string; id: string; to: CashRegisterStatus },
): Promise<CashRegister> {
  const register = await deps.registers.findById(input.tenantId, input.id);
  if (!register) throw new Error(`CashRegister ${input.id} not found`);
  assertCashRegisterTransition(register.status, input.to);
  const updated: CashRegister = {
    ...register,
    status: input.to,
    revision: register.revision + 1,
    updatedAt: nowFrom(deps),
  };
  await deps.registers.save(updated);
  return updated;
}
