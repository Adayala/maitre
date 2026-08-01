import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { StateView } from "../../components/state-view.js";
import { useTenantContext } from "../../app/tenant-context.js";
import { useBrandSelection } from "../../app/brand-selection-context.js";
import { resolveSelectedBrandId } from "../../app/brand-selection-model.js";
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
  const { selectedBrandId, selectBrand, clearBrand } = useBrandSelection();
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
  const brands = brandsQuery.data?.data ?? [];
  const branches = branchesQuery.data?.data ?? [];

  useEffect(() => {
    if (!brandsQuery.data) return;
    if (
      selectedBrandId &&
      !resolveSelectedBrandId(
        selectedBrandId,
        brands.map((brand) => brand.id),
      )
    ) {
      clearBrand();
    }
  }, [brands, brandsQuery.data, clearBrand, selectedBrandId]);

  function selectNode(
    node: Parameters<typeof organizationNodeHref>[0],
    brandId?: string,
  ) {
    const inferredBrandId =
      brandId ??
      (node.type === "brand" ? node.id : null) ??
      (node.type === "branch" ? node.parentId : null) ??
      (node.type === "salon"
        ? branches.find((branch) => branch.id === node.parentId)?.brandId
        : node.type === "service-period"
          ? branches.find((branch) => branch.id === node.parentId)?.brandId
          : node.type === "plaza"
            ? branches.find((branch) => branch.id === node.branchId)?.brandId
            : null);
    if (inferredBrandId) selectBrand(inferredBrandId);
    if (node.type === "brand" && !node.id) clearBrand();
    navigate(organizationNodeHref(node));
  }

  return (
    <section className="org-explorer" aria-labelledby="organization-heading">
      <header className="org-explorer__header">
        <div>
          <p className="org-kicker">Paso 02 / Modelo operativo</p>
          <h1 id="organization-heading">Organización</h1>
        </div>
        <p>
          Estás trabajando en{" "}
          <strong>{activeTenant?.name ?? "tu tenant"}</strong>. Expandí la
          estructura física, jornadas, plazas y equipo desde un mismo mapa.
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
            brands={brands}
            branches={branches}
            selectedNode={selectedNode}
            onSelect={selectNode}
          />
          <OrgDetailPanel
            node={selectedNode}
            onSelect={(node) => selectNode(node)}
            onNotify={setAnnouncement}
          />
        </div>
      </StateView>
    </section>
  );
}
