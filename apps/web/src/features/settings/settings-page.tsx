import { useTenantContext } from "../../app/tenant-context.js";
import { Link } from "react-router-dom";

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
      nextView: "Resumen · Puesta en marcha",
      to: "/setup",
    },
    {
      title: "Experiencia cliente",
      description: "Lo que después impacta menú público, promociones, reserva y seguimiento.",
      status: "A definir por módulo",
      nextView: "Cliente · Web pública",
      to: "/profiles",
    },
    {
      title: "Operación interna",
      description: "Parámetros que afectan caja, cocina, floor y flujos del staff.",
      status: "Depende de features habilitadas",
      nextView: "Perfiles · Apps táctiles",
      to: "/profiles",
    },
    {
      title: "Fiscal / suscripción",
      description: "Configuración comercial, límites y capacidades del tenant.",
      status: "Coordinar con billing y fiscal",
      nextView: "Suscripción · Fiscal",
      to: "/subscription",
    },
  ];
  const checklist = [
    { label: "Tenant seleccionado", done: Boolean(tenant) },
    { label: "Usuario identificado", done: Boolean(me?.user.displayName) },
    { label: "Contexto listo para editar settings", done: Boolean(selectedTenantId && tenant) },
    { label: "Áreas de configuración relevadas", done: true },
  ];
  const pendingChecklist = checklist.filter((step) => !step.done).map((step) => step.label);
  const settingsPriority = getSettingsPriority({ hasTenant: Boolean(tenant), hasUser: Boolean(me?.user.displayName) });
  const nextStep = getSettingsNextStep({ hasTenant: Boolean(tenant) });
  const settingsQuickLinks = [
    {
      eyebrow: "Base",
      label: "Resumen · Puesta en marcha",
      detail: "Validá estructura y pasos pendientes antes de editar parámetros finos.",
      to: "/setup",
    },
    {
      eyebrow: "Equipo",
      label: "Perfiles · Usuarios",
      detail: "Revisá qué actores van a consumir estas configuraciones.",
      to: "/users",
    },
    {
      eyebrow: "Comercial",
      label: "Subscription",
      detail: "Contrastá settings con capacidades contratadas del tenant.",
      to: "/subscription",
    },
  ];
  const settingsStageCards = [
    {
      label: "Contexto",
      title: tenant ? "Tenant seleccionado" : "Falta elegir tenant",
      detail: tenant
        ? "Ya podés ordenar settings sobre una base real de operación."
        : "Sin tenant activo, cualquier cambio de configuración pierde sentido práctico.",
      tone: tenant ? "success" : "warning",
      to: "/overview",
    },
    {
      label: "Estructura",
      title: "Base y marca operativa",
      detail: "Primero conviene verificar setup, marcas y sucursales antes de afinar settings finos.",
      tone: "info",
      to: "/setup",
    },
    {
      label: "Superficies",
      title: "Apps y perfiles impactados",
      detail: "Usá perfiles para entender dónde pega cada configuración del tenant.",
      tone: "info",
      to: "/profiles",
    },
    {
      label: "Gobierno",
      title: "Capacidades y límites",
      detail: "El owner debería cruzar settings con servicios y capacidades contratadas.",
      tone: "warning",
      to: "/subscription",
    },
  ] as const;

  return (
    <section aria-labelledby="settings-heading" className="overview-page">
      <h1 id="settings-heading">Configuración</h1>
      <article className={`overview-priority overview-priority--${settingsPriority.tone}`}>
        <div className="overview-priority__copy">
          <span className="overview-priority__eyebrow">Estado actual</span>
          <strong>{settingsPriority.title}</strong>
          <p>
            {settingsPriority.message}
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
        <p>
          {pendingChecklist.length > 0
            ? `Todavía falta resolver: ${pendingChecklist.join(", ")}.`
            : "El contexto base ya está listo para seguir segmentando configuraciones por dominio."}
        </p>
      </article>

      <article className="overview-card">
        <h2>Siguiente paso recomendado</h2>
        <div className="overview-link-grid">
          <Link className="overview-link-card overview-link-card--primary" to={nextStep.to}>
            <span>{nextStep.eyebrow}</span>
            <strong>{nextStep.label}</strong>
            <p>{nextStep.detail}</p>
          </Link>
        </div>
      </article>

      <article className="overview-card">
        <h2>Frentes de configuración</h2>
        <div className="owner-stage-grid">
          {settingsStageCards.map((card) => (
            <Link key={card.label} className={`owner-stage-card owner-stage-card--${card.tone}`} to={card.to}>
              <span>{card.label}</span>
              <strong>{card.title}</strong>
              <p>{card.detail}</p>
            </Link>
          ))}
        </div>
      </article>

      <article className="overview-card">
        <h2>Atajos relacionados</h2>
        <div className="overview-link-grid">
          {settingsQuickLinks.map((link) => (
            <Link key={link.label} className="overview-link-card" to={link.to}>
              <span>{link.eyebrow}</span>
              <strong>{link.label}</strong>
              <p>{link.detail}</p>
            </Link>
          ))}
        </div>
      </article>

      <section className="profile-module-grid" aria-label="Áreas de configuración">
        {settingsAreas.map((area) => (
          <Link key={area.title} className="profile-card owner-module-link" to={area.to}>
            <h2>{area.title}</h2>
            <p>{area.description}</p>
            <p className="profile-eyebrow">{area.status}</p>
            <p>{area.nextView}</p>
          </Link>
        ))}
      </section>
    </section>
  );
}

function getSettingsPriority({
  hasTenant,
  hasUser,
}: {
  hasTenant: boolean;
  hasUser: boolean;
}) {
  if (!hasTenant) {
    return {
      tone: "warning" as const,
      title: "Falta seleccionar tenant",
      message: "Sin un tenant activo no conviene avanzar porque cualquier decisión de configuración pierde contexto real.",
    };
  }

  if (!hasUser) {
    return {
      tone: "warning" as const,
      title: "Falta identidad de usuario visible",
      message: "Conviene resolver quién está operando el backoffice antes de tocar configuraciones sensibles.",
    };
  }

  return {
    tone: "info" as const,
    title: `Configurando ${hasTenant ? "el tenant activo" : "el contexto"}`,
    message:
      "Esta pantalla organiza los dominios de configuración del backoffice, aunque todavía no todos tengan formularios propios materializados.",
  };
}

function getSettingsNextStep({ hasTenant }: { hasTenant: boolean }) {
  if (!hasTenant) {
    return {
      eyebrow: "Contexto",
      label: "Elegir tenant",
      detail: "Primero resolvé el tenant activo desde el selector superior para habilitar el resto del backoffice.",
      to: "/overview",
    };
  }

  return {
    eyebrow: "Gobierno del tenant",
    label: "Revisar setup y suscripción",
    detail: "Con el contexto listo, lo más útil es cruzar estructura base con capacidades comerciales antes de bajar a settings finos.",
    to: "/setup",
  };
}
