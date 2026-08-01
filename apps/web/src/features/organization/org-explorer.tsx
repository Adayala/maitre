import { useEffect, useState } from "react";
import { StateView } from "../../components/state-view.js";
import { useTenantContext } from "../../app/tenant-context.js";
import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { OrgTree } from "./org-tree.js";
import { OrgDetailPanel } from "./org-detail-panel.js";
import type {
  OrganizationBrand,
  OrganizationBranch,
  OrganizationNode,
} from "./org-explorer-model.js";

export function OrgExplorer() {
  const { me, selectedTenantId } = useTenantContext();
  const tenant = me?.tenants.find((item) => item.id === selectedTenantId);
  const brandsQuery = useTenantQuery<{ data: OrganizationBrand[] }>(
    "organization-brands",
    "/v1/brands",
  );
  const branchesQuery = useTenantQuery<{ data: OrganizationBranch[] }>(
    "organization-branches",
    "/v1/branches",
  );
  const [selectedNode, setSelectedNode] = useState<OrganizationNode | null>(
    null,
  );
  const [announcement, setAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    setSelectedNode(null);
    setAnnouncement(null);
  }, [selectedTenantId]);

  return (
    <section className="org-explorer" aria-labelledby="organization-heading">
      <header className="org-explorer__header">
        <div>
          <p className="org-kicker">Paso 02 / Estructura operativa</p>
          <h1 id="organization-heading">Organización</h1>
        </div>
        <p>
          Explorá la jerarquía real del negocio y gestioná cada nivel sin perder
          contexto.
        </p>
      </header>
      <StateView
        isLoading={brandsQuery.isLoading || branchesQuery.isLoading}
        error={(brandsQuery.error ?? branchesQuery.error) as Error | null}
        onRetry={() =>
          void Promise.all([brandsQuery.refetch(), branchesQuery.refetch()])
        }
      >
        <>
          {announcement ? (
            <p className="org-announcement" role="status">
              {announcement}
            </p>
          ) : null}
          <div className="org-explorer__workspace">
            <OrgTree
              tenantName={tenant?.name ?? "Tenant activo"}
              brands={brandsQuery.data?.data ?? []}
              branches={branchesQuery.data?.data ?? []}
              selectedNode={selectedNode}
              onSelect={setSelectedNode}
            />
            <OrgDetailPanel
              node={selectedNode}
              onSelect={setSelectedNode}
              onNotify={setAnnouncement}
            />
          </div>
        </>
      </StateView>
    </section>
  );
}
