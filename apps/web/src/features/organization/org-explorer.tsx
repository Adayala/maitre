import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OrgDetailPanel } from "./org-detail-panel.js";
import {
  organizationNodeFromSearch,
  organizationNodeHref,
} from "./org-explorer-model.js";

export function OrgExplorer() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedNode = organizationNodeFromSearch(location.search);
  const [announcement, setAnnouncement] = useState<string | null>(null);

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
      {announcement ? (
        <p className="org-announcement" role="status">
          {announcement}
        </p>
      ) : null}
      <div className="org-explorer__workspace org-explorer__workspace--detail">
        <OrgDetailPanel
          node={selectedNode}
          onSelect={(node) => navigate(organizationNodeHref(node))}
          onNotify={setAnnouncement}
        />
      </div>
    </section>
  );
}
