import { useAuth } from "../../app/auth-context.js";
import { useTenantContext } from "../../app/tenant-context.js";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api-client.js";
import { StateView } from "../../components/state-view.js";

interface SubscriptionResponse {
  data: { planCode: string; status: string; currentPeriodEnd: string };
}

interface EntitlementsResponse {
  data: {
    entitlements: { resource: string; hardLimit: number; softLimit: number | null }[];
    quotas: { resource: string; used: number }[];
  };
}

export function SubscriptionPage() {
  const { accessToken } = useAuth();
  const { selectedTenantId } = useTenantContext();

  const subscriptionQuery = useQuery({
    queryKey: ["subscription", selectedTenantId],
    queryFn: () =>
      apiRequest<SubscriptionResponse>(`/v1/subscriptions/${selectedTenantId}`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
      }),
    enabled: Boolean(accessToken && selectedTenantId),
  });

  const entitlementsQuery = useQuery({
    queryKey: ["entitlements", selectedTenantId],
    queryFn: () =>
      apiRequest<EntitlementsResponse>(`/v1/entitlements/${selectedTenantId}`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
      }),
    enabled: Boolean(accessToken && selectedTenantId),
  });

  const isLoading = subscriptionQuery.isLoading || entitlementsQuery.isLoading;
  const error = subscriptionQuery.error ?? entitlementsQuery.error;
  const subscription = subscriptionQuery.data?.data;
  const entitlements = entitlementsQuery.data?.data.entitlements ?? [];
  const quotas = entitlementsQuery.data?.data.quotas ?? [];
  const alertResources = entitlements.filter((entitlement) => {
    const quota = quotas.find((item) => item.resource === entitlement.resource);
    return quota ? quota.used >= entitlement.hardLimit : false;
  });
  const nearLimitResources = entitlements.filter((entitlement) => {
    const quota = quotas.find((item) => item.resource === entitlement.resource);
    return quota ? quota.used < entitlement.hardLimit && quota.used >= Math.floor(entitlement.hardLimit * 0.8) : false;
  });
  const readinessChecklist = [
    { label: "Tenant con suscripción cargada", done: Boolean(subscription) },
    { label: "Entitlements disponibles", done: entitlements.length > 0 },
    { label: "Sin recursos excedidos", done: alertResources.length === 0 },
    { label: "Monitoreo de límites visible", done: entitlements.length === quotas.length && entitlements.length > 0 },
  ];
  const summary = subscription ? getSubscriptionSummary(subscription.status, alertResources.length, nearLimitResources.length) : null;
  const pendingChecklist = readinessChecklist.filter((step) => !step.done).map((step) => step.label);
  const nextStep = subscription
    ? getSubscriptionNextStep({
        status: subscription.status,
        alertCount: alertResources.length,
        nearLimitCount: nearLimitResources.length,
      })
    : null;
  const quickLinks = [
    {
      eyebrow: "Gobierno",
      label: "Overview / Settings",
      detail: "Cruzar el estado comercial con el contexto real del tenant y sus configuraciones activas.",
    },
    {
      eyebrow: "Estructura",
      label: "Branches / Users",
      detail: "Validar si el crecimiento del tenant explica la presión sobre límites y capacidades.",
    },
    {
      eyebrow: "Apps",
      label: "Profiles",
      detail: "Comparar qué superficies y perfiles van a consumir los servicios contratados.",
    },
  ];

  return (
    <section aria-labelledby="subscription-heading" className="overview-page">
      <h1 id="subscription-heading">Suscripción &amp; Billing</h1>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        onRetry={() => {
          void subscriptionQuery.refetch();
          void entitlementsQuery.refetch();
        }}
      >
        {subscription && entitlementsQuery.data && (
          <>
            {summary ? (
              <article className={`overview-priority overview-priority--${summary.tone}`}>
                <div className="overview-priority__copy">
                  <span className="overview-priority__eyebrow">Estado comercial</span>
                  <strong>{summary.title}</strong>
                  <p>{summary.message}</p>
                </div>
              </article>
            ) : null}

            <dl className="kpi-grid">
              <div>
                <dt>Plan</dt>
                <dd>{subscription.planCode}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>{subscription.status}</dd>
              </div>
              <div>
                <dt>Próximo corte</dt>
                <dd>{formatDate(subscription.currentPeriodEnd)}</dd>
              </div>
              <div>
                <dt>Recursos monitoreados</dt>
                <dd>{entitlements.length}</dd>
              </div>
            </dl>

            <article className="overview-card">
              <h2>Checklist de lectura rápida</h2>
              <div className="overview-checklist">
                {readinessChecklist.map((step) => (
                  <div key={step.label} className={`overview-check ${step.done ? "overview-check--done" : ""}`}>
                    <strong>{step.done ? "✓" : "•"}</strong>
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
              <p>
                {pendingChecklist.length > 0
                  ? `Todavía conviene revisar: ${pendingChecklist.join(", ")}.`
                  : "La lectura comercial base está completa y no muestra bloqueos inmediatos."}
              </p>
            </article>

            {nextStep ? (
              <article className="overview-card">
                <h2>Siguiente paso recomendado</h2>
                <div className="overview-link-grid">
                  <div className="overview-link-card overview-link-card--primary">
                    <span>{nextStep.eyebrow}</span>
                    <strong>{nextStep.label}</strong>
                    <p>{nextStep.detail}</p>
                  </div>
                </div>
              </article>
            ) : null}

            <section className="profile-module-grid" aria-label="Límites por recurso">
              {entitlements.map((entitlement) => {
                const quota = quotas.find((item) => item.resource === entitlement.resource);
                const usage = quota?.used ?? 0;
                const health = getResourceHealth(usage, entitlement.hardLimit);
                return (
                  <article key={entitlement.resource} className="profile-card">
                    <p className="profile-eyebrow">{health.label}</p>
                    <h2>{entitlement.resource}</h2>
                    <p>
                      Uso actual <strong>{usage}</strong> de <strong>{entitlement.hardLimit}</strong>
                    </p>
                    <p>
                      Límite blando:{" "}
                      <strong>{entitlement.softLimit ?? "Sin límite blando definido"}</strong>
                    </p>
                    <p>{health.message}</p>
                  </article>
                );
              })}
            </section>

            <article className="overview-card">
              <h2>Atajos relacionados</h2>
              <div className="overview-link-grid">
                {quickLinks.map((link) => (
                  <div key={link.label} className="overview-link-card">
                    <span>{link.eyebrow}</span>
                    <strong>{link.label}</strong>
                    <p>{link.detail}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="overview-card">
              <h2>Detalle tabular</h2>
              <table>
                <caption className="sr-only">Límites y uso actual</caption>
                <thead>
                  <tr>
                    <th scope="col">Recurso</th>
                    <th scope="col">Uso</th>
                    <th scope="col">Límite blando</th>
                    <th scope="col">Límite duro</th>
                  </tr>
                </thead>
                <tbody>
                  {entitlements.map((entitlement) => {
                    const quota = quotas.find((item) => item.resource === entitlement.resource);
                    return (
                      <tr key={entitlement.resource}>
                        <td>{entitlement.resource}</td>
                        <td>{quota?.used ?? 0}</td>
                        <td>{entitlement.softLimit ?? "—"}</td>
                        <td>{entitlement.hardLimit}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </article>
          </>
        )}
      </StateView>
    </section>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("es-AR");
}

function getSubscriptionSummary(status: string, alertCount: number, nearLimitCount: number) {
  if (status !== "ACTIVE") {
    return {
      tone: "warning" as const,
      title: "La suscripción necesita seguimiento",
      message: `El tenant figura en estado ${status}. Conviene revisar billing antes de que afecte operación o acceso.`,
    };
  }

  if (alertCount > 0) {
    return {
      tone: "warning" as const,
      title: "Hay recursos al límite o excedidos",
      message: `Se detectaron ${alertCount} recurso(s) en zona crítica. Conviene revisar consumo o ampliar capacidad.`,
    };
  }

  if (nearLimitCount > 0) {
    return {
      tone: "info" as const,
      title: "La suscripción está activa, pero con consumo alto",
      message: `Hay ${nearLimitCount} recurso(s) cerca del límite duro. Ya conviene monitorear crecimiento.`,
    };
  }

  return {
    tone: "success" as const,
    title: "Suscripción sana y con margen operativo",
    message: "El plan está activo y los límites visibles no muestran presión inmediata sobre la operación.",
  };
}

function getSubscriptionNextStep({
  status,
  alertCount,
  nearLimitCount,
}: {
  status: string;
  alertCount: number;
  nearLimitCount: number;
}) {
  if (status !== "ACTIVE") {
    return {
      eyebrow: "Billing",
      label: "Revisar estado comercial",
      detail: "Antes de seguir expandiendo operación conviene normalizar el estado de la suscripción del tenant.",
    };
  }

  if (alertCount > 0) {
    return {
      eyebrow: "Capacidad",
      label: "Resolver recursos críticos",
      detail: "Hay recursos al límite; revisá consumo real o ampliación antes de que afecte operación o setup.",
    };
  }

  if (nearLimitCount > 0) {
    return {
      eyebrow: "Crecimiento",
      label: "Monitorear recursos en expansión",
      detail: "Todavía hay margen, pero ya conviene revisar cómo está creciendo el tenant contra sus límites.",
    };
  }

  return {
    eyebrow: "Siguiente control",
    label: "Cruzar plan con uso operativo",
    detail: "Con la suscripción sana, el próximo paso útil es validar que capacidades y perfiles sigan alineados con el uso real.",
  };
}

function getResourceHealth(used: number, hardLimit: number) {
  if (used >= hardLimit) {
    return {
      label: "Límite alcanzado",
      message: "Este recurso ya llegó al máximo permitido por el plan actual.",
    };
  }

  if (used >= Math.floor(hardLimit * 0.8)) {
    return {
      label: "Seguimiento recomendado",
      message: "El uso está alto y conviene monitorearlo para evitar fricción operativa.",
    };
  }

  return {
    label: "Con margen",
    message: "El recurso todavía tiene capacidad suficiente dentro del plan actual.",
  };
}
