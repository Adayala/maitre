import assert from "node:assert/strict";
import test from "node:test";
import {
  createEmployment,
  DuplicateEmployeeCodeError,
  updateEmployment,
  type Employment,
} from "../index.js";
import { FakeEmploymentRepository } from "./fakes.js";

const tenantId = "10000000-0000-4000-8000-000000000001";
const createdAt = new Date("2026-08-01T10:00:00.000Z");

function anEmployment(overrides: Partial<Employment> = {}): Employment {
  return {
    id: "20000000-0000-4000-8000-000000000001",
    tenantId,
    personRef: "user-a",
    employeeCode: "MOZO-01",
    relationshipType: "EMPLOYEE",
    eligibleBranchIds: ["30000000-0000-4000-8000-000000000001"],
    status: "ACTIVE",
    validFrom: createdAt,
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  };
}

test("createEmployment creates defaults and explicit optional values", async () => {
  const repository = new FakeEmploymentRepository();
  const defaultEmployment = await createEmployment(
    { employments: repository },
    {
      tenantId,
      personRef: "user-a",
      employeeCode: "MOZO-01",
      relationshipType: "EMPLOYEE",
      eligibleBranchIds: ["30000000-0000-4000-8000-000000000001"],
      validFrom: createdAt,
    },
  );
  assert.equal(defaultEmployment.status, "ACTIVE");
  assert.equal(defaultEmployment.validUntil, undefined);

  const validUntil = new Date("2026-12-01T10:00:00.000Z");
  const explicitEmployment = await createEmployment(
    { employments: repository },
    {
      tenantId,
      personRef: "user-b",
      employeeCode: "TEMP-02",
      relationshipType: "TEMPORARY",
      eligibleBranchIds: ["30000000-0000-4000-8000-000000000002"],
      status: "INACTIVE",
      validFrom: createdAt,
      validUntil,
      now: createdAt,
    },
  );
  assert.equal(explicitEmployment.status, "INACTIVE");
  assert.equal(explicitEmployment.validUntil, validUntil);
  assert.equal(explicitEmployment.updatedAt, createdAt);
});

test("createEmployment rejects duplicate employee codes", async () => {
  const repository = new FakeEmploymentRepository([anEmployment()]);
  await assert.rejects(
    createEmployment(
      { employments: repository },
      {
        tenantId,
        personRef: "user-b",
        employeeCode: "MOZO-01",
        relationshipType: "EMPLOYEE",
        eligibleBranchIds: ["30000000-0000-4000-8000-000000000001"],
        validFrom: createdAt,
      },
    ),
    DuplicateEmployeeCodeError,
  );
});

test("updateEmployment updates every editable labor field", async () => {
  const repository = new FakeEmploymentRepository([anEmployment()]);
  const now = new Date("2026-08-01T12:00:00.000Z");
  const validFrom = new Date("2026-08-02T10:00:00.000Z");
  const updated = await updateEmployment(
    { employments: repository },
    {
      tenantId,
      id: anEmployment().id,
      employeeCode: "MOZO-02",
      relationshipType: "CONTRACTOR",
      eligibleBranchIds: ["30000000-0000-4000-8000-000000000002"],
      status: "INACTIVE",
      validFrom,
      validUntil: null,
      now,
    },
  );
  assert.deepEqual(updated, {
    ...anEmployment(),
    employeeCode: "MOZO-02",
    relationshipType: "CONTRACTOR",
    eligibleBranchIds: ["30000000-0000-4000-8000-000000000002"],
    status: "INACTIVE",
    validFrom,
    validUntil: null,
    updatedAt: now,
  });
});

test("updateEmployment preserves omitted fields and accepts the existing code", async () => {
  const employment = anEmployment();
  const repository = new FakeEmploymentRepository([employment]);
  const updated = await updateEmployment(
    { employments: repository },
    { tenantId, id: employment.id, employeeCode: employment.employeeCode },
  );
  assert.equal(updated.employeeCode, employment.employeeCode);
  assert.equal(updated.relationshipType, employment.relationshipType);
  assert.notEqual(updated.updatedAt, employment.updatedAt);

  const statusOnly = await updateEmployment(
    { employments: repository },
    { tenantId, id: employment.id, status: "INACTIVE" },
  );
  assert.equal(statusOnly.employeeCode, employment.employeeCode);
  assert.equal(statusOnly.status, "INACTIVE");
});

test("updateEmployment rejects missing records and duplicate replacement codes", async () => {
  const repository = new FakeEmploymentRepository([
    anEmployment(),
    anEmployment({
      id: "20000000-0000-4000-8000-000000000002",
      employeeCode: "MOZO-02",
    }),
  ]);
  await assert.rejects(
    updateEmployment(
      { employments: repository },
      { tenantId, id: "missing", status: "INACTIVE" },
    ),
    /Employment missing not found/,
  );
  await assert.rejects(
    updateEmployment(
      { employments: repository },
      {
        tenantId,
        id: anEmployment().id,
        employeeCode: "MOZO-02",
      },
    ),
    DuplicateEmployeeCodeError,
  );
});
