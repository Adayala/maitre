import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { StateView } from "../../components/state-view.js";

interface UserListItem {
  id: string;
  email: string | null;
  name: string;
  status: string;
  roleIds: string[];
}

export function UsersPage() {
  const { data, isLoading, error, refetch } = useTenantQuery<{ data: UserListItem[] }>(
    "users",
    "/v1/users",
  );

  return (
    <section aria-labelledby="users-heading">
      <h1 id="users-heading">Usuarios</h1>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        isEmpty={data?.data.length === 0}
        emptyMessage="Todavía no hay usuarios invitados."
        onRetry={() => void refetch()}
      >
        <table>
          <caption className="sr-only">Listado de usuarios</caption>
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Email</th>
              <th scope="col">Roles</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email ?? "—"}</td>
                <td>{user.roleIds.join(", ")}</td>
                <td>{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StateView>
    </section>
  );
}
