import { useTenantContext } from "../../app/tenant-context.js";

// Minimal placeholder — SPEC-048 lists Settings as a screen but its content
// (which tenant-level settings, exactly) isn't detailed in any spec yet.
export function SettingsPage() {
  const { me, selectedTenantId } = useTenantContext();
  const tenant = me?.tenants.find((t) => t.id === selectedTenantId);
  const settingsAreas = [
    {
      title: "Identidad del tenant",
      description: "Nombre visible, estructura base y contexto general de operación.",
      status: tenant ? "Listo para revisar" : "Pendiente de contexto",
    },
    {
      title: "Experiencia cliente",
      description: "Lo que después impacta menú público, promociones, reserva y seguimiento.",
      status: "A definir por módulo",
    },
    {
      title: "Operación interna",
      description: "Parámetros que afectan caja, cocina, floor y flujos del staff.",
      status: "Depende de features habilitadas",
    },
    {
      title: "Fiscal / suscripción",
      description: "Configuración comercial, límites y capacidades del tenant.",
      status: "Coordinar con billing y fiscal",
    },
  ];
  const checklist = [
    { label: "Tenant seleccionado", done: Boolean(tenant) },
    { label: "Usuario identificado", done: Boolean(me?.user.displayName) },
    { label: "Contexto listo para editar settings", done: Boolean(selectedTenantId && tenant) },
    { label: "Áreas de configuración relevadas", done: true },
  ];

  return (
    <section aria-labelledby="settings-heading" className="overview-page">
      <h1 id="settings-heading">Configuración</h1>
      <article className="overview-priority overview-priority--info">
        <div className="overview-priority__copy">
          <span className="overview-priority__eyebrow">Estado actual</span>
          <strong>{tenant ? `Configurando ${tenant.name}` : "Falta seleccionar tenant"}</strong>
          <p>
            Esta pantalla organiza qué dominios de configuración viven en el backoffice, aunque todavía no todos
            tengan formularios propios materializados.
          </p>
        </div>
      </article>

      <article className="overview-card">
        <h2>Contexto activo</h2>
        <dl className="kpi-grid">
          <div>
            <dt>Tenant</dt>
            <dd>{tenant?.name ?? "—"}</dd>
          </div>
          <div>
            <dt>Usuario</dt>
            <dd>{me?.user.displayName ?? "—"}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{me?.user.email ?? "—"}</dd>
          </div>
        </dl>
      </article>

      <article className="overview-card">
        <h2>Checklist de configuración</h2>
        <div className="overview-checklist">
          {checklist.map((step) => (
            <div key={step.label} className={`overview-check ${step.done ? "overview-check--done" : ""}`}>
              <strong>{step.done ? "✓" : "•"}</strong>
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </article>

      <section className="profile-module-grid" aria-label="Áreas de configuración">
        {settingsAreas.map((area) => (
          <article key={area.title} className="profile-card">
            <h2>{area.title}</h2>
            <p>{area.description}</p>
            <p className="profile-eyebrow">{area.status}</p>
          </article>
        ))}
      </section>
    </section>
  );
}
