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
  type OrganizationPlaza,
  type OrganizationSalon,
  type OrganizationServicePeriod,
  type OrganizationTable,
  type OrganizationUser,
} from "./org-explorer-model.js";

interface OrgTreeProps {
  tenantName: string;
  brands: OrganizationBrand[];
  branches: OrganizationBranch[];
  selectedNode: OrganizationNode | null;
  onSelect: (node: OrganizationNode, brandId?: string) => void;
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
                  onClick={() => onSelect(node, brand.id)}
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
                    onSelect(
                      { type: "branch", id: null, parentId: brand.id },
                      brand.id,
                    )
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
                    brandId={brand.id}
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
  brandId,
  selectedNode,
  onSelect,
}: {
  branch: OrganizationBranch;
  brandId: string;
  selectedNode: OrganizationNode | null;
  onSelect: (node: OrganizationNode, brandId?: string) => void;
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
          onClick={() => onSelect(node, brandId)}
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
                onSelect(
                  { type: "salon", id: null, parentId: branch.id },
                  brandId,
                )
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
              {salons.map((salon) => (
                <SalonTreeNode
                  key={salon.id}
                  salon={salon}
                  branch={branch}
                  brandId={brandId}
                  selectedNode={selectedNode}
                  onSelect={onSelect}
                />
              ))}
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
              onClick={() => onSelect(employeeGroupNode, brandId)}
            >
              <span>Equipo / mozos</span>
              <small>
                {employmentsQuery.isLoading ? "…" : employees.length}
              </small>
            </button>
            <button
              type="button"
              className="org-tree__add"
              aria-label={`Agregar persona al equipo de ${branch.name}`}
              title="Agregar persona"
              onClick={() => onSelect(employeeGroupNode, brandId)}
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
                      onClick={() => onSelect(employeeNode, brandId)}
                    >
                      <span aria-hidden="true">└</span>
                      <strong>{user?.name ?? employment.personRef}</strong>
                      <small>
                        {employment.employeeCode} ·{" "}
                        {user?.roleIds[0] ?? employment.relationshipType}
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

function SalonTreeNode({
  salon,
  branch,
  brandId,
  selectedNode,
  onSelect,
}: {
  salon: OrganizationSalon;
  branch: OrganizationBranch;
  brandId: string;
  selectedNode: OrganizationNode | null;
  onSelect: (node: OrganizationNode, brandId?: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const tablesQuery = useTenantQuery<{ data: OrganizationTable[] }>(
    `organization-tables-${salon.id}`,
    `/v1/tables?salonId=${encodeURIComponent(salon.id)}`,
    { enabled: expanded },
  );
  const plazasQuery = useTenantQuery<{ data: OrganizationPlaza[] }>(
    `organization-plazas-${salon.id}`,
    `/v1/plazas?salonId=${encodeURIComponent(salon.id)}`,
    { enabled: expanded },
  );
  const periodsQuery = useTenantQuery<{ data: OrganizationServicePeriod[] }>(
    `organization-periods-${branch.id}`,
    `/v1/branches/${encodeURIComponent(branch.id)}/service-periods`,
    { enabled: expanded },
  );
  const tables = tablesQuery.data?.data ?? [];
  const plazas = plazasQuery.data?.data ?? [];
  const periods = periodsQuery.data?.data ?? [];
  const salonNode = {
    type: "salon",
    id: salon.id,
    parentId: branch.id,
  } as const;
  const assignedTableIds = new Set(plazas.flatMap((plaza) => plaza.tableIds));
  const unassignedTables = tables.filter(
    (table) => !assignedTableIds.has(table.id),
  );
  const hasError = tablesQuery.error || plazasQuery.error || periodsQuery.error;

  return (
    <li className="org-tree__salon">
      <div className="org-tree__resource-row">
        <button
          type="button"
          className="org-tree__toggle"
          aria-expanded={expanded}
          aria-label={`${expanded ? "Contraer" : "Expandir"} ${salon.name}`}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "−" : "+"}
        </button>
        <button
          type="button"
          className={
            isOrganizationNodeSelected(selectedNode, salonNode)
              ? "org-tree__group-button is-selected"
              : "org-tree__group-button"
          }
          onClick={() => onSelect(salonNode, brandId)}
        >
          <span>{salon.name}</span>
          <small>{salon.capacity} cubiertos máximos</small>
        </button>
        <button
          type="button"
          className="org-tree__add"
          aria-label={`Crear mesa en ${salon.name}`}
          title="Crear mesa"
          onClick={() =>
            onSelect({ type: "table", id: null, parentId: salon.id }, brandId)
          }
        >
          +
        </button>
      </div>
      {expanded && hasError ? (
        <TreeLoadError
          label={`la operación de ${salon.name}`}
          onRetry={() =>
            void Promise.all([
              tablesQuery.refetch(),
              plazasQuery.refetch(),
              periodsQuery.refetch(),
            ])
          }
        />
      ) : null}
      {expanded && !hasError ? (
        <ul className="org-tree__plazas">
          <li className="org-tree__subgroup">
            <div>
              <span>Plazas por jornada</span>
              <small>{plazasQuery.isLoading ? "…" : plazas.length}</small>
              <button
                type="button"
                aria-label={`Crear plaza en ${salon.name}`}
                onClick={() =>
                  onSelect(
                    { type: "plaza", id: null, parentId: salon.id },
                    brandId,
                  )
                }
              >
                +
              </button>
            </div>
          </li>
          {plazas.map((plaza) => {
            const plazaNode = {
              type: "plaza",
              id: plaza.id,
              parentId: salon.id,
            } as const;
            const period = periods.find(
              (item) => item.id === plaza.servicePeriodId,
            );
            return (
              <li key={plaza.id} className="org-tree__plaza">
                <button
                  type="button"
                  className={
                    isOrganizationNodeSelected(selectedNode, plazaNode)
                      ? "org-tree__leaf is-selected"
                      : "org-tree__leaf"
                  }
                  onClick={() => onSelect(plazaNode, brandId)}
                >
                  <span aria-hidden="true">⌁</span>
                  <strong>{plaza.name}</strong>
                  <small>
                    {period
                      ? `${period.name} · ${period.businessDate}`
                      : "Jornada"}
                  </small>
                </button>
                <ul>
                  {plaza.tableIds.map((tableId) => {
                    const table = tables.find((item) => item.id === tableId);
                    if (!table) return null;
                    return (
                      <TableTreeLeaf
                        key={table.id}
                        table={table}
                        brandId={brandId}
                        selectedNode={selectedNode}
                        onSelect={onSelect}
                      />
                    );
                  })}
                </ul>
              </li>
            );
          })}
          {!plazasQuery.isLoading && plazas.length === 0 ? (
            <li className="org-tree__empty">
              Sin plazas para las jornadas cargadas
            </li>
          ) : null}
          {unassignedTables.length > 0 ? (
            <li className="org-tree__subgroup">
              <div>
                <span>Mesas sin plaza</span>
                <small>{unassignedTables.length}</small>
              </div>
              <ul>
                {unassignedTables.map((table) => (
                  <TableTreeLeaf
                    key={table.id}
                    table={table}
                    brandId={brandId}
                    selectedNode={selectedNode}
                    onSelect={onSelect}
                  />
                ))}
              </ul>
            </li>
          ) : null}
        </ul>
      ) : null}
    </li>
  );
}

function TableTreeLeaf({
  table,
  brandId,
  selectedNode,
  onSelect,
}: {
  table: OrganizationTable;
  brandId: string;
  selectedNode: OrganizationNode | null;
  onSelect: (node: OrganizationNode, brandId?: string) => void;
}) {
  const node = {
    type: "table",
    id: table.id,
    parentId: table.salonId,
  } as const;
  return (
    <li>
      <button
        type="button"
        className={
          isOrganizationNodeSelected(selectedNode, node)
            ? "org-tree__leaf org-tree__leaf--table is-selected"
            : "org-tree__leaf org-tree__leaf--table"
        }
        onClick={() => onSelect(node, brandId)}
      >
        <span aria-hidden="true">└</span>
        <strong>{table.name || `Mesa ${table.number}`}</strong>
        <small>{table.capacity} cubiertos</small>
      </button>
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
