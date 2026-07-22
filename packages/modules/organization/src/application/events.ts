import { randomUUID } from "node:crypto";
import type { Tenant } from "../domain/tenant.js";
import type { Brand } from "../domain/brand.js";
import type { Branch } from "../domain/branch.js";
import type { OutboxRecord } from "./outbox.js";

export interface TenantCreatedPayload {
  tenantId: string;
  name: string;
  status: string;
  createdAt: Date;
}

// SPEC-013 §Payload — minimal fact only: no CUIT, address, email, secrets.
export function tenantCreatedEvent(
  tenant: Tenant,
  correlationId: string,
): OutboxRecord<TenantCreatedPayload> {
  return {
    eventId: randomUUID(),
    eventName: "TenantCreated",
    eventVersion: 1,
    occurredAt: tenant.createdAt,
    producer: "organization",
    tenantId: tenant.id,
    aggregateType: "Tenant",
    aggregateId: tenant.id,
    correlationId,
    payload: {
      tenantId: tenant.id,
      name: tenant.name,
      status: tenant.status,
      createdAt: tenant.createdAt,
    },
    status: "PENDING",
    attempts: 0,
  };
}

export interface BrandCreatedPayload {
  brandId: string;
  tenantId: string;
  name: string;
  status: string;
  createdAt: Date;
}

// SPEC-014 §Payload — no full config, images, fiscal data or credentials.
export function brandCreatedEvent(
  brand: Brand,
  correlationId: string,
): OutboxRecord<BrandCreatedPayload> {
  return {
    eventId: randomUUID(),
    eventName: "BrandCreated",
    eventVersion: 1,
    occurredAt: brand.createdAt,
    producer: "organization",
    tenantId: brand.tenantId,
    aggregateType: "Brand",
    aggregateId: brand.id,
    correlationId,
    payload: {
      brandId: brand.id,
      tenantId: brand.tenantId,
      name: brand.name,
      status: brand.status,
      createdAt: brand.createdAt,
    },
    status: "PENDING",
    attempts: 0,
  };
}

export interface BranchCreatedPayload {
  branchId: string;
  tenantId: string;
  brandId: string;
  fiscalEntityId?: string;
  name: string;
  timezone: string;
  status: string;
  createdAt: Date;
}

// SPEC-015 §Payload — no address/phone; consumers use an authorized read.
export function branchCreatedEvent(
  branch: Branch,
  correlationId: string,
): OutboxRecord<BranchCreatedPayload> {
  return {
    eventId: randomUUID(),
    eventName: "BranchCreated",
    eventVersion: 1,
    occurredAt: branch.createdAt,
    producer: "organization",
    tenantId: branch.tenantId,
    aggregateType: "Branch",
    aggregateId: branch.id,
    correlationId,
    payload: {
      branchId: branch.id,
      tenantId: branch.tenantId,
      brandId: branch.brandId,
      name: branch.name,
      timezone: branch.timezone,
      status: branch.status,
      createdAt: branch.createdAt,
      ...(branch.fiscalEntityId !== undefined
        ? { fiscalEntityId: branch.fiscalEntityId }
        : {}),
    },
    status: "PENDING",
    attempts: 0,
  };
}
