import { useState } from "react";
import { useTenantQuery } from "../../lib/use-tenant-query.js";
import {
  branchesForBrand,
  isOrganizationNodeSelected,
  userForEmployment,
  type BranchEmployment,
  type OrganizationBrand,
  type OrganizationBranch,
  type OrganizationNode,
  type OrganizationSalon,
  type OrganizationUser,
} from "./org-explorer-model.js";

interface OrgTreeProps {
  tenantName: string;
  brands: OrganizationBrand[];
  branches: OrganizationBranch[];
  selectedNode: OrganizationNode | null;
  onSelect: (node: OrganizationNode) => void;
}

export function OrgTree({
  tenantName,
  brands,
  branches,
  selectedNode,
  onSelect,
}: OrgTreeProps) {
  return (
    <aside
      className="org-tree org-tree--panel"
      aria-label="Jerarquía editable de la organización"
    >
      <div className="org-tree__toolbar">
        <div>
          <span>Árbol editable</span>
          <strong>{brands.length} marca(s)</strong>
        </div>
        <button
          type="button"
          aria-label="Crear marca"
          title="Crear marca"
          onClick={() => onSelect({ type: "brand", id: null })}
        >
          +
        </button>
      </div>
      <div className="org-tree__root">
        <span aria-hidden="true">◆</span>
        <strong>{tenantName}</strong>
        <small>Tenant de trabajo</small>
      </div>
      {brands.length === 0 ? (
        <p className="org-tree__empty">
          No hay marcas. Usá “+” para crear la primera.
        </p>
      ) : null}
      <ul className="org-tree__list">
        {brands.map((brand) => {
          const node = { type: "brand", id: brand.id } as const;
          const brandBranches = branchesForBrand(branches, brand.id);
          return (
            <li key={brand.id}>
              <div className="org-tree__row org-tree__row--brand">
                <span className="org-tree__connector" aria-hidden="true">
                  ◇
                </span>
                <button
                  type="button"
                  className={
                    isOrganizationNodeSelected(selectedNode, node)
                      ? "org-tree__node is-selected"
                      : "org-tree__node"
                  }
                  onClick={() => onSelect(node)}
                >
                  <span>Marca</span>
                  <strong>{brand.name}</strong>
                </button>
                <button
                  type="button"
                  className="org-tree__add"
                  aria-label={`Crear sucursal en ${brand.name}`}
                  title="Crear sucursal"
                  onClick={() =>
                    onSelect({ type: "branch", id: null, parentId: brand.id })
                  }
                >
                  +
                </button>
              </div>
              <ul>
                {brandBranches.map((branch) => (
                  <BranchTreeNode
                    key={branch.id}
                    branch={branch}
                    selectedNode={selectedNode}
                    onSelect={onSelect}
                  />
                ))}
                {brandBranches.length === 0 ? (
                  <li className="org-tree__empty">Sin sucursales</li>
                ) : null}
              </ul>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function BranchTreeNode({
  branch,
  selectedNode,
  onSelect,
}: {
  branch: OrganizationBranch;
  selectedNode: OrganizationNode | null;
  onSelect: (node: OrganizationNode) => void;
}) {
  const [salonsExpanded, setSalonsExpanded] = useState(false);
  const [employeesExpanded, setEmployeesExpanded] = useState(false);
  const salonsQuery = useTenantQuery<{ data: OrganizationSalon[] }>(
    `salons-${branch.id}`,
    `/v1/salons?branchId=${encodeURIComponent(branch.id)}`,
    { enabled: salonsExpanded },
  );
  const employmentsQuery = useTenantQuery<{ data: BranchEmployment[] }>(
    `branch-employments-${branch.id}`,
    `/v1/branches/${encodeURIComponent(branch.id)}/employments`,
    { enabled: employeesExpanded },
  );
  const usersQuery = useTenantQuery<{ data: OrganizationUser[] }>(
    "organization-users",
    "/v1/users",
    { enabled: employeesExpanded },
  );
  const salons = salonsQuery.data?.data ?? [];
  const employees = employmentsQuery.data?.data ?? [];
  const users = usersQuery.data?.data ?? [];
  const node = {
    type: "branch",
    id: branch.id,
    parentId: branch.brandId,
  } as const;
  const employeeGroupNode = {
    type: "branch-employees",
    id: branch.id,
  } as const;

  return (
    <li>
      <div className="org-tree__row org-tree__row--branch">
        <span className="org-tree__connector" aria-hidden="true">
          ├
        </span>
        <button
          type="button"
          className={
            isOrganizationNodeSelected(selectedNode, node)
              ? "org-tree__node is-selected"
              : "org-tree__node"
          }
          onClick={() => onSelect(node)}
        >
          <span>Sucursal · {branch.code}</span>
          <strong>{branch.name}</strong>
        </button>
      </div>
      <ul className="org-tree__resources">
        <li>
          <div className="org-tree__resource-row">
            <button
              type="button"
              className="org-tree__toggle"
              aria-expanded={salonsExpanded}
              aria-label={`${salonsExpanded ? "Contraer" : "Expandir"} salones de ${branch.name}`}
              onClick={() => setSalonsExpanded((value) => !value)}
            >
              {salonsExpanded ? "−" : "+"}
            </button>
            <button
              type="button"
              className="org-tree__group-button"
              onClick={() => setSalonsExpanded(true)}
            >
              <span>Salones</span>
              <small>{salonsQuery.isLoading ? "…" : salons.length}</small>
            </button>
            <button
              type="button"
              className="org-tree__add"
              aria-label={`Crear salón en ${branch.name}`}
              title="Crear salón"
              onClick={() =>
                onSelect({ type: "salon", id: null, parentId: branch.id })
              }
            >
              +
            </button>
          </div>
          {salonsExpanded && salonsQuery.error ? (
            <TreeLoadError
              label="salones"
              onRetry={() => void salonsQuery.refetch()}
            />
          ) : null}
          {salonsExpanded ? (
            <ul>
              {salons.map((salon) => {
                const salonNode = {
                  type: "salon",
                  id: salon.id,
                  parentId: branch.id,
                } as const;
                return (
                  <li key={salon.id}>
                    <button
                      type="button"
                      className={
                        isOrganizationNodeSelected(selectedNode, salonNode)
                          ? "org-tree__leaf is-selected"
                          : "org-tree__leaf"
                      }
                      onClick={() => onSelect(salonNode)}
                    >
                      <span aria-hidden="true">└</span>
                      <strong>{salon.name}</strong>
                      <small>{salon.capacity} cubiertos</small>
                    </button>
                  </li>
                );
              })}
              {!salonsQuery.isLoading &&
              !salonsQuery.error &&
              salons.length === 0 ? (
                <li className="org-tree__empty">Sin salones</li>
              ) : null}
            </ul>
          ) : null}
        </li>
        <li>
          <div className="org-tree__resource-row">
            <button
              type="button"
              className="org-tree__toggle"
              aria-expanded={employeesExpanded}
              aria-label={`${employeesExpanded ? "Contraer" : "Expandir"} equipo de ${branch.name}`}
              onClick={() => setEmployeesExpanded((value) => !value)}
            >
              {employeesExpanded ? "−" : "+"}
            </button>
            <button
              type="button"
              className={
                isOrganizationNodeSelected(selectedNode, employeeGroupNode)
                  ? "org-tree__group-button is-selected"
                  : "org-tree__group-button"
              }
              onClick={() => onSelect(employeeGroupNode)}
            >
              <span>Equipo / mozos</span>
              <small>{employmentsQuery.isLoading ? "…" : employees.length}</small>
            </button>
            <button
              type="button"
              className="org-tree__add"
              aria-label={`Agregar persona al equipo de ${branch.name}`}
              title="Agregar persona"
              onClick={() => onSelect(employeeGroupNode)}
            >
              +
            </button>
          </div>
          {employeesExpanded && (employmentsQuery.error || usersQuery.error) ? (
            <TreeLoadError
              label="el equipo"
              onRetry={() =>
                void Promise.all([
                  employmentsQuery.refetch(),
                  usersQuery.refetch(),
                ])
              }
            />
          ) : null}
          {employeesExpanded ? (
            <ul>
              {employees.map((employment) => {
                const user = userForEmployment(users, employment);
                const employeeNode = {
                  type: "employee",
                  id: employment.id,
                  parentId: branch.id,
                } as const;
                return (
                  <li key={employment.id}>
                    <button
                      type="button"
                      className={
                        isOrganizationNodeSelected(selectedNode, employeeNode)
                          ? "org-tree__leaf is-selected"
                          : "org-tree__leaf"
                      }
                      onClick={() => onSelect(employeeNode)}
                    >
                      <span aria-hidden="true">└</span>
                      <strong>{user?.name ?? employment.personRef}</strong>
                      <small>
                        {employment.employeeCode} · {user?.roleIds[0] ?? employment.relationshipType}
                      </small>
                    </button>
                  </li>
                );
              })}
              {!employmentsQuery.isLoading &&
              !employmentsQuery.error &&
              employees.length === 0 ? (
                <li className="org-tree__empty">Sin personas asignadas</li>
              ) : null}
            </ul>
          ) : null}
        </li>
      </ul>
    </li>
  );
}

function TreeLoadError({
  label,
  onRetry,
}: {
  label: string;
  onRetry: () => void;
}) {
  return (
    <p role="alert" className="org-tree__load-error">
      No se pudieron cargar {label}.{" "}
      <button type="button" onClick={onRetry}>
        Reintentar
      </button>
    </p>
  );
}
