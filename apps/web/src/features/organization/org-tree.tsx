import { useState } from "react";
import { useTenantQuery } from "../../lib/use-tenant-query.js";
import {
  branchesForBrand,
  isOrganizationNodeSelected,
  type BranchEmployment,
  type OrganizationBrand,
  type OrganizationBranch,
  type OrganizationNode,
  type OrganizationSalon,
} from "./org-explorer-model.js";

interface OrgTreeProps {
  variant?: "panel" | "sidebar";
  tenantName: string;
  brands: OrganizationBrand[];
  branches: OrganizationBranch[];
  selectedNode: OrganizationNode | null;
  onSelect: (node: OrganizationNode) => void;
}

export function OrgTree({
  variant = "panel",
  tenantName,
  brands,
  branches,
  selectedNode,
  onSelect,
}: OrgTreeProps) {
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(
    () => new Set(),
  );

  function toggleBrand(id: string) {
    setExpandedBrands((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const Root = variant === "sidebar" ? "section" : "aside";

  return (
    <Root
      className={`org-tree org-tree--${variant}`}
      aria-label="Jerarquía de la organización"
    >
      <div className="org-tree__toolbar">
        <div>
          <span>Mapa organizacional</span>
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
        <small>Tenant</small>
      </div>
      {brands.length === 0 ? (
        <p className="org-tree__empty">
          No hay marcas. Usá “+” para crear la primera.
        </p>
      ) : null}
      <ul className="org-tree__list">
        {brands.map((brand) => {
          const expanded = expandedBrands.has(brand.id);
          const node = { type: "brand", id: brand.id } as const;
          const brandBranches = branchesForBrand(branches, brand.id);
          return (
            <li key={brand.id}>
              <div className="org-tree__row org-tree__row--brand">
                <button
                  type="button"
                  className="org-tree__toggle"
                  aria-expanded={expanded}
                  aria-label={`${expanded ? "Contraer" : "Expandir"} ${brand.name}`}
                  onClick={() => toggleBrand(brand.id)}
                >
                  {expanded ? "−" : "+"}
                </button>
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
              {expanded ? (
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
              ) : null}
            </li>
          );
        })}
      </ul>
    </Root>
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
  const [expanded, setExpanded] = useState(false);
  const salonsQuery = useTenantQuery<{ data: OrganizationSalon[] }>(
    `salons-${branch.id}`,
    `/v1/salons?branchId=${encodeURIComponent(branch.id)}`,
    { enabled: expanded },
  );
  const employmentsQuery = useTenantQuery<{ data: BranchEmployment[] }>(
    `branch-employments-${branch.id}`,
    `/v1/branches/${encodeURIComponent(branch.id)}/employments`,
    { enabled: expanded },
  );
  const salons = salonsQuery.data?.data ?? [];
  const employees = employmentsQuery.data?.data ?? [];
  const node = {
    type: "branch",
    id: branch.id,
    parentId: branch.brandId,
  } as const;

  return (
    <li>
      <div className="org-tree__row org-tree__row--branch">
        <button
          type="button"
          className="org-tree__toggle"
          aria-expanded={expanded}
          aria-label={`${expanded ? "Contraer" : "Expandir"} ${branch.name}`}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "−" : "+"}
        </button>
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
      {expanded ? (
        <ul>
          <li>
            <div className="org-tree__group-label">
              <span>Salones</span>
              <small>{salonsQuery.isLoading ? "…" : salons.length}</small>
            </div>
            {salonsQuery.error ? (
              <TreeLoadError
                label="salones"
                onRetry={() => void salonsQuery.refetch()}
              />
            ) : null}
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
                      {salon.name}
                      <small>{salon.capacity}</small>
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
          </li>
          <li>
            <button
              type="button"
              className={
                isOrganizationNodeSelected(selectedNode, {
                  type: "branch-employees",
                  id: branch.id,
                })
                  ? "org-tree__group-button is-selected"
                  : "org-tree__group-button"
              }
              onClick={() =>
                onSelect({ type: "branch-employees", id: branch.id })
              }
            >
              <span>Empleados</span>
              <small>
                {employmentsQuery.isLoading ? "…" : employees.length}
              </small>
            </button>
            {employmentsQuery.error ? (
              <TreeLoadError
                label="empleados"
                onRetry={() => void employmentsQuery.refetch()}
              />
            ) : null}
          </li>
        </ul>
      ) : null}
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
