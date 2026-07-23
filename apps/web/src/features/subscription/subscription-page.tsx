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

  return (
    <section aria-labelledby="subscription-heading">
      <h1 id="subscription-heading">Suscripción &amp; Billing</h1>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        onRetry={() => {
          void subscriptionQuery.refetch();
          void entitlementsQuery.refetch();
        }}
      >
        {subscriptionQuery.data && (
          <p>
            Plan <strong>{subscriptionQuery.data.data.planCode}</strong> —{" "}
            {subscriptionQuery.data.data.status}
          </p>
        )}
        {entitlementsQuery.data && (
          <table>
            <caption className="sr-only">Límites y uso actual</caption>
            <thead>
              <tr>
                <th scope="col">Recurso</th>
                <th scope="col">Uso</th>
                <th scope="col">Límite</th>
              </tr>
            </thead>
            <tbody>
              {entitlementsQuery.data.data.entitlements.map((e) => {
                const quota = entitlementsQuery.data!.data.quotas.find(
                  (q) => q.resource === e.resource,
                );
                return (
                  <tr key={e.resource}>
                    <td>{e.resource}</td>
                    <td>{quota?.used ?? 0}</td>
                    <td>{e.hardLimit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </StateView>
    </section>
  );
}
