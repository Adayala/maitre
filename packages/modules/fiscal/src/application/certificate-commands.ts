// SPEC-140 — FiscalCertificate use cases: register (metadata only) + revoke.
// NO crypto, NO key material. `secretReference`/`fingerprint`/`issuer` are opaque
// placeholders. Rotation-with-overlap + rollback is deferred.

import { randomUUID } from "node:crypto";
import {
  type FiscalCertificate,
  type FiscalCertificateEnvironment,
  InvalidCertificateStateError,
} from "../domain/fiscal-certificate.js";
import type { FiscalCertificateRepositoryPort } from "./ports.js";

export interface CertificateDeps {
  certificates: FiscalCertificateRepositoryPort;
  now?: () => Date;
}

function nowFrom(deps: { now?: () => Date }): Date {
  return (deps.now ?? (() => new Date()))();
}

export interface RegisterCertificateInput {
  id?: string;
  tenantId: string;
  fiscalEntityId: string;
  cuit: string;
  service: string;
  environment: FiscalCertificateEnvironment;
  fingerprint: string;
  issuer: string;
  notBefore: Date;
  notAfter: Date;
  secretReference: string;
}

export async function registerCertificate(deps: CertificateDeps, input: RegisterCertificateInput): Promise<FiscalCertificate> {
  const now = nowFrom(deps);
  const cert: FiscalCertificate = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    fiscalEntityId: input.fiscalEntityId,
    cuit: input.cuit,
    service: input.service,
    environment: input.environment,
    fingerprint: input.fingerprint,
    issuer: input.issuer,
    notBefore: input.notBefore,
    notAfter: input.notAfter,
    status: "ACTIVE",
    secretReference: input.secretReference,
    rotatedAt: null,
    supersededBy: null,
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };
  await deps.certificates.save(cert);
  return cert;
}

export async function listCertificates(deps: CertificateDeps, tenantId: string, fiscalEntityId: string): Promise<FiscalCertificate[]> {
  return deps.certificates.listByFiscalEntity(tenantId, fiscalEntityId);
}

export async function revokeCertificate(deps: CertificateDeps, input: { tenantId: string; id: string }): Promise<FiscalCertificate> {
  const cert = await deps.certificates.findById(input.tenantId, input.id);
  if (!cert) throw new Error(`FiscalCertificate ${input.id} not found`);
  if (cert.status !== "ACTIVE") throw new InvalidCertificateStateError(cert.id, cert.status);
  const now = nowFrom(deps);
  const revoked: FiscalCertificate = { ...cert, status: "REVOKED", updatedAt: now, revision: cert.revision + 1 };
  await deps.certificates.save(revoked);
  return revoked;
}
