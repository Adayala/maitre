import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeCuit,
  canTransitionFiscalEntity,
  transitionFiscalEntity,
  canIssueDocuments,
  InvalidCuitError,
  InvalidFiscalEntityTransitionError,
  type FiscalEntity,
} from "../domain/fiscal-entity.js";

function makeEntity(overrides: Partial<FiscalEntity> = {}): FiscalEntity {
  const now = new Date("2026-01-01T00:00:00Z");
  return {
    id: "55555555-5555-5555-5555-555555555555",
    tenantId: "11111111-1111-1111-1111-111111111111",
    cuit: "20123456786",
    name: "La Parrilla S.A.",
    status: "ACTIVE",
    taxCondition: "RI",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

test("normalizeCuit accepts a valid CUIT with formatting", () => {
  assert.equal(normalizeCuit("20-12345678-6"), "20123456786");
});

test("normalizeCuit rejects an invalid checksum digit", () => {
  assert.throws(() => normalizeCuit("20-12345678-9"), InvalidCuitError);
});

test("normalizeCuit rejects wrong digit count", () => {
  assert.throws(() => normalizeCuit("20-1234-6"), InvalidCuitError);
});

test("allows ACTIVE <-> INACTIVE and both -> ARCHIVED", () => {
  assert.equal(canTransitionFiscalEntity("ACTIVE", "INACTIVE"), true);
  assert.equal(canTransitionFiscalEntity("INACTIVE", "ACTIVE"), true);
  assert.equal(canTransitionFiscalEntity("ACTIVE", "ARCHIVED"), true);
});

test("ARCHIVED is terminal", () => {
  assert.equal(canTransitionFiscalEntity("ARCHIVED", "ACTIVE"), false);
});

test("transitionFiscalEntity throws on invalid transition", () => {
  const entity = makeEntity({ status: "ARCHIVED" });
  assert.throws(
    () => transitionFiscalEntity(entity, "ACTIVE", new Date()),
    InvalidFiscalEntityTransitionError,
  );
});

test("canIssueDocuments is false without a certificate", () => {
  const entity = makeEntity();
  assert.equal(canIssueDocuments(entity, new Date("2026-01-02T00:00:00Z")), false);
});

test("canIssueDocuments is false when the certificate expired", () => {
  const entity = makeEntity({
    certificate: {
      serial: "0x1",
      subject: "CN=demo",
      issuer: "CN=afip",
      validFrom: new Date("2020-01-01T00:00:00Z"),
      validTo: new Date("2021-01-01T00:00:00Z"),
      thumbprint: "abc",
    },
  });
  assert.equal(canIssueDocuments(entity, new Date("2026-01-01T00:00:00Z")), false);
});

test("canIssueDocuments is false when status is not ACTIVE, even with a valid certificate", () => {
  const entity = makeEntity({
    status: "INACTIVE",
    certificate: {
      serial: "0x1",
      subject: "CN=demo",
      issuer: "CN=afip",
      validFrom: new Date("2020-01-01T00:00:00Z"),
      validTo: new Date("2030-01-01T00:00:00Z"),
      thumbprint: "abc",
    },
  });
  assert.equal(canIssueDocuments(entity, new Date("2026-01-01T00:00:00Z")), false);
});

test("canIssueDocuments is true for ACTIVE entity with a currently valid certificate", () => {
  const entity = makeEntity({
    certificate: {
      serial: "0x1",
      subject: "CN=demo",
      issuer: "CN=afip",
      validFrom: new Date("2020-01-01T00:00:00Z"),
      validTo: new Date("2030-01-01T00:00:00Z"),
      thumbprint: "abc",
    },
  });
  assert.equal(canIssueDocuments(entity, new Date("2026-01-01T00:00:00Z")), true);
});
