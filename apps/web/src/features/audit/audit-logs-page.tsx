import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { StateView } from "../../components/state-view.js";

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

  return (
    <section aria-labelledby="audit-heading">
      <h1 id="audit-heading">Auditoría</h1>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        isEmpty={data?.data.length === 0}
        emptyMessage="Todavía no hay eventos de auditoría registrados."
        onRetry={() => void refetch()}
      >
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
            {data?.data.map((entry) => (
              <tr key={entry.id}>
                <td>{new Date(entry.occurredAt).toLocaleString("es-AR")}</td>
                <td>{entry.action}</td>
                <td>
                  {entry.resourceType} ({entry.resourceId})
                </td>
                <td>{entry.actorId ?? entry.actorType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StateView>
    </section>
  );
}
