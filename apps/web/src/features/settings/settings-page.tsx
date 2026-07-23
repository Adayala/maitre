import { useTenantContext } from "../../app/tenant-context.js";

// Minimal placeholder — SPEC-048 lists Settings as a screen but its content
// (which tenant-level settings, exactly) isn't detailed in any spec yet.
export function SettingsPage() {
  const { me, selectedTenantId } = useTenantContext();
  const tenant = me?.tenants.find((t) => t.id === selectedTenantId);

  return (
    <section aria-labelledby="settings-heading">
      <h1 id="settings-heading">Configuración</h1>
      <dl>
        <dt>Tenant</dt>
        <dd>{tenant?.name ?? "—"}</dd>
        <dt>Usuario</dt>
        <dd>{me?.user.displayName ?? "—"}</dd>
      </dl>
    </section>
  );
}
