export type OrganizationNode =
  | { type: "brand"; id: string | null }
  | { type: "branch"; id: string | null; parentId: string }
  | { type: "salon"; id: string | null; parentId: string }
  | { type: "branch-employees"; id: string };

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

export interface BranchEmployment {
  id: string;
  personRef: string;
  employeeCode: string;
  eligibleBranchIds: string[];
  status: string;
  relationshipType: string;
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

export function organizationNodeKey(node: OrganizationNode | null) {
  if (!node) return "empty";
  return `${node.type}:${node.id ?? "new"}:${"parentId" in node ? node.parentId : "root"}`;
}

export function isOrganizationNodeSelected(
  current: OrganizationNode | null,
  candidate: OrganizationNode,
) {
  return organizationNodeKey(current) === organizationNodeKey(candidate);
}

export function organizationPanelTitle(node: OrganizationNode | null) {
  if (!node) return "Detalle pendiente";
  if (node.type === "branch-employees") return "Empleados de la sucursal";
  const labels = {
    brand: { detail: "marca", create: "Nueva marca" },
    branch: { detail: "sucursal", create: "Nueva sucursal" },
    salon: { detail: "salón", create: "Nuevo salón" },
  } as const;
  return node.id
    ? `Detalle de ${labels[node.type].detail}`
    : labels[node.type].create;
}
