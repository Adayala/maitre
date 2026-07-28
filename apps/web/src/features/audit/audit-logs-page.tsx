import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { StateView } from "../../components/state-view.js";
import { Link } from "react-router-dom";

interface AuditLogItem {
  id: string;
  actorType: string;
  actorId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  occurredAt: string;
}

export function AuditLogsPage() {
  const { data, isLoading, error, refetch } = useTenantQuery<{ data: AuditLogItem[] }>(
    "audit-logs",
    "/v1/audit-logs",
  );
  const entries = data?.data ?? [];
  const latestEntry = entries[0] ?? null;
  const uniqueActors = new Set(entries.map((entry) => entry.actorId ?? entry.actorType));
  const uniqueResources = new Set(entries.map((entry) => entry.resourceType));
  const automatedEntries = entries.filter((entry) => normalizeActorType(entry.actorType) !== "USER");
  const summary = getAuditSummary(entries.length, latestEntry, automatedEntries.length);
  const checklist = [
    { label: "Eventos visibles", done: entries.length > 0 },
    { label: "Último evento con fecha", done: Boolean(latestEntry?.occurredAt) },
    { label: "Actores identificables", done: uniqueActors.size > 0 },
    { label: "Recursos trazables", done: uniqueResources.size > 0 },
  ];
  const pendingChecklist = checklist.filter((step) => !step.done).map((step) => step.label);
  const sensitiveEntries = entries.filter((entry) => {
    const action = entry.action.trim().toUpperCase();
    return action.includes("DELETE") || action.includes("CANCEL");
  });
  const nextStep = getAuditNextStep({
    total: entries.length,
    automatedCount: automatedEntries.length,
    sensitiveCount: sensitiveEntries.length,
  });
  const auditQuickLinks = [
    {
      eyebrow: "Equipo",
      label: "Usuarios · Perfiles",
      detail: "Cruzar eventos con quiénes pueden operar cada superficie y cada rol del tenant.",
      to: "/users",
    },
    {
      eyebrow: "Base",
      label: "Setup / Settings",
      detail: "Validar si los cambios auditados vienen de configuración, onboarding o ajustes operativos.",
      to: "/settings",
    },
    {
      eyebrow: "Comercial",
      label: "Subscription",
      detail: "Seguir si parte de la actividad observada responde a cambios de capacidad o estado comercial.",
      to: "/subscription",
    },
  ];
  const auditStageCards = getAuditStageCards({
    total: entries.length,
    automatedCount: automatedEntries.length,
    sensitiveCount: sensitiveEntries.length,
    hasLatest: Boolean(latestEntry),
  });

  return (
    <section aria-labelledby="audit-heading" className="overview-page">
      <h1 id="audit-heading">Auditoría</h1>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        isEmpty={entries.length === 0}
        emptyMessage="Todavía no hay eventos de auditoría registrados."
        onRetry={() => void refetch()}
      >
        {entries.length > 0 && (
          <>
            <article className={`overview-priority overview-priority--${summary.tone}`}>
              <div className="overview-priority__copy">
                <span className="overview-priority__eyebrow">Estado de trazabilidad</span>
                <strong>{summary.title}</strong>
                <p>{summary.message}</p>
              </div>
            </article>

            <dl className="kpi-grid">
              <div>
                <dt>Eventos</dt>
                <dd>{entries.length}</dd>
              </div>
              <div>
                <dt>Actores</dt>
                <dd>{uniqueActors.size}</dd>
              </div>
              <div>
                <dt>Recursos</dt>
                <dd>{uniqueResources.size}</dd>
              </div>
              <div>
                <dt>Automáticos</dt>
                <dd>{automatedEntries.length}</dd>
              </div>
            </dl>

            <article className="overview-card">
              <h2>Checklist de lectura rápida</h2>
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
                  ? `Todavía conviene revisar: ${pendingChecklist.join(", ")}.`
                  : "La huella auditable visible ya alcanza para lectura operativa y soporte básico."}
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
              <h2>Ciclo de auditoría</h2>
              <div className="owner-stage-grid">
                {auditStageCards.map((card) => (
                  <Link key={card.label} className={`owner-stage-card owner-stage-card--${card.tone}`} to={card.to}>
                    <span>{card.label}</span>
                    <strong>{card.title}</strong>
                    <p>{card.detail}</p>
                  </Link>
                ))}
              </div>
            </article>

            <section className="profile-module-grid" aria-label="Eventos recientes">
              {entries.slice(0, 6).map((entry) => {
                const eventType = describeAuditEntry(entry);
                return (
                  <article key={entry.id} className="profile-card">
                    <p className="profile-eyebrow">{eventType.label}</p>
                    <h2>{entry.action}</h2>
                    <p>
                      Recurso <strong>{entry.resourceType}</strong>
                    </p>
                    <p>
                      Actor <strong>{entry.actorId ?? entry.actorType}</strong>
                    </p>
                    <p>{formatDateTime(entry.occurredAt)}</p>
                    <p>{eventType.message}</p>
                  </article>
                );
              })}
            </section>

            <article className="overview-card">
              <h2>Atajos relacionados</h2>
              <div className="overview-link-grid">
                {auditQuickLinks.map((link) => (
                  <Link key={link.label} className="overview-link-card" to={link.to}>
                    <span>{link.eyebrow}</span>
                    <strong>{link.label}</strong>
                    <p>{link.detail}</p>
                  </Link>
                ))}
              </div>
            </article>

            <article className="overview-card">
              <h2>Detalle tabular</h2>
              <table>
                <caption className="sr-only">Registro de auditoría</caption>
                <thead>
                  <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Acción</th>
                    <th scope="col">Recurso</th>
                    <th scope="col">Actor</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{formatDateTime(entry.occurredAt)}</td>
                      <td>{entry.action}</td>
                      <td>
                        {entry.resourceType} ({entry.resourceId})
                      </td>
                      <td>{entry.actorId ?? entry.actorType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          </>
        )}
      </StateView>
    </section>
  );
}

function normalizeActorType(value: string) {
  return value.trim().toUpperCase();
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("es-AR");
}

function describeAuditEntry(entry: AuditLogItem) {
  const action = entry.action.trim().toUpperCase();

  if (action.includes("DELETE") || action.includes("CANCEL")) {
    return {
      label: "Cambio sensible",
      message: "Conviene revisar este evento porque representa una baja, cancelación o eliminación dentro del tenant.",
    };
  }

  if (normalizeActorType(entry.actorType) !== "USER") {
    return {
      label: "Automatización",
      message: "El evento fue disparado por un proceso no humano, útil para seguir integraciones y jobs internos.",
    };
  }

  return {
    label: "Actividad operativa",
    message: "El evento refleja una acción ejecutada por una persona o actor operativo dentro del sistema.",
  };
}

function getAuditSummary(total: number, latestEntry: AuditLogItem | null, automatedCount: number) {
  if (total === 0) {
    return {
      tone: "warning" as const,
      title: "Todavía no hay trazabilidad visible",
      message: "Sin eventos registrados cuesta auditar cambios y reconstruir qué pasó dentro del tenant.",
    };
  }

  if (!latestEntry) {
    return {
      tone: "warning" as const,
      title: "Hay actividad parcial, pero falta lectura clara",
      message: "Conviene revisar la carga de auditoría para asegurar trazabilidad navegable.",
    };
  }

  if (automatedCount > 0) {
    return {
      tone: "info" as const,
      title: "La auditoría mezcla operación humana y automatizada",
      message: "Eso ayuda a entender mejor qué cambios vinieron del staff y cuáles de procesos internos o integraciones.",
    };
  }

  return {
    tone: "success" as const,
    title: "La actividad del tenant ya tiene huella auditable",
    message: `Último evento visible: ${formatDateTime(latestEntry.occurredAt)}. Ya hay base para seguimiento y soporte operativo.`,
  };
}

function getAuditNextStep({
  total,
  automatedCount,
  sensitiveCount,
}: {
  total: number;
  automatedCount: number;
  sensitiveCount: number;
}) {
  if (total === 0) {
    return {
      eyebrow: "Trazabilidad",
      label: "Generar primera huella auditable",
      detail: "Conviene asegurar que el tenant ya registre eventos básicos antes de depender de soporte, investigación o control operativo.",
      to: "/setup",
    };
  }

  if (sensitiveCount > 0) {
    return {
      eyebrow: "Seguimiento",
      label: "Revisar cambios sensibles",
      detail: "Hay bajas, cancelaciones o eliminaciones visibles; conviene validarlas primero para entender impacto operativo.",
      to: "/users",
    };
  }

  if (automatedCount > 0) {
    return {
      eyebrow: "Procesos internos",
      label: "Distinguir humano vs automatizado",
      detail: "La traza ya mezcla staff y procesos automáticos; el siguiente paso útil es interpretar qué parte vino de integraciones o jobs.",
      to: "/settings",
    };
  }

  return {
    eyebrow: "Gobierno",
    label: "Cruzar actividad con equipo y configuración",
    detail: "Con trazabilidad visible, el próximo paso útil es relacionar eventos con usuarios, perfiles y cambios del tenant.",
    to: "/profiles",
  };
}

function getAuditStageCards({
  total,
  automatedCount,
  sensitiveCount,
  hasLatest,
}: {
  total: number;
  automatedCount: number;
  sensitiveCount: number;
  hasLatest: boolean;
}) {
  return [
    {
      label: "Registrar",
      title: total > 0 ? `${total} evento(s) visible(s)` : "Sin eventos todavía",
      detail:
        total > 0
          ? "Ya existe huella auditable para reconstruir actividad del tenant."
          : "Conviene asegurar registro básico antes de depender de soporte o investigación.",
      tone: total > 0 ? "success" : "warning",
      to: "/setup",
    },
    {
      label: "Interpretar",
      title: automatedCount > 0 ? "Mezcla humano + automático" : "Mayormente actividad humana",
      detail:
        automatedCount > 0
          ? "Conviene separar acciones del staff de jobs o automatizaciones."
          : "La lectura actual es más directa porque predominan acciones humanas.",
      tone: automatedCount > 0 ? "info" : "success",
      to: "/settings",
    },
    {
      label: "Riesgo",
      title: sensitiveCount > 0 ? `${sensitiveCount} cambio(s) sensible(s)` : "Sin cambios sensibles visibles",
      detail:
        sensitiveCount > 0
          ? "Hay bajas, cancelaciones o eliminaciones que merecen seguimiento."
          : "No aparecen eventos obvios de mayor sensibilidad en esta lectura.",
      tone: sensitiveCount > 0 ? "warning" : "success",
      to: "/users",
    },
    {
      label: "Gobierno",
      title: hasLatest ? "Cruzar con roles y perfiles" : "Falta contexto para gobernar",
      detail:
        hasLatest
          ? "El siguiente control útil es mapear actividad contra usuarios, perfiles y superficies."
          : "Sin eventos recientes todavía no hay base suficiente para control transversal.",
      tone: hasLatest ? "info" : "warning",
      to: "/profiles",
    },
  ] as const;
}
