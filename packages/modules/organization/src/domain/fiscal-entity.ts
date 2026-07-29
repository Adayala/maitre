// SPEC-003 — FiscalEntity domain model and invariants.
// Note: certificate/private-key material is modeled as opaque encrypted
// references only. This module never decrypts, validates cryptographic
// signatures, or handles plaintext keys — that belongs to an ARCA adapter
// (SPEC-145/226), out of scope for I0.

export type FiscalEntityStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type TaxCondition = "RI" | "MONOTRIBUTISTA" | "EXENTO";

export interface FiscalCertificate {
  serial: string;
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  thumbprint: string;
}

export interface FiscalEntity {
  id: string;
  tenantId: string;
  cuit: string;
  /** Authoritative registered business name used on fiscal documents. */
  legalName?: string;
  /** Optional commercial/display alias; never replaces legalName on a voucher. */
  displayName?: string;
  /** @deprecated compatibility alias for records created before legalName existed. */
  name: string;
  legalAddress?: string;
  fiscalAddress?: string;
  activityCode?: string;
  createIdempotencyKey?: string;
  status: FiscalEntityStatus;
  taxCondition: TaxCondition;
  certificate?: FiscalCertificate;
  encryptedCertificateKeyRef?: string;
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  updatedBy?: string;
}

const allowedTransitions: Record<FiscalEntityStatus, FiscalEntityStatus[]> = {
  ACTIVE: ["INACTIVE", "ARCHIVED"],
  INACTIVE: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: [],
};

export class InvalidFiscalEntityTransitionError extends Error {
  constructor(from: FiscalEntityStatus, to: FiscalEntityStatus) {
    super(`FiscalEntity cannot transition from ${from} to ${to}`);
    this.name = "InvalidFiscalEntityTransitionError";
  }
}

export function canTransitionFiscalEntity(
  from: FiscalEntityStatus,
  to: FiscalEntityStatus,
): boolean {
  return allowedTransitions[from].includes(to);
}

export function transitionFiscalEntity(
  entity: FiscalEntity,
  to: FiscalEntityStatus,
  now: Date,
): FiscalEntity {
  if (!canTransitionFiscalEntity(entity.status, to)) {
    throw new InvalidFiscalEntityTransitionError(entity.status, to);
  }
  return { ...entity, status: to, updatedAt: now };
}

export class InvalidCuitError extends Error {
  constructor(cuit: string) {
    super(`"${cuit}" is not a valid CUIT`);
    this.name = "InvalidCuitError";
  }
}

const cuitWeights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

/** Normalizes to 11 digits and validates the CUIT checksum digit. */
export function normalizeCuit(rawCuit: string): string {
  const digits = rawCuit.replace(/\D/g, "");
  if (digits.length !== 11 || !isValidCuitChecksum(digits)) {
    throw new InvalidCuitError(rawCuit);
  }
  return digits;
}

function isValidCuitChecksum(digits: string): boolean {
  const nums = digits.split("").map(Number);
  const sum = cuitWeights.reduce((acc, weight, i) => acc + weight * nums[i]!, 0);
  const mod = 11 - (sum % 11);
  const expected = mod === 11 ? 0 : mod === 10 ? -1 : mod;
  return expected === nums[10];
}

// SPEC-003 §Invariante 2 — only a fiscal entity with a currently valid
// certificate may issue documents.
export function canIssueDocuments(entity: FiscalEntity, now: Date): boolean {
  if (entity.status !== "ACTIVE") return false;
  if (!entity.certificate) return false;
  return entity.certificate.validTo.getTime() > now.getTime();
}
