import { NavLink } from "react-router-dom";
import { StateView } from "../../components/state-view.js";
import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { OrgTree } from "./org-tree.js";
import type {
  OrganizationBrand,
  OrganizationBranch,
  OrganizationNode,
} from "./org-explorer-model.js";

interface OrganizationSidebarProps {
  tenantName: string;
  selectedNode: OrganizationNode | null;
  onSelect: (node: OrganizationNode) => void;
}

export function OrganizationSidebar({
  tenantName,
  selectedNode,
  onSelect,
}: OrganizationSidebarProps) {
  const brandsQuery = useTenantQuery<{ data: OrganizationBrand[] }>(
    "organization-brands",
    "/v1/brands",
  );
  const branchesQuery = useTenantQuery<{ data: OrganizationBranch[] }>(
    "organization-branches",
    "/v1/branches",
  );

  return (
    <section
      className="dash-nav__organization"
      aria-labelledby="organization-navigation-heading"
    >
      <NavLink className="dash-nav__organization-link" to="/organizacion" end>
        <span>01 / Estructura</span>
        <strong id="organization-navigation-heading">Organización</strong>
      </NavLink>
      <StateView
        isLoading={brandsQuery.isLoading || branchesQuery.isLoading}
        error={(brandsQuery.error ?? branchesQuery.error) as Error | null}
        onRetry={() =>
          void Promise.all([brandsQuery.refetch(), branchesQuery.refetch()])
        }
      >
        <OrgTree
          variant="sidebar"
          tenantName={tenantName}
          brands={brandsQuery.data?.data ?? []}
          branches={branchesQuery.data?.data ?? []}
          selectedNode={selectedNode}
          onSelect={onSelect}
        />
      </StateView>
    </section>
  );
}
