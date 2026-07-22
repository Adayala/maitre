import { randomUUID } from "node:crypto";
import { isTenantOperable } from "../domain/tenant.js";
import { slugify, type Brand, type BrandConfig } from "../domain/brand.js";
import type { BrandRepositoryPort, TenantRepositoryPort } from "./ports.js";
import { TenantNotOperableError } from "./errors.js";
import type { OutboxPort } from "./outbox.js";
import { brandCreatedEvent } from "./events.js";

export class DuplicateBrandSlugError extends Error {
  constructor(slug: string, tenantId: string) {
    super(`Brand slug "${slug}" already exists for tenant ${tenantId}`);
    this.name = "DuplicateBrandSlugError";
  }
}

export interface CreateBrandInput {
  tenantId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  config: BrandConfig;
  actorId?: string;
  correlationId?: string;
}

export interface CreateBrandDeps {
  tenants: TenantRepositoryPort;
  brands: BrandRepositoryPort;
  outbox: OutboxPort;
  now?: () => Date;
}

// SPEC-002 §Reglas 1-2 — brand requires an operable tenant and a unique slug.
export async function createBrand(
  deps: CreateBrandDeps,
  input: CreateBrandInput,
): Promise<Brand> {
  const tenant = await deps.tenants.findById(input.tenantId);
  if (!tenant || !isTenantOperable(tenant)) {
    throw new TenantNotOperableError(input.tenantId);
  }

  const slug = slugify(input.name);
  const existing = await deps.brands.findBySlug(input.tenantId, slug);
  if (existing) {
    throw new DuplicateBrandSlugError(slug, input.tenantId);
  }

  const now = (deps.now ?? (() => new Date()))();
  const brand: Brand = {
    id: randomUUID(),
    tenantId: input.tenantId,
    name: input.name,
    slug,
    ...(input.description !== undefined ? { description: input.description } : {}),
    status: "ACTIVE",
    ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
    ...(input.website !== undefined ? { website: input.website } : {}),
    config: input.config,
    createdAt: now,
    updatedAt: now,
    ...(input.actorId !== undefined
      ? { createdBy: input.actorId, updatedBy: input.actorId }
      : {}),
  };

  await deps.brands.save(brand);
  await deps.outbox.append(brandCreatedEvent(brand, input.correlationId ?? randomUUID()));
  return brand;
}
