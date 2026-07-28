import { useAuth } from "../../app/auth-context.js";
import { useTenantContext } from "../../app/tenant-context.js";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api-client.js";
import { StateView } from "../../components/state-view.js";

interface SubscriptionResponse {
  data: {
    planCode: string;
    status: string;
    currentPeriodEnd: string;
    items: SubscriptionItemResponse[];
  };
}

interface EntitlementsResponse {
  data: {
    entitlements: { resource: string; hardLimit: number; softLimit: number | null }[];
    quotas: { resource: string; used: number }[];
  };
}

interface SubscriptionItemResponse {
  id: string;
  serviceId: string;
  scopeRefId?: string | null;
  status: "ACTIVE" | "INACTIVE";
  quantity: number;
}

interface CatalogItemResponse {
  code: string;
  name: string;
  description: string;
  benefits: string[];
  billingType: "SERVICE" | "QUANTITY";
  billingScope: "TENANT" | "BRAND" | "FISCAL_ENTITY" | "BRANCH" | "POS" | "CONNECTOR";
  unitPrice: number;
  currency: string;
  dependsOn: string[];
  isActive: boolean;
}

interface CatalogPackageResponse {
  code: string;
  name: string;
  tagline: string;
  description: string;
  benefits: string[];
  items: { catalogItemCode: string; quantity?: number }[];
  isActive: boolean;
  sortOrder: number;
}

const CATALOG_CATEGORIES = [
  {
    label: "Base de plataforma",
    slug: "platform",
    codes: ["CORE", "BRANCHES", "IDENTITY", "CONNECT"],
  },
  {
    label: "Operación gastronómica",
    slug: "operations",
    codes: [
      "FLOOR",
      "SEATS",
      "RESERVATIONS",
      "SHIFTS",
      "SHIFT_SLOTS",
      "WAITERS",
      "CASHIERS",
      "KITCHEN",
      "QR_MENU",
      "QR_ORDERING",
      "GUEST",
      "DELIVERY",
      "INVENTORY",
    ],
  },
  {
    label: "Caja y fiscalidad",
    slug: "billing",
    codes: [
      "CASH",
      "BILLING",
      "PAYMENTS",
      "PAYLANDING",
      "PAYLANDING.MERCADOPAGO",
      "PAYLANDING.NARANJA_X",
      "PAYLANDING.MODO",
      "PAYLANDING.TODO_PAGO",
      "ARCA",
      "IVA",
    ],
  },
  {
    label: "Experiencia y crecimiento",
    slug: "growth",
    codes: ["FEEDBACK", "REPUTATION", "CRM", "LOYALTY"],
  },
  {
    label: "Inteligencia",
    slug: "intelligence",
    codes: [
      "AI_ASSISTANT",
      "AI_FORECAST",
      "AI_PROMISE",
      "AI_KITCHEN",
      "AI_AHEAD",
      "AI_AUTOPILOT",
    ],
  },
] as const;

export function SubscriptionPage() {
  const { accessToken } = useAuth();
  const { selectedTenantId, me } = useTenantContext();
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [scopeRefs, setScopeRefs] = useState<Record<string, string>>({});
  const [packageBranchId, setPackageBranchId] = useState("");

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

  const catalogQuery = useQuery({
    queryKey: ["subscription-catalog"],
    queryFn: () =>
      apiRequest<{ data: CatalogItemResponse[] }>("/v1/subscription-catalog", {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
      }),
    enabled: Boolean(accessToken && selectedTenantId),
  });
  const packagesQuery = useQuery({
    queryKey: ["subscription-packages"],
    queryFn: () =>
      apiRequest<{ data: CatalogPackageResponse[] }>("/v1/subscription-packages", {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
      }),
    enabled: Boolean(accessToken && selectedTenantId),
  });

  const invalidateSubscriptionData = () => {
    void queryClient.invalidateQueries({ queryKey: ["subscription", selectedTenantId] });
    void queryClient.invalidateQueries({ queryKey: ["entitlements", selectedTenantId] });
  };
  const itemMutation = useMutation({
    mutationFn: ({
      path,
      method,
      body,
    }: {
      path: string;
      method: "POST" | "PATCH" | "DELETE";
      body?: unknown;
    }) =>
      apiRequest(path, {
        method,
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
        ...(body !== undefined ? { body } : {}),
      }),
    onSuccess: invalidateSubscriptionData,
  });
  const packageMutation = useMutation({
    mutationFn: async ({
      catalogPackage,
      branchId,
    }: {
      catalogPackage: CatalogPackageResponse;
      branchId: string;
    }) => {
      for (const packageItem of catalogPackage.items) {
        const definition = catalog.find((item) => item.code === packageItem.catalogItemCode);
        if (!definition) throw new Error(`No existe ${packageItem.catalogItemCode} en el catálogo`);
        const scopeRefId = definition.billingScope === "TENANT" ? null : branchId;
        const existing = activeItems.find(
          (item) =>
            item.serviceId === definition.code &&
            (definition.billingScope === "TENANT" || item.scopeRefId === scopeRefId),
        );
        if (
          existing &&
          definition.billingType === "QUANTITY" &&
          existing.quantity !== (packageItem.quantity ?? 1)
        ) {
          await apiRequest(`/v1/subscriptions/${selectedTenantId}/items/${existing.id}`, {
            method: "PATCH",
            accessToken: accessToken!,
            tenantId: selectedTenantId!,
            body: { quantity: packageItem.quantity ?? 1 },
          });
        } else if (!existing) {
          await apiRequest(`/v1/subscriptions/${selectedTenantId}/items`, {
            method: "POST",
            accessToken: accessToken!,
            tenantId: selectedTenantId!,
            body: {
              catalogItemCode: definition.code,
              ...(definition.billingType === "QUANTITY"
                ? { quantity: packageItem.quantity ?? 1 }
                : {}),
              ...(scopeRefId ? { scopeRefId } : {}),
            },
          });
        }
      }
    },
    onSuccess: invalidateSubscriptionData,
  });

  const isLoading =
    subscriptionQuery.isLoading ||
    entitlementsQuery.isLoading ||
    catalogQuery.isLoading ||
    packagesQuery.isLoading;
  const error =
    subscriptionQuery.error ?? entitlementsQuery.error ?? catalogQuery.error ?? packagesQuery.error;
  const subscription = subscriptionQuery.data?.data;
  const catalog = catalogQuery.data?.data ?? [];
  const catalogPackages = packagesQuery.data?.data ?? [];
  const entitlements = entitlementsQuery.data?.data.entitlements ?? [];
  const quotas = entitlementsQuery.data?.data.quotas ?? [];
  const tenantBranches = me?.tenants.find((tenant) => tenant.id === selectedTenantId)?.branches ?? [];
  const activeItems = subscription?.items.filter((item) => item.status === "ACTIVE") ?? [];
  const estimatedMonthlyTotal = useMemo(
    () =>
      activeItems.reduce((total, activeItem) => {
        const definition = catalog.find((item) => item.code === activeItem.serviceId);
        return total + (definition?.unitPrice ?? 0) * activeItem.quantity;
      }, 0),
    [activeItems, catalog],
  );
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

  return (
    <section aria-labelledby="subscription-heading" className="overview-page">
      <h1 id="subscription-heading">Suscripción &amp; Billing</h1>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        onRetry={() => {
          void subscriptionQuery.refetch();
          void entitlementsQuery.refetch();
          void catalogQuery.refetch();
          void packagesQuery.refetch();
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
            </article>

            <article className="overview-card">
              <div className="overview-priority__copy">
                <span className="overview-priority__eyebrow">App store interno</span>
                <h2>Catálogo de servicios</h2>
                <p>
                  Estimado mensual activo:{" "}
                  <strong>{formatMoney(estimatedMonthlyTotal, "ARS")}</strong>
                </p>
              </div>
              <section aria-labelledby="subscription-packages-heading">
                <h3 id="subscription-packages-heading">Paquetes recomendados</h3>
                <p>
                  Elegí una configuración inicial y después ajustá cada servicio de forma
                  independiente.
                </p>
                <label>
                  Sucursal donde aplicar el paquete
                  <select
                    value={packageBranchId || (tenantBranches.length === 1 ? tenantBranches[0]!.id : "")}
                    onChange={(event) => setPackageBranchId(event.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    {tenantBranches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="profile-module-grid">
                  {catalogPackages.map((catalogPackage) => {
                    const packagePrice = catalogPackage.items.reduce((total, packageItem) => {
                      const definition = catalog.find(
                        (item) => item.code === packageItem.catalogItemCode,
                      );
                      return (
                        total +
                        (definition?.unitPrice ?? 0) *
                          (definition?.billingType === "QUANTITY"
                            ? packageItem.quantity ?? 1
                            : 1)
                      );
                    }, 0);
                    const selectedBranch =
                      packageBranchId || (tenantBranches.length === 1 ? tenantBranches[0]!.id : "");
                    return (
                      <article key={catalogPackage.code} className="profile-card">
                        <p className="profile-eyebrow">{catalogPackage.tagline}</p>
                        <h2>{catalogPackage.name}</h2>
                        <p>
                          Estimado: <strong>{formatMoney(packagePrice, "ARS")} / mes</strong>
                        </p>
                        <details>
                          <summary>Ver descripción y beneficios</summary>
                          <p>{catalogPackage.description}</p>
                          <ul>
                            {catalogPackage.benefits.map((benefit) => (
                              <li key={benefit}>{benefit}</li>
                            ))}
                          </ul>
                          <p>
                            Incluye{" "}
                            {catalogPackage.items
                              .map((item) => {
                                const name =
                                  catalog.find(
                                    (definition) => definition.code === item.catalogItemCode,
                                  )?.name ?? item.catalogItemCode;
                                return item.quantity ? `${name} × ${item.quantity}` : name;
                              })
                              .join(", ")}
                          </p>
                        </details>
                        <button
                          type="button"
                          disabled={packageMutation.isPending || !selectedBranch}
                          onClick={() => {
                            if (!packageBranchId && selectedBranch) setPackageBranchId(selectedBranch);
                            packageMutation.mutate({ catalogPackage, branchId: selectedBranch });
                          }}
                        >
                          Configurar este paquete
                        </button>
                      </article>
                    );
                  })}
                </div>
              </section>
              {CATALOG_CATEGORIES.map((category) => {
                const categoryItems = catalog.filter((item) =>
                  (category.codes as readonly string[]).includes(item.code),
                );
                if (categoryItems.length === 0) return null;
                return (
                  <section key={category.label} aria-labelledby={`catalog-${category.slug}`}>
                    <h3 id={`catalog-${category.slug}`}>{category.label}</h3>
                    <div className="profile-module-grid">
                      {categoryItems.map((item) => {
                        const scopeRef = scopeRefs[item.code] ?? defaultScopeRef(item, tenantBranches);
                        const activeItem = activeItems.find(
                          (candidate) =>
                            candidate.serviceId === item.code &&
                            (item.billingScope === "TENANT" ||
                              (candidate.scopeRefId ?? "") === scopeRef),
                        );
                        const quantity = quantities[item.code] ?? activeItem?.quantity ?? 1;
                        const needsScope = item.billingScope !== "TENANT";
                        return (
                          <article key={item.code} className="profile-card">
                            <p className="profile-eyebrow">
                              {item.billingType === "QUANTITY" ? "Por cantidad" : "Servicio"} ·{" "}
                              {item.billingScope}
                            </p>
                            <h2>{item.name}</h2>
                            <p>{formatMoney(item.unitPrice, item.currency)} / mes</p>
                            <details>
                              <summary>Ver descripción y beneficios</summary>
                              <p>{item.description}</p>
                              <ul>
                                {item.benefits.map((benefit) => (
                                  <li key={benefit}>{benefit}</li>
                                ))}
                              </ul>
                              {item.dependsOn.length > 0 ? (
                                <p>Requiere: {item.dependsOn.join(", ")}</p>
                              ) : null}
                            </details>
                            {item.billingScope === "BRANCH" ? (
                              <label>
                                Sucursal
                                <select
                                  value={scopeRef}
                                  onChange={(event) =>
                                    setScopeRefs((current) => ({
                                      ...current,
                                      [item.code]: event.target.value,
                                    }))
                                  }
                                >
                                  <option value="">Seleccionar</option>
                                  {tenantBranches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                      {branch.name}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            ) : needsScope ? (
                              <label>
                                ID de alcance ({item.billingScope})
                                <input
                                  value={scopeRef}
                                  onChange={(event) =>
                                    setScopeRefs((current) => ({
                                      ...current,
                                      [item.code]: event.target.value,
                                    }))
                                  }
                                  placeholder="UUID del recurso"
                                />
                              </label>
                            ) : null}
                            {item.billingType === "QUANTITY" ? (
                              <label>
                                Cantidad
                                <input
                                  type="number"
                                  min={1}
                                  step={1}
                                  value={quantity}
                                  onChange={(event) =>
                                    setQuantities((current) => ({
                                      ...current,
                                      [item.code]: Math.max(1, Number(event.target.value) || 1),
                                    }))
                                  }
                                />
                              </label>
                            ) : null}
                            <p>
                              Total:{" "}
                              <strong>
                                {formatMoney(
                                  item.unitPrice *
                                    (item.billingType === "QUANTITY" ? quantity : 1),
                                  item.currency,
                                )}
                              </strong>
                            </p>
                            <button
                              type="button"
                              disabled={itemMutation.isPending || (needsScope && !scopeRef)}
                              onClick={() => {
                                if (activeItem) {
                                  if (
                                    item.billingType === "QUANTITY" &&
                                    activeItem.quantity !== quantity
                                  ) {
                                    itemMutation.mutate({
                                      path: `/v1/subscriptions/${selectedTenantId}/items/${activeItem.id}`,
                                      method: "PATCH",
                                      body: { quantity },
                                    });
                                  } else {
                                    itemMutation.mutate({
                                      path: `/v1/subscriptions/${selectedTenantId}/items/${activeItem.id}`,
                                      method: "DELETE",
                                    });
                                  }
                                  return;
                                }
                                itemMutation.mutate({
                                  path: `/v1/subscriptions/${selectedTenantId}/items`,
                                  method: "POST",
                                  body: {
                                    catalogItemCode: item.code,
                                    ...(item.billingType === "QUANTITY" ? { quantity } : {}),
                                    ...(needsScope ? { scopeRefId: scopeRef } : {}),
                                  },
                                });
                              }}
                            >
                              {activeItem
                                ? item.billingType === "QUANTITY" &&
                                  activeItem.quantity !== quantity
                                  ? "Actualizar cantidad"
                                  : "Desactivar"
                                : "Activar"}
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </article>

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

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function defaultScopeRef(
  item: CatalogItemResponse,
  branches: { id: string; code: string; name: string }[],
) {
  return item.billingScope === "BRANCH" && branches.length === 1 ? branches[0]!.id : "";
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
