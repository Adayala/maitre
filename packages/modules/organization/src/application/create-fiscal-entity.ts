import { randomUUID } from "node:crypto";
import { isTenantOperable } from "../domain/tenant.js";
import { normalizeCuit, type FiscalEntity, type TaxCondition } from "../domain/fiscal-entity.js";
import type { FiscalEntityRepositoryPort, TenantRepositoryPort } from "./ports.js";
import { TenantNotOperableError } from "./errors.js";

export class DuplicateCuitError extends Error {
  constructor(cuit: string, tenantId: string) {
    super(`CUIT "${cuit}" already exists for tenant ${tenantId}`);
    this.name = "DuplicateCuitError";
  }
}

export interface CreateFiscalEntityInput {
  tenantId: string;
  cuit: string;
  name: string;
  taxCondition: TaxCondition;
  actorId?: string;
}

export interface CreateFiscalEntityDeps {
  tenants: TenantRepositoryPort;
  fiscalEntities: FiscalEntityRepositoryPort;
  now?: () => Date;
}

// SPEC-003 — invariante 1 (CUIT único por tenant) + tenant operable.
export async function createFiscalEntity(
  deps: CreateFiscalEntityDeps,
  input: CreateFiscalEntityInput,
): Promise<FiscalEntity> {
  const tenant = await deps.tenants.findById(input.tenantId);
  if (!tenant || !isTenantOperable(tenant)) {
    throw new TenantNotOperableError(input.tenantId);
  }

  const cuit = normalizeCuit(input.cuit);
  const existing = await deps.fiscalEntities.findByCuit(input.tenantId, cuit);
  if (existing) {
    throw new DuplicateCuitError(cuit, input.tenantId);
  }

  const now = (deps.now ?? (() => new Date()))();
  const entity: FiscalEntity = {
    id: randomUUID(),
    tenantId: input.tenantId,
    cuit,
    name: input.name,
    status: "ACTIVE",
    taxCondition: input.taxCondition,
    createdAt: now,
    updatedAt: now,
    ...(input.actorId !== undefined
      ? { createdBy: input.actorId, updatedBy: input.actorId }
      : {}),
  };

  await deps.fiscalEntities.save(entity);
  return entity;
}
