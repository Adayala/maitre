import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { StateView } from "../../components/state-view.js";
import { useTenantContext } from "../../app/tenant-context.js";
import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { OrgDetailPanel } from "./org-detail-panel.js";
import { OrgTree } from "./org-tree.js";
import {
  organizationNodeFromSearch,
  organizationNodeHref,
  type OrganizationBrand,
  type OrganizationBranch,
} from "./org-explorer-model.js";

export function OrgExplorer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { me, selectedTenantId } = useTenantContext();
  const selectedNode = organizationNodeFromSearch(location.search);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const activeTenant = me?.tenants.find(
    (tenant) => tenant.id === selectedTenantId,
  );
  const brandsQuery = useTenantQuery<{ data: OrganizationBrand[] }>(
    "organization-brands",
    "/v1/brands",
  );
  const branchesQuery = useTenantQuery<{ data: OrganizationBranch[] }>(
    "organization-branches",
    "/v1/branches",
  );

  return (
    <section className="org-explorer" aria-labelledby="organization-heading">
      <header className="org-explorer__header">
        <div>
          <p className="org-kicker">Paso 02 / Estructura operativa</p>
          <h1 id="organization-heading">Organización</h1>
        </div>
        <p>
          Estás trabajando en <strong>{activeTenant?.name ?? "tu tenant"}</strong>.
          Expandí la estructura y elegí cualquier elemento para editarlo.
        </p>
      </header>
      {announcement ? (
        <p className="org-announcement" role="status">
          {announcement}
        </p>
      ) : null}
      <StateView
        isLoading={brandsQuery.isLoading || branchesQuery.isLoading}
        error={(brandsQuery.error ?? branchesQuery.error) as Error | null}
        onRetry={() =>
          void Promise.all([brandsQuery.refetch(), branchesQuery.refetch()])
        }
      >
        <div className="org-explorer__workspace">
          <OrgTree
            tenantName={activeTenant?.name ?? "Tenant activo"}
            brands={brandsQuery.data?.data ?? []}
            branches={branchesQuery.data?.data ?? []}
            selectedNode={selectedNode}
            onSelect={(node) => navigate(organizationNodeHref(node))}
          />
          <OrgDetailPanel
            node={selectedNode}
            onSelect={(node) => navigate(organizationNodeHref(node))}
            onNotify={setAnnouncement}
          />
        </div>
      </StateView>
    </section>
  );
}
