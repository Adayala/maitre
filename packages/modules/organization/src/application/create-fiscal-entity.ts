import { randomUUID } from "node:crypto";
import { isTenantOperable } from "../domain/tenant.js";
import { normalizeCuit, type FiscalEntity, type TaxCondition } from "../domain/fiscal-entity.js";
import type { FiscalEntityRepositoryPort, TenantRepositoryPort } from "./ports.js";
import { TenantNotOperableError } from "./errors.js";
import type { OutboxPort } from "./outbox.js";
import { fiscalEntityCreatedEvent } from "./events.js";

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
  legalAddress?: string;
  fiscalAddress?: string;
  activityCode?: string;
  createIdempotencyKey?: string;
  actorId?: string;
  correlationId?: string;
}

export interface CreateFiscalEntityDeps {
  tenants: TenantRepositoryPort;
  fiscalEntities: FiscalEntityRepositoryPort;
  outbox: OutboxPort;
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

  if (input.createIdempotencyKey) {
    const replay = await deps.fiscalEntities.findByCreateIdempotencyKey(
      input.tenantId,
      input.createIdempotencyKey,
    );
    if (replay) return replay;
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
    ...(input.legalAddress !== undefined ? { legalAddress: input.legalAddress } : {}),
    ...(input.fiscalAddress !== undefined ? { fiscalAddress: input.fiscalAddress } : {}),
    ...(input.activityCode !== undefined ? { activityCode: input.activityCode } : {}),
    ...(input.createIdempotencyKey !== undefined
      ? { createIdempotencyKey: input.createIdempotencyKey }
      : {}),
    status: "ACTIVE",
    taxCondition: input.taxCondition,
    createdAt: now,
    updatedAt: now,
    ...(input.actorId !== undefined
      ? { createdBy: input.actorId, updatedBy: input.actorId }
      : {}),
  };

  await deps.fiscalEntities.save(entity);
  await deps.outbox.append(fiscalEntityCreatedEvent(entity, input.correlationId ?? randomUUID()));
  return entity;
}
