import { useState, type ReactNode } from "react";
import { useAuth } from "../app/auth-context.js";
import { useSession } from "../app/session-context.js";

export function AppHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  const { selectedBranch, selectBranch, selectRegister } = useSession();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="app-header">
      <span className="hdr-logo" aria-hidden="true">
        💳
      </span>

      <div className="hdr-titles">
        <h1 className="hdr-title">{title}</h1>
        {subtitle && <p className="hdr-sub">{subtitle}</p>}
      </div>

      <div className="hdr-right">
        {right}
        <div className="hdr-menu-wrap">
          <button
            type="button"
            className="btn--icon-round"
            aria-label="Menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            ⋯
          </button>
          {menuOpen && (
            <>
              <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="hdr-menu" role="menu">
                <div className="hdr-menu-branch">{selectedBranch?.name ?? "Sucursal"}</div>
                <button
                  type="button"
                  className="hdr-menu-item"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    selectRegister("");
                    selectBranch("");
                  }}
                >
                  Cambiar caja
                </button>
                <button
                  type="button"
                  className="hdr-menu-item hdr-menu-item--danger"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    void signOut();
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
