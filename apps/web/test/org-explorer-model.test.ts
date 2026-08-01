import assert from "node:assert/strict";
import test from "node:test";
import {
  buildBranchEmploymentPayload,
  branchesForBrand,
  employmentsForBranch,
  isOrganizationNodeSelected,
  organizationNodeKey,
  organizationPanelTitle,
  type BranchEmployment,
  type OrganizationBranch,
  type OrganizationNode,
} from "../src/features/organization/org-explorer-model.js";

const branches: OrganizationBranch[] = [
  {
    id: "branch-a",
    brandId: "brand-a",
    name: "Centro",
    code: "CTR",
    status: "ACTIVE",
    timezone: "America/Argentina/Buenos_Aires",
  },
  {
    id: "branch-b",
    brandId: "brand-b",
    name: "Norte",
    code: "NTE",
    status: "INACTIVE",
    timezone: "America/Argentina/Buenos_Aires",
  },
];

const employments: BranchEmployment[] = [
  {
    id: "employment-a",
    personRef: "user-a",
    employeeCode: "A-1",
    eligibleBranchIds: ["branch-a"],
    status: "ACTIVE",
    relationshipType: "EMPLOYEE",
  },
  {
    id: "employment-b",
    personRef: "user-b",
    employeeCode: "B-1",
    eligibleBranchIds: ["branch-b"],
    status: "INACTIVE",
    relationshipType: "CONTRACTOR",
  },
];

test("branchesForBrand keeps only branches joined to the requested brand", () => {
  assert.deepEqual(branchesForBrand(branches, "brand-a"), [branches[0]]);
  assert.deepEqual(branchesForBrand(branches, "missing"), []);
});

test("employmentsForBranch keeps assignments eligible for the requested branch", () => {
  assert.deepEqual(employmentsForBranch(employments, "branch-b"), [
    employments[1],
  ]);
  assert.deepEqual(employmentsForBranch(employments, "missing"), []);
});

test("buildBranchEmploymentPayload scopes a trimmed active employment to its branch", () => {
  assert.deepEqual(
    buildBranchEmploymentPayload({
      branchId: "branch-a",
      employeeCode: "  EMP-42  ",
      personRef: "user-42",
      relationshipType: "TEMPORARY",
      validFrom: "2026-08-01T12:00:00.000Z",
    }),
    {
      personRef: "user-42",
      employeeCode: "EMP-42",
      relationshipType: "TEMPORARY",
      eligibleBranchIds: ["branch-a"],
      status: "ACTIVE",
      validFrom: "2026-08-01T12:00:00.000Z",
    },
  );
});

test("organizationNodeKey is stable for empty, existing and create nodes", () => {
  assert.equal(organizationNodeKey(null), "empty");
  assert.equal(
    organizationNodeKey({ type: "brand", id: "brand-a" }),
    "brand:brand-a:root",
  );
  assert.equal(
    organizationNodeKey({ type: "brand", id: null }),
    "brand:new:root",
  );
  assert.equal(
    organizationNodeKey({ type: "branch", id: null, parentId: "brand-a" }),
    "branch:new:brand-a",
  );
});

test("isOrganizationNodeSelected compares the complete navigation identity", () => {
  const selected: OrganizationNode = {
    type: "salon",
    id: null,
    parentId: "branch-a",
  };
  assert.equal(isOrganizationNodeSelected(selected, { ...selected }), true);
  assert.equal(
    isOrganizationNodeSelected(selected, {
      type: "salon",
      id: null,
      parentId: "branch-b",
    }),
    false,
  );
  assert.equal(
    isOrganizationNodeSelected(null, { type: "brand", id: "brand-a" }),
    false,
  );
});

test("organizationPanelTitle describes every detail and creation mode", () => {
  assert.equal(organizationPanelTitle(null), "Detalle pendiente");
  assert.equal(
    organizationPanelTitle({ type: "branch-employees", id: "branch-a" }),
    "Empleados de la sucursal",
  );
  assert.equal(
    organizationPanelTitle({ type: "brand", id: "brand-a" }),
    "Detalle de marca",
  );
  assert.equal(
    organizationPanelTitle({ type: "brand", id: null }),
    "Nueva marca",
  );
  assert.equal(
    organizationPanelTitle({
      type: "branch",
      id: "branch-a",
      parentId: "brand-a",
    }),
    "Detalle de sucursal",
  );
  assert.equal(
    organizationPanelTitle({ type: "branch", id: null, parentId: "brand-a" }),
    "Nueva sucursal",
  );
  assert.equal(
    organizationPanelTitle({
      type: "salon",
      id: "salon-a",
      parentId: "branch-a",
    }),
    "Detalle de salón",
  );
  assert.equal(
    organizationPanelTitle({ type: "salon", id: null, parentId: "branch-a" }),
    "Nuevo salón",
  );
});
