export type OrganizationNode =
  | { type: "brand"; id: string | null }
  | { type: "branch"; id: string | null; parentId: string }
  | { type: "salon"; id: string | null; parentId: string }
  | { type: "service-period"; id: string | null; parentId: string }
  | {
      type: "plaza";
      id: string | null;
      parentId: string;
      branchId: string;
      salonId: string | null;
    }
  | { type: "table"; id: string | null; parentId: string }
  | { type: "branch-employees"; id: string }
  | { type: "employee"; id: string; parentId: string };

export interface OrganizationBrand {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export interface OrganizationBranch {
  id: string;
  brandId: string;
  name: string;
  code: string;
  status: string;
  timezone: string;
}

export interface OrganizationSalon {
  id: string;
  branchId: string;
  name: string;
  capacity: number;
  status: "ACTIVE" | "INACTIVE";
}

export interface OrganizationTable {
  id: string;
  branchId: string;
  salonId: string;
  number: string;
  name?: string;
  capacity: number;
}

export interface OrganizationPlaza {
  id: string;
  branchId: string;
  salonId: string;
  servicePeriodId: string;
  name: string;
  mode: "FIXED" | "VARIABLE";
  sourcePlazaId?: string | null;
  waiterEmploymentId?: string | null;
  tableIds: string[];
}

export function plazaModeLabel(mode: OrganizationPlaza["mode"]) {
  return mode === "FIXED" ? "Fija" : "Variable";
}

export interface OrganizationServicePeriod {
  id: string;
  branchId: string;
  businessDate: string;
  name: string;
  type: "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER";
  plannedOpen?: string;
  plannedClose?: string;
  actualOpen?: string | null;
  actualClose?: string | null;
  status: "PLANNED" | "OPEN" | "CLOSING" | "CLOSED" | "CANCELLED";
}

export function plazasForServicePeriod(
  plazas: OrganizationPlaza[],
  servicePeriodId: string,
) {
  return plazas.filter((plaza) => plaza.servicePeriodId === servicePeriodId);
}

export function servicePeriodTypeLabel(
  type: OrganizationServicePeriod["type"],
) {
  return {
    BREAKFAST: "Desayuno",
    LUNCH: "Almuerzo",
    DINNER: "Cena",
    OTHER: "Otro servicio",
  }[type];
}

export function servicePeriodStatusLabel(
  status: OrganizationServicePeriod["status"],
) {
  return {
    PLANNED: "Planificada",
    OPEN: "Abierta",
    CLOSING: "En cierre",
    CLOSED: "Cerrada",
    CANCELLED: "Cancelada",
  }[status];
}

export interface BranchEmployment {
  id: string;
  personRef: string;
  employeeCode: string;
  eligibleBranchIds: string[];
  status: "ACTIVE" | "INACTIVE" | "TERMINATED";
  relationshipType: EmploymentRelationshipType;
  validFrom?: string;
  validUntil?: string | null;
}

export interface OrganizationUser {
  id: string;
  email: string | null;
  name: string;
  status: string;
  roleIds: string[];
}

export type EmploymentRelationshipType =
  "EMPLOYEE" | "CONTRACTOR" | "TEMPORARY";

export function buildBranchEmploymentPayload(input: {
  branchId: string;
  employeeCode: string;
  personRef: string;
  relationshipType: EmploymentRelationshipType;
  validFrom: string;
}) {
  return {
    personRef: input.personRef,
    employeeCode: input.employeeCode.trim(),
    relationshipType: input.relationshipType,
    eligibleBranchIds: [input.branchId],
    status: "ACTIVE" as const,
    validFrom: input.validFrom,
  };
}

export function branchesForBrand(
  branches: OrganizationBranch[],
  brandId: string,
) {
  return branches.filter((branch) => branch.brandId === brandId);
}

export function employmentsForBranch(
  employments: BranchEmployment[],
  branchId: string,
) {
  return employments.filter((employment) =>
    employment.eligibleBranchIds.includes(branchId),
  );
}

export function userForEmployment(
  users: OrganizationUser[],
  employment: BranchEmployment,
) {
  return (
    users.find(
      (user) =>
        user.id === employment.personRef || user.email === employment.personRef,
    ) ?? null
  );
}

export function editableMembershipStatus(status: string) {
  const normalized = status.trim().toUpperCase();
  return normalized === "ACTIVE" ||
    normalized === "SUSPENDED" ||
    normalized === "REVOKED"
    ? normalized
    : "INVITED";
}

export function organizationNodeKey(node: OrganizationNode | null) {
  if (!node) return "empty";
  const parent = "parentId" in node ? node.parentId : "root";
  const plazaScope =
    node.type === "plaza"
      ? `:${node.branchId}:${node.salonId ?? "any-salon"}`
      : "";
  return `${node.type}:${node.id ?? "new"}:${parent}${plazaScope}`;
}

export function isOrganizationNodeSelected(
  current: OrganizationNode | null,
  candidate: OrganizationNode,
) {
  return organizationNodeKey(current) === organizationNodeKey(candidate);
}

export function organizationNodeHref(node: OrganizationNode) {
  const params = new URLSearchParams({ node: node.type });
  if (node.id) params.set("id", node.id);
  if ("parentId" in node) params.set("parentId", node.parentId);
  if (node.type === "plaza") {
    params.set("branchId", node.branchId);
    if (node.salonId) params.set("salonId", node.salonId);
  }
  return `/organizacion?${params.toString()}`;
}

export function organizationNodeFromSearch(search: string) {
  const params = new URLSearchParams(search);
  const type = params.get("node");
  const id = params.get("id") || null;

  if (type === "brand") return { type, id } satisfies OrganizationNode;
  if (
    type === "branch" ||
    type === "salon" ||
    type === "service-period" ||
    type === "table"
  ) {
    const parentId = params.get("parentId");
    if (!parentId) return null;
    return { type, id, parentId } satisfies OrganizationNode;
  }
  if (type === "plaza") {
    const parentId = params.get("parentId");
    const branchId = params.get("branchId");
    if (!parentId || !branchId) return null;
    return {
      type,
      id,
      parentId,
      branchId,
      salonId: params.get("salonId"),
    } satisfies OrganizationNode;
  }
  if (type === "employee") {
    const parentId = params.get("parentId");
    if (!id || !parentId) return null;
    return { type, id, parentId } satisfies OrganizationNode;
  }
  if (type === "branch-employees" && id) {
    return { type, id } satisfies OrganizationNode;
  }
  return null;
}

export function organizationPanelTitle(node: OrganizationNode | null) {
  if (!node) return "Detalle pendiente";
  if (node.type === "branch-employees") return "Equipo de la sucursal";
  if (node.type === "employee") return "Detalle de integrante";
  const labels = {
    brand: { detail: "marca", create: "Nueva marca" },
    branch: { detail: "sucursal", create: "Nueva sucursal" },
    salon: { detail: "salón", create: "Nuevo salón" },
    "service-period": {
      detail: "jornada de servicio",
      create: "Nueva jornada",
    },
    plaza: { detail: "plaza", create: "Nueva plaza" },
    table: { detail: "mesa", create: "Nueva mesa" },
  } as const;
  return node.id
    ? `Detalle de ${labels[node.type].detail}`
    : labels[node.type].create;
}
