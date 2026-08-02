import { useState } from "react";
import { useTenantQuery } from "../../lib/use-tenant-query.js";
import {
  branchesForBrand,
  isOrganizationNodeSelected,
  plazasForServicePeriod,
  plazaModeLabel,
  servicePeriodStatusLabel,
  servicePeriodTypeLabel,
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
          <span>Mapa del tenant</span>
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
  const [structureExpanded, setStructureExpanded] = useState(false);
  const [operationsExpanded, setOperationsExpanded] = useState(false);
  const [employeesExpanded, setEmployeesExpanded] = useState(false);
  const salonsQuery = useTenantQuery<{ data: OrganizationSalon[] }>(
    `salons-${branch.id}`,
    `/v1/salons?branchId=${encodeURIComponent(branch.id)}`,
    { enabled: structureExpanded || operationsExpanded },
  );
  const periodsQuery = useTenantQuery<{ data: OrganizationServicePeriod[] }>(
    `organization-periods-${branch.id}`,
    `/v1/branches/${encodeURIComponent(branch.id)}/service-periods`,
    { enabled: operationsExpanded },
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
  const periods = periodsQuery.data?.data ?? [];
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
    <li className="org-tree__branch">
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
        <li className="org-tree__domain-group">
          <div className="org-tree__resource-row">
            <button
              type="button"
              className="org-tree__toggle"
              aria-expanded={structureExpanded}
              aria-label={`${structureExpanded ? "Contraer" : "Expandir"} estructura física de ${branch.name}`}
              onClick={() => setStructureExpanded((value) => !value)}
            >
              {structureExpanded ? "−" : "+"}
            </button>
            <button
              type="button"
              className="org-tree__group-button org-tree__group-button--domain"
              onClick={() => setStructureExpanded(true)}
            >
              <span>Estructura física</span>
              <small>
                {salonsQuery.isLoading
                  ? "Cargando…"
                  : `${salons.length} salones`}
              </small>
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
          {structureExpanded && salonsQuery.error ? (
            <TreeLoadError
              label="la estructura física"
              onRetry={() => void salonsQuery.refetch()}
            />
          ) : null}
          {structureExpanded && !salonsQuery.error ? (
            <ul className="org-tree__domain-children">
              <li className="org-tree__section-label">
                <span>Salones y mesas</span>
                <small>{salons.length}</small>
              </li>
              {salons.map((salon) => (
                <SalonTreeNode
                  key={salon.id}
                  salon={salon}
                  brandId={brandId}
                  selectedNode={selectedNode}
                  onSelect={onSelect}
                />
              ))}
              {!salonsQuery.isLoading && salons.length === 0 ? (
                <li className="org-tree__empty org-tree__empty--actionable">
                  Sin salones. Creá uno para comenzar a ubicar mesas.
                </li>
              ) : null}
            </ul>
          ) : null}
        </li>

        <li className="org-tree__domain-group">
          <div className="org-tree__resource-row">
            <button
              type="button"
              className="org-tree__toggle"
              aria-expanded={operationsExpanded}
              aria-label={`${operationsExpanded ? "Contraer" : "Expandir"} operación de servicio de ${branch.name}`}
              onClick={() => setOperationsExpanded((value) => !value)}
            >
              {operationsExpanded ? "−" : "+"}
            </button>
            <button
              type="button"
              className="org-tree__group-button org-tree__group-button--domain"
              onClick={() => setOperationsExpanded(true)}
            >
              <span>Operación de servicio</span>
              <small>
                {periodsQuery.isLoading
                  ? "Cargando…"
                  : `${periods.length} jornadas · Plazas`}
              </small>
            </button>
            <button
              type="button"
              className="org-tree__add"
              aria-label={`Crear jornada en ${branch.name}`}
              title="Crear jornada"
              onClick={() =>
                onSelect(
                  {
                    type: "service-period",
                    id: null,
                    parentId: branch.id,
                  },
                  brandId,
                )
              }
            >
              +
            </button>
          </div>
          {operationsExpanded && (periodsQuery.error || salonsQuery.error) ? (
            <TreeLoadError
              label="la operación de servicio"
              onRetry={() =>
                void Promise.all([
                  periodsQuery.refetch(),
                  salonsQuery.refetch(),
                ])
              }
            />
          ) : null}
          {operationsExpanded && !periodsQuery.error && !salonsQuery.error ? (
            <ul className="org-tree__domain-children">
              <li className="org-tree__section-label">
                <span>Jornadas y plazas</span>
                <small>{periods.length}</small>
              </li>
              {periods.map((period) => (
                <ServicePeriodTreeNode
                  key={period.id}
                  period={period}
                  branch={branch}
                  salons={salons}
                  brandId={brandId}
                  selectedNode={selectedNode}
                  onSelect={onSelect}
                />
              ))}
              {!periodsQuery.isLoading && periods.length === 0 ? (
                <li className="org-tree__empty org-tree__empty--actionable">
                  Sin jornadas. Creá una para organizar sus plazas.
                </li>
              ) : null}
            </ul>
          ) : null}
        </li>

        <li className="org-tree__domain-group">
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
                  ? "org-tree__group-button org-tree__group-button--domain is-selected"
                  : "org-tree__group-button org-tree__group-button--domain"
              }
              onClick={() => onSelect(employeeGroupNode, brandId)}
            >
              <span>Equipo</span>
              <small>
                {employmentsQuery.isLoading
                  ? "Cargando…"
                  : `${employees.length} personas · Mozos`}
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
            <ul className="org-tree__domain-children">
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
                      <span aria-hidden="true">↳</span>
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
  brandId,
  selectedNode,
  onSelect,
}: {
  salon: OrganizationSalon;
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
  const tables = tablesQuery.data?.data ?? [];
  const salonNode = {
    type: "salon",
    id: salon.id,
    parentId: salon.branchId,
  } as const;

  return (
    <li className="org-tree__salon">
      <div className="org-tree__resource-row">
        <button
          type="button"
          className="org-tree__toggle"
          aria-expanded={expanded}
          aria-label={`${expanded ? "Contraer" : "Expandir"} mesas de ${salon.name}`}
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
          <small>{salon.capacity} cubiertos máx.</small>
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
      {expanded && tablesQuery.error ? (
        <TreeLoadError
          label={`las mesas de ${salon.name}`}
          onRetry={() => void tablesQuery.refetch()}
        />
      ) : null}
      {expanded && !tablesQuery.error ? (
        <ul className="org-tree__nested-list">
          <li className="org-tree__section-label">
            <span>Mesas</span>
            <small>{tablesQuery.isLoading ? "…" : tables.length}</small>
          </li>
          {tables.map((table) => (
            <TableTreeLeaf
              key={table.id}
              table={table}
              brandId={brandId}
              selectedNode={selectedNode}
              onSelect={onSelect}
            />
          ))}
          {!tablesQuery.isLoading && tables.length === 0 ? (
            <li className="org-tree__empty">Sin mesas en este salón</li>
          ) : null}
        </ul>
      ) : null}
    </li>
  );
}

function ServicePeriodTreeNode({
  period,
  branch,
  salons,
  brandId,
  selectedNode,
  onSelect,
}: {
  period: OrganizationServicePeriod;
  branch: OrganizationBranch;
  salons: OrganizationSalon[];
  brandId: string;
  selectedNode: OrganizationNode | null;
  onSelect: (node: OrganizationNode, brandId?: string) => void;
}) {
  const plazasQuery = useTenantQuery<{ data: OrganizationPlaza[] }>(
    `organization-plazas-period-${period.id}`,
    `/v1/plazas?servicePeriodId=${encodeURIComponent(period.id)}`,
  );
  const plazas = plazasForServicePeriod(
    plazasQuery.data?.data ?? [],
    period.id,
  );
  const periodNode = {
    type: "service-period",
    id: period.id,
    parentId: branch.id,
  } as const;

  return (
    <li className="org-tree__period">
      <div className="org-tree__period-row">
        <span
          className={`org-tree__status-dot org-tree__status-dot--${period.status.toLowerCase()}`}
          aria-hidden="true"
        />
        <button
          type="button"
          className={
            isOrganizationNodeSelected(selectedNode, periodNode)
              ? "org-tree__node org-tree__node--period is-selected"
              : "org-tree__node org-tree__node--period"
          }
          onClick={() => onSelect(periodNode, brandId)}
        >
          <span>
            {servicePeriodTypeLabel(period.type)} · {period.businessDate}
          </span>
          <strong>{period.name}</strong>
          <small>
            {servicePeriodStatusLabel(period.status)} · {plazas.length} plazas
          </small>
        </button>
        <button
          type="button"
          className="org-tree__add"
          aria-label={`Crear plaza en ${period.name}`}
          title="Crear plaza"
          disabled={period.status !== "PLANNED" && period.status !== "OPEN"}
          onClick={() =>
            onSelect(
              {
                type: "plaza",
                id: null,
                parentId: period.id,
                branchId: branch.id,
                salonId: null,
              },
              brandId,
            )
          }
        >
          +
        </button>
      </div>
      {plazasQuery.error ? (
        <TreeLoadError
          label={`las plazas de ${period.name}`}
          onRetry={() => void plazasQuery.refetch()}
        />
      ) : (
        <ul className="org-tree__nested-list org-tree__nested-list--plazas">
          <li className="org-tree__section-label">
            <span>Plazas</span>
            <small>{plazasQuery.isLoading ? "…" : plazas.length}</small>
          </li>
          {plazas.map((plaza) => {
            const plazaNode = {
              type: "plaza",
              id: plaza.id,
              parentId: period.id,
              branchId: branch.id,
              salonId: plaza.salonId,
            } as const;
            const salon = salons.find((item) => item.id === plaza.salonId);
            return (
              <li key={plaza.id}>
                <button
                  type="button"
                  className={
                    isOrganizationNodeSelected(selectedNode, plazaNode)
                      ? "org-tree__leaf org-tree__leaf--plaza is-selected"
                      : "org-tree__leaf org-tree__leaf--plaza"
                  }
                  onClick={() => onSelect(plazaNode, brandId)}
                >
                  <span aria-hidden="true">⌁</span>
                  <strong>{plaza.name}</strong>
                  <small>
                    {plazaModeLabel(plaza.mode ?? "VARIABLE")} ·{" "}
                    {salon?.name ?? "Salón"} · {plaza.tableIds.length} mesas
                  </small>
                </button>
              </li>
            );
          })}
          {!plazasQuery.isLoading && plazas.length === 0 ? (
            <li className="org-tree__empty org-tree__empty--actionable">
              Sin plazas. Usá “+” para agrupar mesas y asignar un mozo.
            </li>
          ) : null}
        </ul>
      )}
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
        <span aria-hidden="true">↳</span>
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
    <div className="org-tree__load-error" role="alert">
      No se pudo cargar {label}.{" "}
      <button type="button" onClick={onRetry}>
        Reintentar
      </button>
    </div>
  );
}
