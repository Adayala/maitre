import { randomUUID } from "node:crypto";
import type { Tenant } from "../domain/tenant.js";
import type { TenantRepositoryPort } from "./ports.js";

export interface CreateTenantInput {
  name: string;
  defaultLocale: string;
  defaultCurrency: string;
  defaultTimezone: string;
  contactEmail?: string;
  contactPhone?: string;
  actorId?: string;
}

export interface CreateTenantDeps {
  tenants: TenantRepositoryPort;
  now?: () => Date;
}

// SPEC-001 §7 — Tenant creation is one step of an orchestrated provisioning
// workflow (see apps/api composition), not a standalone public CRUD op.
// This use case only creates the Tenant record itself.
export async function createTenant(
  deps: CreateTenantDeps,
  input: CreateTenantInput,
): Promise<Tenant> {
  const now = (deps.now ?? (() => new Date()))();
  const tenant: Tenant = {
    id: randomUUID(),
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
  return tenant;
}
