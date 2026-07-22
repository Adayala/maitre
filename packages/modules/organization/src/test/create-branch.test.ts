import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createBranch,
  UnknownBrandError,
  DuplicateBranchCodeError,
} from "../application/create-branch.js";
import { InvalidBranchCodeError } from "../domain/branch.js";
import { FakeBrandRepository, FakeBranchRepository, aBranch } from "./fakes.js";
import type { Brand } from "../domain/brand.js";

const now = new Date("2026-05-01T00:00:00Z");
const tenantId = "11111111-1111-1111-1111-111111111111";

function aBrand(overrides: Partial<Brand> = {}): Brand {
  return {
    id: "33333333-3333-3333-3333-333333333333",
    tenantId,
    name: "La Parrilla",
    slug: "la-parrilla",
    status: "ACTIVE",
    config: { language: "es", currency: "ARS" },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

test("createBranch succeeds for a brand that exists in the same tenant", async () => {
  const brands = new FakeBrandRepository([aBrand()]);
  const branches = new FakeBranchRepository();

  const branch = await createBranch(
    { brands, branches, now: () => now },
    {
      tenantId,
      brandId: "33333333-3333-3333-3333-333333333333",
      name: "Main Branch",
      code: "main",
      timezone: "America/Argentina/Buenos_Aires",
    },
  );

  assert.equal(branch.code, "MAIN");
  assert.equal(branch.status, "ACTIVE");
});

test("createBranch rejects an unknown brandId", async () => {
  const brands = new FakeBrandRepository([]);
  const branches = new FakeBranchRepository();

  await assert.rejects(
    createBranch(
      { brands, branches, now: () => now },
      {
        tenantId,
        brandId: "33333333-3333-3333-3333-333333333333",
        name: "Main Branch",
        code: "MAIN",
        timezone: "America/Argentina/Buenos_Aires",
      },
    ),
    UnknownBrandError,
  );
});

test("createBranch rejects a brand belonging to a different tenant", async () => {
  const brands = new FakeBrandRepository([aBrand({ tenantId: "other-tenant" })]);
  const branches = new FakeBranchRepository();

  await assert.rejects(
    createBranch(
      { brands, branches, now: () => now },
      {
        tenantId,
        brandId: "33333333-3333-3333-3333-333333333333",
        name: "Main Branch",
        code: "MAIN",
        timezone: "America/Argentina/Buenos_Aires",
      },
    ),
    UnknownBrandError,
  );
});

test("createBranch rejects an invalid code", async () => {
  const brands = new FakeBrandRepository([aBrand()]);
  const branches = new FakeBranchRepository();

  await assert.rejects(
    createBranch(
      { brands, branches, now: () => now },
      {
        tenantId,
        brandId: "33333333-3333-3333-3333-333333333333",
        name: "Main Branch",
        code: "-BAD",
        timezone: "America/Argentina/Buenos_Aires",
      },
    ),
    InvalidBranchCodeError,
  );
});

test("createBranch rejects a duplicate code within the same tenant", async () => {
  const brands = new FakeBrandRepository([aBrand()]);
  const branches = new FakeBranchRepository([aBranch({ code: "MAIN" })]);

  await assert.rejects(
    createBranch(
      { brands, branches, now: () => now },
      {
        tenantId,
        brandId: "33333333-3333-3333-3333-333333333333",
        name: "Another Branch",
        code: "main",
        timezone: "America/Argentina/Buenos_Aires",
      },
    ),
    DuplicateBranchCodeError,
  );
});
