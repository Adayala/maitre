// SPEC-155 — FiscalPointOfSale use cases (create + list + activate/deactivate).

import { randomUUID } from "node:crypto";
import {
  type FiscalPointOfSale,
  type FiscalPointOfSaleStatus,
  DuplicatePointOfSaleError,
} from "../domain/fiscal-point-of-sale.js";
import type { FiscalEnvironment, VoucherType } from "../domain/invoice.js";
import type { FiscalPointOfSaleRepositoryPort } from "./ports.js";

export interface PointOfSaleDeps {
  pointsOfSale: FiscalPointOfSaleRepositoryPort;
  now?: () => Date;
}

function nowFrom(deps: { now?: () => Date }): Date {
  return (deps.now ?? (() => new Date()))();
}

export interface CreatePointOfSaleInput {
  id?: string;
  tenantId: string;
  fiscalEntityId: string;
  environment: FiscalEnvironment;
  officialCode: string;
  allowedVoucherTypes: VoucherType[];
}

export async function createPointOfSale(deps: PointOfSaleDeps, input: CreatePointOfSaleInput): Promise<FiscalPointOfSale> {
  const existing = await deps.pointsOfSale.findByIdentity(
    input.tenantId,
    input.fiscalEntityId,
    input.environment,
    input.officialCode,
  );
  if (existing) throw new DuplicatePointOfSaleError(input.fiscalEntityId, input.environment, input.officialCode);

  const now = nowFrom(deps);
  const pos: FiscalPointOfSale = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    fiscalEntityId: input.fiscalEntityId,
    environment: input.environment,
    officialCode: input.officialCode,
    allowedVoucherTypes: input.allowedVoucherTypes,
    status: "ACTIVE",
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };
  await deps.pointsOfSale.save(pos);
  return pos;
}

export async function listPointsOfSale(deps: PointOfSaleDeps, tenantId: string, fiscalEntityId: string): Promise<FiscalPointOfSale[]> {
  return deps.pointsOfSale.listByFiscalEntity(tenantId, fiscalEntityId);
}

export async function setPointOfSaleStatus(
  deps: PointOfSaleDeps,
  input: { tenantId: string; id: string; status: FiscalPointOfSaleStatus },
): Promise<FiscalPointOfSale> {
  const pos = await deps.pointsOfSale.findById(input.tenantId, input.id);
  if (!pos) throw new Error(`FiscalPointOfSale ${input.id} not found`);
  const updated: FiscalPointOfSale = { ...pos, status: input.status, revision: pos.revision + 1, updatedAt: nowFrom(deps) };
  await deps.pointsOfSale.save(updated);
  return updated;
}
