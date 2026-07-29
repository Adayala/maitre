// SPEC-155 — FiscalPointOfSale use cases (create + list + activate/deactivate).

import { randomUUID } from "node:crypto";
import {
  type FiscalPointOfSale,
  type FiscalPointOfSaleStatus,
  type ArcaRegistrationStatus,
  type FiscalIssuingSystem,
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
  branchId?: string;
  environment: FiscalEnvironment;
  officialCode: string;
  arcaDomicileCode?: string;
  arcaDomicileLabel?: string;
  issuingSystem?: FiscalIssuingSystem;
  registrationEvidenceRef?: string;
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
    ...(input.branchId ? { branchId: input.branchId } : {}),
    environment: input.environment,
    officialCode: input.officialCode,
    ...(input.arcaDomicileCode ? { arcaDomicileCode: input.arcaDomicileCode } : {}),
    ...(input.arcaDomicileLabel ? { arcaDomicileLabel: input.arcaDomicileLabel } : {}),
    issuingSystem: input.issuingSystem ?? "WSFEV1",
    registrationStatus: "DECLARED",
    ...(input.registrationEvidenceRef
      ? { registrationEvidenceRef: input.registrationEvidenceRef }
      : {}),
    declaredAt: now,
    allowedVoucherTypes: input.allowedVoucherTypes,
    status: "ACTIVE",
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };
  await deps.pointsOfSale.save(pos);
  return pos;
}

export async function setPointOfSaleRegistration(
  deps: PointOfSaleDeps,
  input: {
    tenantId: string;
    id: string;
    status: ArcaRegistrationStatus;
    actorId: string;
    evidenceRef?: string;
    rejectionReason?: string;
  },
): Promise<FiscalPointOfSale> {
  const pos = await deps.pointsOfSale.findById(input.tenantId, input.id);
  if (!pos) throw new Error(`FiscalPointOfSale ${input.id} not found`);
  if (input.status === "VERIFIED" && !input.evidenceRef) {
    throw new Error("Registration evidence is required to verify an ARCA point of sale");
  }
  const now = nowFrom(deps);
  const updated: FiscalPointOfSale = {
    ...pos,
    registrationStatus: input.status,
    ...(input.evidenceRef ? { registrationEvidenceRef: input.evidenceRef } : {}),
    ...(input.status === "VERIFIED" ? { verifiedAt: now, verifiedBy: input.actorId } : {}),
    ...(input.status === "REJECTED" && input.rejectionReason
      ? { rejectionReason: input.rejectionReason }
      : {}),
    updatedAt: now,
    revision: pos.revision + 1,
  };
  await deps.pointsOfSale.save(updated);
  return updated;
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
