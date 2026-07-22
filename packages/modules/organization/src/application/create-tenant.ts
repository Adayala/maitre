import { randomUUID } from "node:crypto";
import type { Tenant } from "../domain/tenant.js";
import type { TenantRepositoryPort } from "./ports.js";
import type { OutboxPort } from "./outbox.js";
import { tenantCreatedEvent } from "./events.js";

export interface CreateTenantInput {
  name: string;
  defaultLocale: string;
  defaultCurrency: string;
  defaultTimezone: string;
  contactEmail?: string;
  contactPhone?: string;
  actorId?: string;
  correlationId?: string;
  id?: string;
}

export interface CreateTenantDeps {
  tenants: TenantRepositoryPort;
  outbox: OutboxPort;
  now?: () => Date;
}

// SPEC-001 §7 — Tenant creation is one step of an orchestrated provisioning
// workflow (see apps/api composition), not a standalone public CRUD op.
// This use case creates the Tenant record and appends TenantCreated
// (SPEC-013) to the outbox — in a real adapter, both happen in one
// PostgreSQL transaction (SPEC-217 §4).
export async function createTenant(
  deps: CreateTenantDeps,
  input: CreateTenantInput,
): Promise<Tenant> {
  const now = (deps.now ?? (() => new Date()))();
  const tenant: Tenant = {
    id: input.id ?? randomUUID(),
    name: input.name,
    status: "ACTIVE",
    defaultLocale: input.defaultLocale,
    defaultCurrency: input.defaultCurrency,
    defaultTimezone: input.defaultTimezone,
    createdAt: now,
    updatedAt: now,
    ...(input.contactEmail !== undefined ? { contactEmail: input.contactEmail } : {}),
    ...(input.contactPhone !== undefined ? { contactPhone: input.contactPhone } : {}),
    ...(input.actorId !== undefined
      ? { createdBy: input.actorId, updatedBy: input.actorId }
      : {}),
  };
  await deps.tenants.save(tenant);
  await deps.outbox.append(tenantCreatedEvent(tenant, input.correlationId ?? randomUUID()));
  return tenant;
}
