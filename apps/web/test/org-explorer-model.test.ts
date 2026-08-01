import assert from "node:assert/strict";
import test from "node:test";
import {
  buildBranchEmploymentPayload,
  branchesForBrand,
  employmentsForBranch,
  isOrganizationNodeSelected,
  organizationNodeFromSearch,
  organizationNodeHref,
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

test("organization nodes round-trip through durable sidebar URLs", () => {
  const nodes: OrganizationNode[] = [
    { type: "brand", id: "brand-a" },
    { type: "brand", id: null },
    { type: "branch", id: "branch-a", parentId: "brand-a" },
    { type: "salon", id: null, parentId: "branch-a" },
    { type: "branch-employees", id: "branch-a" },
  ];

  for (const node of nodes) {
    const href = organizationNodeHref(node);
    assert.deepEqual(
      organizationNodeFromSearch(new URL(href, "https://maitre.test").search),
      node,
    );
  }
  assert.equal(
    organizationNodeHref({ type: "brand", id: "marca con espacios" }),
    "/organizacion?node=brand&id=marca+con+espacios",
  );
});

test("organizationNodeFromSearch rejects incomplete or unknown selections", () => {
  assert.equal(organizationNodeFromSearch(""), null);
  assert.equal(organizationNodeFromSearch("?node=unknown&id=value"), null);
  assert.equal(organizationNodeFromSearch("?node=branch&id=branch-a"), null);
  assert.equal(organizationNodeFromSearch("?node=salon&id=salon-a"), null);
  assert.equal(organizationNodeFromSearch("?node=branch-employees"), null);
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
