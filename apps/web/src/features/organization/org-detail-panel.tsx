import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { StateView } from "../../components/state-view.js";
import { useAuth } from "../../app/auth-context.js";
import { useTenantContext } from "../../app/tenant-context.js";
import { apiRequest } from "../../lib/api-client.js";
import { useTenantQuery } from "../../lib/use-tenant-query.js";
import {
  employmentsForBranch,
  organizationPanelTitle,
  type BranchEmployment,
  type OrganizationBrand,
  type OrganizationBranch,
  type OrganizationNode,
  type OrganizationSalon,
} from "./org-explorer-model.js";

interface OrgDetailPanelProps {
  node: OrganizationNode | null;
  onSelect: (node: OrganizationNode) => void;
  onNotify: (message: string) => void;
}

export function OrgDetailPanel({
  node,
  onSelect,
  onNotify,
}: OrgDetailPanelProps) {
  if (!node) {
    return (
      <section
        className="org-detail org-detail--empty"
        aria-labelledby="org-empty-heading"
      >
        <span aria-hidden="true">↖</span>
        <p className="org-kicker">Panel de detalle</p>
        <h2 id="org-empty-heading">Elegí un nodo del árbol</h2>
        <p>Acá vas a ver sus datos, estado y acciones disponibles.</p>
      </section>
    );
  }

  return (
    <section className="org-detail" aria-label={organizationPanelTitle(node)}>
      {node.type === "brand" ? (
        <BrandDetailPanel
          key={node.id ?? "new"}
          id={node.id}
          onSelect={onSelect}
          onNotify={onNotify}
        />
      ) : null}
      {node.type === "branch" ? (
        <BranchDetailPanel
          key={node.id ?? `new-${node.parentId}`}
          id={node.id}
          brandId={node.parentId}
          onSelect={onSelect}
          onNotify={onNotify}
        />
      ) : null}
      {node.type === "salon" ? (
        <SalonDetailPanel
          key={node.id ?? `new-${node.parentId}`}
          id={node.id}
          branchId={node.parentId}
          onSelect={onSelect}
          onNotify={onNotify}
        />
      ) : null}
      {node.type === "branch-employees" ? (
        <BranchEmployeesPanel key={node.id} branchId={node.id} />
      ) : null}
    </section>
  );
}

function BrandDetailPanel({
  id,
  onSelect,
  onNotify,
}: {
  id: string | null;
  onSelect: (node: OrganizationNode) => void;
  onNotify: (message: string) => void;
}) {
  const queryClient = useQueryClient();
  const brandQuery = useTenantQuery<{
    data: OrganizationBrand & { description?: string };
  }>(`organization-brand-${id ?? "new"}`, `/v1/brands/${id ?? "new"}`, {
    enabled: Boolean(id),
  });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const mutation = usePanelMutation();

  useEffect(() => {
    if (!brandQuery.data?.data) return;
    setName(brandQuery.data.data.name);
    setDescription(brandQuery.data.data.description ?? "");
    setStatus(normalizeActiveStatus(brandQuery.data.data.status));
  }, [brandQuery.data]);

  async function save(event: FormEvent) {
    event.preventDefault();
    const result = await mutation.run<{ data: OrganizationBrand }>(
      id ? `/v1/brands/${id}` : "/v1/brands",
      id ? "PATCH" : "POST",
      id
        ? { name, description, status }
        : {
            name,
            description: description || undefined,
            config: { language: "es", currency: "ARS" },
          },
    );
    if (!result) return;
    await queryClient.invalidateQueries({ queryKey: ["organization-brands"] });
    if (!id) {
      onNotify("Marca creada correctamente.");
      onSelect({ type: "brand", id: result.data.id });
    }
  }

  return (
    <PanelFrame
      kicker="Nivel 01 / Marca"
      title={id ? "Detalle de marca" : "Nueva marca"}
      subtitle={
        id
          ? "Identidad comercial y estado de publicación."
          : "Creá la raíz comercial que agrupará sucursales."
      }
    >
      <StateView
        isLoading={Boolean(id) && brandQuery.isLoading}
        error={id ? (brandQuery.error as Error | null) : null}
        onRetry={() => void brandQuery.refetch()}
      >
        <form className="org-form" onSubmit={(event) => void save(event)}>
          <label>
            Nombre
            <input
              required
              minLength={3}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label>
            Descripción
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          {id ? (
            <label>
              Estado
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "ACTIVE" | "INACTIVE")
                }
              >
                <option value="ACTIVE">Activa</option>
                <option value="INACTIVE">Inactiva</option>
              </select>
            </label>
          ) : null}
          <PanelMutationFeedback mutation={mutation} />
          <button type="submit" disabled={mutation.isSaving}>
            {mutation.isSaving
              ? "Guardando…"
              : id
                ? "Guardar cambios"
                : "Crear marca"}
          </button>
        </form>
      </StateView>
    </PanelFrame>
  );
}

function BranchDetailPanel({
  id,
  brandId,
  onSelect,
  onNotify,
}: {
  id: string | null;
  brandId: string;
  onSelect: (node: OrganizationNode) => void;
  onNotify: (message: string) => void;
}) {
  const queryClient = useQueryClient();
  const branchQuery = useTenantQuery<{ data: OrganizationBranch }>(
    `organization-branch-${id ?? "new"}`,
    `/v1/branches/${id ?? "new"}`,
    { enabled: Boolean(id) },
  );
  const brandQuery = useTenantQuery<{ data: OrganizationBrand }>(
    `organization-parent-brand-${brandId}`,
    `/v1/brands/${brandId}`,
  );
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [timezone, setTimezone] = useState("America/Argentina/Buenos_Aires");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const mutation = usePanelMutation();

  useEffect(() => {
    if (!branchQuery.data?.data) return;
    setName(branchQuery.data.data.name);
    setCode(branchQuery.data.data.code);
    setTimezone(branchQuery.data.data.timezone);
    setStatus(normalizeActiveStatus(branchQuery.data.data.status));
  }, [branchQuery.data]);

  async function save(event: FormEvent) {
    event.preventDefault();
    const result = await mutation.run<{ data: OrganizationBranch }>(
      id ? `/v1/branches/${id}` : "/v1/branches",
      id ? "PATCH" : "POST",
      id ? { name, status } : { brandId, name, code, timezone },
    );
    if (!result) return;
    await queryClient.invalidateQueries({
      queryKey: ["organization-branches"],
    });
    if (!id) {
      onNotify("Sucursal creada correctamente.");
      onSelect({ type: "branch", id: result.data.id, parentId: brandId });
    }
  }

  return (
    <PanelFrame
      kicker="Nivel 02 / Sucursal"
      title={id ? "Detalle de sucursal" : "Nueva sucursal"}
      subtitle={`Marca: ${brandQuery.data?.data.name ?? "cargando…"}`}
    >
      <StateView
        isLoading={
          (Boolean(id) && branchQuery.isLoading) || brandQuery.isLoading
        }
        error={(branchQuery.error ?? brandQuery.error) as Error | null}
        onRetry={() =>
          void Promise.all([branchQuery.refetch(), brandQuery.refetch()])
        }
      >
        <form className="org-form" onSubmit={(event) => void save(event)}>
          <label>
            Nombre
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label>
            Código
            <input
              required
              disabled={Boolean(id)}
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
            />
          </label>
          <label>
            Zona horaria
            <input
              required
              disabled={Boolean(id)}
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
            />
          </label>
          {id ? (
            <label>
              Estado
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "ACTIVE" | "INACTIVE")
                }
              >
                <option value="ACTIVE">Activa</option>
                <option value="INACTIVE">Inactiva</option>
              </select>
            </label>
          ) : null}
          <PanelMutationFeedback mutation={mutation} />
          <button type="submit" disabled={mutation.isSaving}>
            {mutation.isSaving
              ? "Guardando…"
              : id
                ? "Guardar cambios"
                : "Crear sucursal"}
          </button>
        </form>
      </StateView>
    </PanelFrame>
  );
}

function SalonDetailPanel({
  id,
  branchId,
  onSelect,
  onNotify,
}: {
  id: string | null;
  branchId: string;
  onSelect: (node: OrganizationNode) => void;
  onNotify: (message: string) => void;
}) {
  const queryClient = useQueryClient();
  const salonQuery = useTenantQuery<{ data: OrganizationSalon }>(
    `organization-salon-${id ?? "new"}`,
    `/v1/salons/${id ?? "new"}`,
    { enabled: Boolean(id) },
  );
  const branchQuery = useTenantQuery<{ data: OrganizationBranch }>(
    `organization-parent-branch-${branchId}`,
    `/v1/branches/${branchId}`,
  );
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(40);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const mutation = usePanelMutation();

  useEffect(() => {
    if (!salonQuery.data?.data) return;
    setName(salonQuery.data.data.name);
    setCapacity(salonQuery.data.data.capacity);
    setStatus(salonQuery.data.data.status);
  }, [salonQuery.data]);

  async function save(event: FormEvent) {
    event.preventDefault();
    const result = await mutation.run<{ data: OrganizationSalon }>(
      id ? `/v1/salons/${id}` : "/v1/salons",
      id ? "PATCH" : "POST",
      id ? { name, capacity, status } : { branchId, name, capacity },
    );
    if (!result) return;
    await queryClient.invalidateQueries({ queryKey: [`salons-${branchId}`] });
    if (!id) {
      onNotify("Salón creado correctamente.");
      onSelect({ type: "salon", id: result.data.id, parentId: branchId });
    }
  }

  async function deactivate() {
    const saved = await mutation.run<undefined>(`/v1/salons/${id}`, "DELETE");
    if (saved === null) return;
    setStatus("INACTIVE");
    await queryClient.invalidateQueries({ queryKey: [`salons-${branchId}`] });
  }

  return (
    <PanelFrame
      kicker="Nivel 03 / Salón"
      title={id ? "Detalle de salón" : "Nuevo salón"}
      subtitle={`Sucursal: ${branchQuery.data?.data.name ?? "cargando…"}`}
    >
      <StateView
        isLoading={
          (Boolean(id) && salonQuery.isLoading) || branchQuery.isLoading
        }
        error={(salonQuery.error ?? branchQuery.error) as Error | null}
        onRetry={() =>
          void Promise.all([salonQuery.refetch(), branchQuery.refetch()])
        }
      >
        <form className="org-form" onSubmit={(event) => void save(event)}>
          <label>
            Nombre
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label>
            Capacidad
            <input
              required
              type="number"
              min={1}
              value={capacity}
              onChange={(event) => setCapacity(Number(event.target.value))}
            />
          </label>
          {id ? (
            <label>
              Estado
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "ACTIVE" | "INACTIVE")
                }
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </label>
          ) : null}
          <PanelMutationFeedback mutation={mutation} />
          <div className="org-form__actions">
            <button type="submit" disabled={mutation.isSaving}>
              {mutation.isSaving
                ? "Guardando…"
                : id
                  ? "Guardar cambios"
                  : "Crear salón"}
            </button>
            {id && status === "ACTIVE" ? (
              <button
                className="button-secondary"
                type="button"
                disabled={mutation.isSaving}
                onClick={() => void deactivate()}
              >
                Desactivar
              </button>
            ) : null}
          </div>
        </form>
      </StateView>
    </PanelFrame>
  );
}

interface UserListItem {
  id: string;
  email: string | null;
  name: string;
  status: string;
  roleIds: string[];
}
interface RoleListItem {
  id: string;
  name: string;
}

function BranchEmployeesPanel({ branchId }: { branchId: string }) {
  const branchQuery = useTenantQuery<{ data: OrganizationBranch }>(
    `organization-parent-branch-${branchId}`,
    `/v1/branches/${branchId}`,
  );
  const employmentsQuery = useTenantQuery<{ data: BranchEmployment[] }>(
    `branch-employments-${branchId}`,
    `/v1/branches/${branchId}/employments`,
  );
  const usersQuery = useTenantQuery<{ data: UserListItem[] }>(
    "organization-users",
    "/v1/users",
  );
  const rolesQuery = useTenantQuery<{ data: RoleListItem[] }>(
    "organization-roles",
    "/v1/roles",
  );
  const employments = employmentsForBranch(
    employmentsQuery.data?.data ?? [],
    branchId,
  );
  const users = usersQuery.data?.data ?? [];

  return (
    <PanelFrame
      kicker="Nivel 03 / Equipo"
      title="Empleados de la sucursal"
      subtitle={`Sucursal: ${branchQuery.data?.data.name ?? "cargando…"}`}
    >
      <StateView
        isLoading={
          branchQuery.isLoading ||
          employmentsQuery.isLoading ||
          usersQuery.isLoading ||
          rolesQuery.isLoading
        }
        error={
          (branchQuery.error ??
            employmentsQuery.error ??
            usersQuery.error ??
            rolesQuery.error) as Error | null
        }
        onRetry={() =>
          void Promise.all([
            branchQuery.refetch(),
            employmentsQuery.refetch(),
            usersQuery.refetch(),
            rolesQuery.refetch(),
          ])
        }
      >
        {employments.length > 0 ? (
          <div
            className="org-employee-list"
            role="list"
            aria-label="Empleados asignados"
          >
            {employments.map((employment) => {
              const user = users.find(
                (item) =>
                  item.id === employment.personRef ||
                  item.email === employment.personRef,
              );
              const roleNames =
                user?.roleIds.map(
                  (roleId) =>
                    rolesQuery.data?.data.find((role) => role.id === roleId)
                      ?.name ?? roleId,
                ) ?? [];
              return (
                <article
                  key={employment.id}
                  role="listitem"
                  className="org-employee-card"
                >
                  <div>
                    <span>{employment.employeeCode}</span>
                    <strong>{user?.name ?? employment.personRef}</strong>
                    <small>{user?.email ?? employment.relationshipType}</small>
                  </div>
                  <dl>
                    <div>
                      <dt>Estado</dt>
                      <dd>{employment.status}</dd>
                    </div>
                    <div>
                      <dt>Perfiles</dt>
                      <dd>
                        {roleNames.length
                          ? roleNames.join(", ")
                          : "Sin perfil vinculado"}
                      </dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="org-panel-empty">
            <span aria-hidden="true">○</span>
            <h3>No hay empleados asignados</h3>
            <p>
              Las asignaciones de workforce para esta sucursal aparecerán acá.
            </p>
          </div>
        )}
      </StateView>
    </PanelFrame>
  );
}

function PanelFrame({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <>
      <header className="org-detail__header">
        <p className="org-kicker">{kicker}</p>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>
      <div className="org-detail__body">{children}</div>
    </>
  );
}

function usePanelMutation() {
  const { accessToken } = useAuth();
  const { selectedTenantId } = useTenantContext();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function run<T>(
    path: string,
    method: "POST" | "PATCH" | "DELETE",
    body?: unknown,
  ): Promise<T | null> {
    if (!accessToken || !selectedTenantId) return null;
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await apiRequest<T>(path, {
        accessToken,
        tenantId: selectedTenantId,
        method,
        ...(body !== undefined ? { body } : {}),
      });
      setMessage("Cambios guardados correctamente.");
      return response;
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo guardar el cambio",
      );
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  return { isSaving, error, message, run };
}

function PanelMutationFeedback({
  mutation,
}: {
  mutation: ReturnType<typeof usePanelMutation>;
}) {
  return (
    <>
      {mutation.error ? (
        <p className="login-error" role="alert">
          {mutation.error}
        </p>
      ) : null}
      {mutation.message ? (
        <p className="org-form__success" role="status">
          {mutation.message}
        </p>
      ) : null}
    </>
  );
}

function normalizeActiveStatus(status: string): "ACTIVE" | "INACTIVE" {
  const normalized = status.trim().toUpperCase();
  return normalized === "ACTIVE" ||
    normalized === "OPEN" ||
    normalized === "ENABLED"
    ? "ACTIVE"
    : "INACTIVE";
}
