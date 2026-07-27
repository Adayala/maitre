// SPEC-140 — FiscalCertificate. Stores ONLY metadata + an opaque secret
// reference per (CUIT, service, environment). Private key / certificate material
// / CMS / access tickets NEVER enter the domain, DB, git, logs or artifacts.
//
// DEFERRED (documented): real crypto, real fingerprint/issuer derivation, and
// the rotation-with-controlled-overlap + auditable-rollback workflow. This MVP
// is a simple CRUD + `revoke` command. `fingerprint`, `issuer` and
// `secretReference` are placeholder opaque strings; a real secret adapter (with
// encryption, least privilege, audit and backup/rotation) replaces this later.

export type FiscalCertificateStatus = "ACTIVE" | "EXPIRED" | "REVOKED";
export type FiscalCertificateEnvironment = "HOMOLOGATION" | "PRODUCTION";

export interface FiscalCertificate {
  id: string;
  tenantId: string;
  fiscalEntityId: string;
  cuit: string;
  service: string;
  environment: FiscalCertificateEnvironment;
  fingerprint: string; // placeholder — not derived from real cert material
  issuer: string; // placeholder
  notBefore: Date;
  notAfter: Date;
  status: FiscalCertificateStatus;
  secretReference: string; // opaque placeholder; no key material stored
  rotatedAt?: Date | null;
  supersededBy?: string | null;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

export class InvalidCertificateStateError extends Error {
  constructor(id: string, status: FiscalCertificateStatus) {
    super(`FiscalCertificate ${id} is ${status}; cannot revoke a non-ACTIVE certificate`);
    this.name = "InvalidCertificateStateError";
  }
}

// REVOKED/EXPIRED block new authorization requests but never block historical
// inspection (SPEC-140). Enforced by whichever flow reads it before an issue.
export function isCertificateUsable(cert: FiscalCertificate, now: Date): boolean {
  return cert.status === "ACTIVE" && cert.notAfter.getTime() > now.getTime();
}
