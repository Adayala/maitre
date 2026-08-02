import assert from "node:assert/strict";
import test from "node:test";
import {
  buildBranchEmploymentPayload,
  branchesForBrand,
  editableMembershipStatus,
  employmentsForBranch,
  isOrganizationNodeSelected,
  organizationNodeFromSearch,
  organizationNodeHref,
  organizationNodeKey,
  organizationPanelTitle,
  plazaModeLabel,
  plazasForServicePeriod,
  servicePeriodStatusLabel,
  servicePeriodTypeLabel,
  userForEmployment,
  type BranchEmployment,
  type OrganizationBranch,
  type OrganizationNode,
  type OrganizationPlaza,
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

const plazas: OrganizationPlaza[] = [
  {
    id: "plaza-a",
    branchId: "branch-a",
    salonId: "salon-a",
    servicePeriodId: "period-a",
    name: "Terraza",
    mode: "FIXED",
    waiterEmploymentId: "employment-a",
    tableIds: ["table-a"],
  },
  {
    id: "plaza-b",
    branchId: "branch-a",
    salonId: "salon-a",
    servicePeriodId: "period-b",
    name: "Interior",
    mode: "VARIABLE",
    tableIds: ["table-b"],
  },
];

test("labels fixed and variable plaza organization modes", () => {
  assert.equal(plazaModeLabel("FIXED"), "Fija");
  assert.equal(plazaModeLabel("VARIABLE"), "Variable");
});

test("branchesForBrand keeps only branches joined to the requested brand", () => {
  assert.deepEqual(branchesForBrand(branches, "brand-a"), [branches[0]]);
  assert.deepEqual(branchesForBrand(branches, "missing"), []);
});

test("plazasForServicePeriod keeps the operational grouping scoped to one jornada", () => {
  assert.deepEqual(plazasForServicePeriod(plazas, "period-a"), [plazas[0]]);
  assert.deepEqual(plazasForServicePeriod(plazas, "missing"), []);
});

test("service period labels translate every domain type and lifecycle state", () => {
  assert.deepEqual(
    ["BREAKFAST", "LUNCH", "DINNER", "OTHER"].map((type) =>
      servicePeriodTypeLabel(
        type as "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER",
      ),
    ),
    ["Desayuno", "Almuerzo", "Cena", "Otro servicio"],
  );
  assert.deepEqual(
    ["PLANNED", "OPEN", "CLOSING", "CLOSED", "CANCELLED"].map((status) =>
      servicePeriodStatusLabel(
        status as "PLANNED" | "OPEN" | "CLOSING" | "CLOSED" | "CANCELLED",
      ),
    ),
    ["Planificada", "Abierta", "En cierre", "Cerrada", "Cancelada"],
  );
});

test("employmentsForBranch keeps assignments eligible for the requested branch", () => {
  assert.deepEqual(employmentsForBranch(employments, "branch-b"), [
    employments[1],
  ]);
  assert.deepEqual(employmentsForBranch(employments, "missing"), []);
});

test("userForEmployment resolves linked users by id or legacy email", () => {
  const users = [
    {
      id: "user-a",
      email: "a@maitre.test",
      name: "Ana",
      status: "ACTIVE",
      roleIds: ["role_waiter"],
    },
    {
      id: "user-b",
      email: "legacy@maitre.test",
      name: "Beto",
      status: "INVITED",
      roleIds: ["role_employee"],
    },
  ];
  assert.equal(userForEmployment(users, employments[0]!), users[0]);
  assert.equal(
    userForEmployment(users, {
      ...employments[1]!,
      personRef: "legacy@maitre.test",
    }),
    users[1],
  );
  assert.equal(
    userForEmployment(users, { ...employments[1]!, personRef: "missing" }),
    null,
  );
});

test("editableMembershipStatus preserves editable states and maps pending variants", () => {
  assert.equal(editableMembershipStatus(" active "), "ACTIVE");
  assert.equal(editableMembershipStatus("SUSPENDED"), "SUSPENDED");
  assert.equal(editableMembershipStatus("revoked"), "REVOKED");
  assert.equal(editableMembershipStatus("PENDING"), "INVITED");
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
  assert.equal(
    organizationNodeKey({
      type: "plaza",
      id: "plaza-a",
      parentId: "period-a",
      branchId: "branch-a",
      salonId: "salon-a",
    }),
    "plaza:plaza-a:period-a:branch-a:salon-a",
  );
  assert.equal(
    organizationNodeKey({
      type: "plaza",
      id: null,
      parentId: "period-a",
      branchId: "branch-a",
      salonId: null,
    }),
    "plaza:new:period-a:branch-a:any-salon",
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
    { type: "service-period", id: "period-a", parentId: "branch-a" },
    {
      type: "plaza",
      id: "plaza-a",
      parentId: "period-a",
      branchId: "branch-a",
      salonId: "salon-a",
    },
    {
      type: "plaza",
      id: null,
      parentId: "period-a",
      branchId: "branch-a",
      salonId: null,
    },
    { type: "table", id: "table-a", parentId: "salon-a" },
    { type: "branch-employees", id: "branch-a" },
    { type: "employee", id: "employment-a", parentId: "branch-a" },
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
  assert.equal(
    organizationNodeFromSearch("?node=service-period&id=period-a"),
    null,
  );
  assert.equal(organizationNodeFromSearch("?node=plaza&id=plaza-a"), null);
  assert.equal(
    organizationNodeFromSearch("?node=plaza&id=plaza-a&parentId=period-a"),
    null,
  );
  assert.equal(organizationNodeFromSearch("?node=table&id=table-a"), null);
  assert.equal(
    organizationNodeFromSearch("?node=employee&id=employment-a"),
    null,
  );
  assert.equal(organizationNodeFromSearch("?node=branch-employees"), null);
});

test("organizationPanelTitle describes every detail and creation mode", () => {
  assert.equal(organizationPanelTitle(null), "Detalle pendiente");
  assert.equal(
    organizationPanelTitle({ type: "branch-employees", id: "branch-a" }),
    "Equipo de la sucursal",
  );
  assert.equal(
    organizationPanelTitle({
      type: "employee",
      id: "employment-a",
      parentId: "branch-a",
    }),
    "Detalle de integrante",
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
  assert.equal(
    organizationPanelTitle({
      type: "service-period",
      id: "period-a",
      parentId: "branch-a",
    }),
    "Detalle de jornada de servicio",
  );
  assert.equal(
    organizationPanelTitle({
      type: "service-period",
      id: null,
      parentId: "branch-a",
    }),
    "Nueva jornada",
  );
  assert.equal(
    organizationPanelTitle({
      type: "plaza",
      id: "plaza-a",
      parentId: "period-a",
      branchId: "branch-a",
      salonId: "salon-a",
    }),
    "Detalle de plaza",
  );
  assert.equal(
    organizationPanelTitle({
      type: "plaza",
      id: null,
      parentId: "period-a",
      branchId: "branch-a",
      salonId: null,
    }),
    "Nueva plaza",
  );
  assert.equal(
    organizationPanelTitle({
      type: "table",
      id: "table-a",
      parentId: "salon-a",
    }),
    "Detalle de mesa",
  );
  assert.equal(
    organizationPanelTitle({ type: "table", id: null, parentId: "salon-a" }),
    "Nueva mesa",
  );
});
