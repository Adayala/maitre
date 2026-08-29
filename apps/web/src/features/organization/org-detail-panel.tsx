import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { StateView } from "../../components/state-view.js";
import { useAuth } from "../../app/auth-context.js";
import { useTenantContext } from "../../app/tenant-context.js";
import { apiRequest } from "../../lib/api-client.js";
import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { BrandPresentationEditor } from "../brands/brands-page.js";
import {
  buildBranchEmploymentPayload,
  editableMembershipStatus,
  employmentsForBranch,
  organizationPanelTitle,
  organizationPathLabel,
  servicePeriodStatusLabel,
  servicePeriodTypeLabel,
  userForEmployment,
  type BranchEmployment,
  type EmploymentRelationshipType,
  type OrganizationBrand,
  type OrganizationBranch,
  type OrganizationNode,
  type OrganizationPlaza,
  plazaModeLabel,
  type OrganizationSalon,
  type OrganizationServicePeriod,
  type OrganizationTable,
  type OrganizationUser,
} from "./org-explorer-model.js";

interface OrgDetailPanelProps {
  node: OrganizationNode | null;
  brands: OrganizationBrand[];
  branches: OrganizationBranch[];
  onSelect: (node: OrganizationNode) => void;
  onNotify: (message: string) => void;
}

export function OrgDetailPanel({
  node,
  brands,
  branches,
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
          initialBrand={brands.find((brand) => brand.id === node.id)}
          onSelect={onSelect}
          onNotify={onNotify}
        />
      ) : null}
      {node.type === "branch" ? (
        <BranchDetailPanel
          key={node.id ?? `new-${node.parentId}`}
          id={node.id}
          brandId={node.parentId}
          initialBranch={branches.find((branch) => branch.id === node.id)}
          initialBrand={brands.find((brand) => brand.id === node.parentId)}
          onSelect={onSelect}
          onNotify={onNotify}
        />
      ) : null}
      {node.type === "salon" ? (
        <SalonDetailPanel
          key={node.id ?? `new-${node.parentId}`}
          id={node.id}
          branchId={node.parentId}
          brands={brands}
          onSelect={onSelect}
          onNotify={onNotify}
        />
      ) : null}
      {node.type === "plaza" ? (
        <PlazaDetailPanel
          key={node.id ?? `new-${node.parentId}`}
          id={node.id}
          branchId={node.branchId}
          servicePeriodId={node.parentId}
          salonId={node.salonId}
          onSelect={onSelect}
          onNotify={onNotify}
        />
      ) : null}
      {node.type === "service-period" ? (
        <ServicePeriodDetailPanel
          key={node.id ?? `new-${node.parentId}`}
          id={node.id}
          branchId={node.parentId}
          onSelect={onSelect}
          onNotify={onNotify}
        />
      ) : null}
      {node.type === "table" ? (
        <TableDetailPanel
          key={node.id ?? `new-${node.parentId}`}
          id={node.id}
          salonId={node.parentId}
          onSelect={onSelect}
          onNotify={onNotify}
        />
      ) : null}
      {node.type === "branch-employees" ? (
        <BranchEmployeesPanel
          key={node.id}
          branchId={node.id}
          onSelect={onSelect}
        />
      ) : null}
      {node.type === "employee" ? (
        <EmployeeDetailPanel
          key={node.id}
          id={node.id}
          branchId={node.parentId}
        />
      ) : null}
    </section>
  );
}

function BrandDetailPanel({
  id,
  initialBrand,
  onSelect,
  onNotify,
}: {
  id: string | null;
  initialBrand?: OrganizationBrand;
  onSelect: (node: OrganizationNode) => void;
  onNotify: (message: string) => void;
}) {
  const queryClient = useQueryClient();
  const brandQuery = useTenantQuery<{
    data: OrganizationBrand & { description?: string };
  }>(`organization-brand-${id ?? "new"}`, `/v1/brands/${id ?? "new"}`, {
    enabled: Boolean(id),
    ...(initialBrand ? { initialData: { data: initialBrand } } : {}),
  });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [isHydrated, setIsHydrated] = useState(!id);
  const mutation = usePanelMutation();

  useEffect(() => {
    if (!brandQuery.data?.data) return;
    setName(brandQuery.data.data.name);
    setDescription(brandQuery.data.data.description ?? "");
    setStatus(normalizeActiveStatus(brandQuery.data.data.status));
    setIsHydrated(true);
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
        isLoading={Boolean(id) && (brandQuery.isLoading || !isHydrated)}
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
        {id && brandQuery.data?.data ? (
          <BrandPresentationEditor brand={brandQuery.data.data} />
        ) : null}
      </StateView>
    </PanelFrame>
  );
}

function BranchDetailPanel({
  id,
  brandId,
  initialBranch,
  initialBrand,
  onSelect,
  onNotify,
}: {
  id: string | null;
  brandId: string;
  initialBranch?: OrganizationBranch;
  initialBrand?: OrganizationBrand;
  onSelect: (node: OrganizationNode) => void;
  onNotify: (message: string) => void;
}) {
  const queryClient = useQueryClient();
  const branchQuery = useTenantQuery<{ data: OrganizationBranch }>(
    `organization-branch-${id ?? "new"}`,
    `/v1/branches/${id ?? "new"}`,
    {
      enabled: Boolean(id),
      ...(initialBranch ? { initialData: { data: initialBranch } } : {}),
    },
  );
  const brandQuery = useTenantQuery<{ data: OrganizationBrand }>(
    `organization-parent-brand-${brandId}`,
    `/v1/brands/${brandId}`,
    initialBrand ? { initialData: { data: initialBrand } } : undefined,
  );
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [timezone, setTimezone] = useState("America/Argentina/Buenos_Aires");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [isHydrated, setIsHydrated] = useState(!id);
  const mutation = usePanelMutation();

  useEffect(() => {
    if (!branchQuery.data?.data) return;
    setName(branchQuery.data.data.name);
    setCode(branchQuery.data.data.code);
    setTimezone(branchQuery.data.data.timezone);
    setStatus(normalizeActiveStatus(branchQuery.data.data.status));
    setIsHydrated(true);
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
          (Boolean(id) && (branchQuery.isLoading || !isHydrated)) ||
          brandQuery.isLoading
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
  brands,
  onSelect,
  onNotify,
}: {
  id: string | null;
  branchId: string;
  brands: OrganizationBrand[];
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
  const [isHydrated, setIsHydrated] = useState(!id);
  const mutation = usePanelMutation();
  const branch = branchQuery.data?.data;
  const brand = brands.find((candidate) => candidate.id === branch?.brandId);
  const subtitle =
    branch && brand
      ? organizationPathLabel({ brand: brand.name, branch: branch.name })
      : "Ruta de organización: cargando…";

  useEffect(() => {
    if (!salonQuery.data?.data) return;
    setName(salonQuery.data.data.name);
    setCapacity(salonQuery.data.data.capacity);
    setStatus(salonQuery.data.data.status);
    setIsHydrated(true);
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
      subtitle={subtitle}
    >
      <StateView
        isLoading={
          (Boolean(id) && (salonQuery.isLoading || !isHydrated)) ||
          branchQuery.isLoading
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

function TableDetailPanel({
  id,
  salonId,
  onSelect,
  onNotify,
}: {
  id: string | null;
  salonId: string;
  onSelect: (node: OrganizationNode) => void;
  onNotify: (message: string) => void;
}) {
  const queryClient = useQueryClient();
  const tableQuery = useTenantQuery<{ data: OrganizationTable }>(
    `organization-table-${id ?? "new"}`,
    `/v1/tables/${id ?? "new"}`,
    { enabled: Boolean(id) },
  );
  const salonQuery = useTenantQuery<{ data: OrganizationSalon }>(
    `organization-parent-salon-${salonId}`,
    `/v1/salons/${salonId}`,
  );
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(2);
  const [isHydrated, setIsHydrated] = useState(!id);
  const mutation = usePanelMutation();

  useEffect(() => {
    if (!tableQuery.data?.data) return;
    setNumber(tableQuery.data.data.number);
    setName(tableQuery.data.data.name ?? "");
    setCapacity(tableQuery.data.data.capacity);
    setIsHydrated(true);
  }, [tableQuery.data]);

  async function save(event: FormEvent) {
    event.preventDefault();
    const result = await mutation.run<{ data: OrganizationTable }>(
      id ? `/v1/tables/${id}` : "/v1/tables",
      id ? "PATCH" : "POST",
      {
        ...(id ? {} : { salonId }),
        number,
        capacity,
        ...(name.trim() ? { name: name.trim() } : {}),
      },
    );
    if (!result) return;
    await queryClient.invalidateQueries({
      queryKey: [`organization-tables-${salonId}`],
    });
    if (!id) {
      onNotify("Mesa creada correctamente.");
      onSelect({ type: "table", id: result.data.id, parentId: salonId });
    }
  }

  return (
    <PanelFrame
      kicker="Nivel 05 / Mesa"
      title={id ? "Detalle de mesa" : "Nueva mesa"}
      subtitle={`Salón: ${salonQuery.data?.data.name ?? "cargando…"}`}
    >
      <StateView
        isLoading={
          salonQuery.isLoading ||
          (Boolean(id) && (tableQuery.isLoading || !isHydrated))
        }
        error={(salonQuery.error ?? tableQuery.error) as Error | null}
        onRetry={() =>
          void Promise.all([salonQuery.refetch(), tableQuery.refetch()])
        }
      >
        <form className="org-form" onSubmit={(event) => void save(event)}>
          <label>
            Número
            <input
              required
              maxLength={10}
              value={number}
              onChange={(event) => setNumber(event.target.value)}
            />
          </label>
          <label>
            Nombre visible
            <input
              maxLength={50}
              placeholder="Ej. Ventana"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label>
            Cubiertos
            <input
              required
              type="number"
              min={1}
              max={20}
              value={capacity}
              onChange={(event) => setCapacity(Number(event.target.value))}
            />
            <small>Capacidad máxima de comensales de esta mesa.</small>
          </label>
          <PanelMutationFeedback mutation={mutation} />
          <button type="submit" disabled={mutation.isSaving}>
            {mutation.isSaving
              ? "Guardando…"
              : id
                ? "Guardar mesa"
                : "Crear mesa"}
          </button>
        </form>
      </StateView>
    </PanelFrame>
  );
}

function ServicePeriodDetailPanel({
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
  const branchQuery = useTenantQuery<{ data: OrganizationBranch }>(
    `organization-parent-branch-${branchId}`,
    `/v1/branches/${branchId}`,
  );
  const periodQuery = useTenantQuery<{ data: OrganizationServicePeriod }>(
    `organization-service-period-${id ?? "new"}`,
    `/v1/service-periods/${id ?? "new"}`,
    { enabled: Boolean(id) },
  );
  const [name, setName] = useState("");
  const [businessDate, setBusinessDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [type, setType] = useState<OrganizationServicePeriod["type"]>("OTHER");
  const mutation = usePanelMutation();
  const period = periodQuery.data?.data;

  async function create(event: FormEvent) {
    event.preventDefault();
    const result = await mutation.run<{ data: OrganizationServicePeriod }>(
      `/v1/branches/${branchId}/service-periods`,
      "POST",
      { name, businessDate, type },
    );
    if (!result) return;
    await queryClient.invalidateQueries({
      queryKey: [`organization-periods-${branchId}`],
    });
    onNotify("Jornada creada. Ya podés organizar sus plazas.");
    onSelect({
      type: "service-period",
      id: result.data.id,
      parentId: branchId,
    });
  }

  async function transition(
    action: "open" | "begin-close" | "close" | "cancel-planned",
    message: string,
  ) {
    if (!id) return;
    const result = await mutation.run<{ data: OrganizationServicePeriod }>(
      `/v1/service-periods/${id}/${action}`,
      "POST",
    );
    if (!result) return;
    await Promise.all([
      periodQuery.refetch(),
      queryClient.invalidateQueries({
        queryKey: [`organization-periods-${branchId}`],
      }),
    ]);
    onNotify(message);
  }

  return (
    <PanelFrame
      kicker="Operación / Jornada de servicio"
      title={id ? "Detalle de jornada" : "Nueva jornada"}
      subtitle={`Ejecución operativa en ${branchQuery.data?.data.name ?? "la sucursal"}; sus plazas agrupan mesas y responsables.`}
    >
      <StateView
        isLoading={
          branchQuery.isLoading || (Boolean(id) && periodQuery.isLoading)
        }
        error={(branchQuery.error ?? periodQuery.error) as Error | null}
        onRetry={() =>
          void Promise.all([branchQuery.refetch(), periodQuery.refetch()])
        }
      >
        {!id ? (
          <form className="org-form" onSubmit={(event) => void create(event)}>
            <label>
              Nombre de la jornada
              <input
                required
                minLength={2}
                maxLength={80}
                placeholder="Ej. Cena del sábado"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label>
              Fecha operativa
              <input
                required
                type="date"
                value={businessDate}
                onChange={(event) => setBusinessDate(event.target.value)}
              />
            </label>
            <label>
              Tipo de servicio
              <select
                value={type}
                onChange={(event) =>
                  setType(
                    event.target.value as OrganizationServicePeriod["type"],
                  )
                }
              >
                <option value="BREAKFAST">Desayuno</option>
                <option value="LUNCH">Almuerzo</option>
                <option value="DINNER">Cena</option>
                <option value="OTHER">Otro servicio</option>
              </select>
            </label>
            <PanelMutationFeedback mutation={mutation} />
            <button type="submit" disabled={mutation.isSaving}>
              {mutation.isSaving ? "Creando…" : "Crear jornada"}
            </button>
          </form>
        ) : null}
        {id && period ? (
          <div className="org-period-detail">
            <div className="org-period-detail__status">
              <span
                className={`org-status org-status--${period.status.toLowerCase()}`}
              >
                {servicePeriodStatusLabel(period.status)}
              </span>
              <p>
                {servicePeriodTypeLabel(period.type)} · {period.businessDate}
              </p>
            </div>
            <dl className="org-period-detail__facts">
              <div>
                <dt>Jornada</dt>
                <dd>{period.name}</dd>
              </div>
              <div>
                <dt>Sucursal</dt>
                <dd>{branchQuery.data?.data.name}</dd>
              </div>
              <div>
                <dt>Apertura real</dt>
                <dd>
                  {period.actualOpen
                    ? new Date(period.actualOpen).toLocaleString("es-AR")
                    : "Todavía no abierta"}
                </dd>
              </div>
              <div>
                <dt>Cierre real</dt>
                <dd>
                  {period.actualClose
                    ? new Date(period.actualClose).toLocaleString("es-AR")
                    : "Todavía no cerrada"}
                </dd>
              </div>
            </dl>
            <div className="org-period-detail__explanation">
              <strong>Plazas de esta jornada</strong>
              <p>
                Volvé al árbol para crear cada Plaza, elegir su salón, agrupar
                mesas y asignar un mozo. La mesa sigue perteneciendo físicamente
                al salón.
              </p>
            </div>
            <PanelMutationFeedback mutation={mutation} />
            <div className="org-form__actions">
              {period.status === "PLANNED" ? (
                <>
                  <button
                    type="button"
                    disabled={mutation.isSaving}
                    onClick={() =>
                      void transition("open", "Jornada abierta correctamente.")
                    }
                  >
                    Abrir jornada
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    disabled={mutation.isSaving}
                    onClick={() =>
                      void transition(
                        "cancel-planned",
                        "Jornada cancelada correctamente.",
                      )
                    }
                  >
                    Cancelar jornada
                  </button>
                </>
              ) : null}
              {period.status === "OPEN" ? (
                <button
                  type="button"
                  disabled={mutation.isSaving}
                  onClick={() =>
                    void transition(
                      "begin-close",
                      "La jornada entró en proceso de cierre.",
                    )
                  }
                >
                  Iniciar cierre
                </button>
              ) : null}
              {period.status === "CLOSING" ? (
                <button
                  type="button"
                  disabled={mutation.isSaving}
                  onClick={() =>
                    void transition("close", "Jornada cerrada correctamente.")
                  }
                >
                  Cerrar jornada
                </button>
              ) : null}
              {period.status === "CLOSED" || period.status === "CANCELLED" ? (
                <p className="org-panel-note">
                  Esta jornada ya no admite cambios operativos.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </StateView>
    </PanelFrame>
  );
}

function PlazaDetailPanel({
  id,
  branchId,
  servicePeriodId,
  salonId,
  onSelect,
  onNotify,
}: {
  id: string | null;
  branchId: string;
  servicePeriodId: string;
  salonId: string | null;
  onSelect: (node: OrganizationNode) => void;
  onNotify: (message: string) => void;
}) {
  const queryClient = useQueryClient();
  const plazaQuery = useTenantQuery<{ data: OrganizationPlaza }>(
    `organization-plaza-${id ?? "new"}`,
    `/v1/plazas/${id ?? "new"}`,
    { enabled: Boolean(id) },
  );
  const periodQuery = useTenantQuery<{ data: OrganizationServicePeriod }>(
    `organization-service-period-${servicePeriodId}`,
    `/v1/service-periods/${servicePeriodId}`,
  );
  const salonsQuery = useTenantQuery<{ data: OrganizationSalon[] }>(
    `salons-${branchId}`,
    `/v1/salons?branchId=${encodeURIComponent(branchId)}`,
  );
  const [selectedSalonId, setSelectedSalonId] = useState(salonId ?? "");
  const tablesQuery = useTenantQuery<{ data: OrganizationTable[] }>(
    `organization-tables-${selectedSalonId || "pending"}`,
    `/v1/tables?salonId=${encodeURIComponent(selectedSalonId || "pending")}`,
    { enabled: Boolean(selectedSalonId) },
  );
  const employmentsQuery = useTenantQuery<{ data: BranchEmployment[] }>(
    `branch-employments-${branchId}`,
    `/v1/branches/${branchId}/employments`,
  );
  const usersQuery = useTenantQuery<{ data: OrganizationUser[] }>(
    "organization-users",
    "/v1/users",
  );
  const salons = salonsQuery.data?.data ?? [];
  const tables = tablesQuery.data?.data ?? [];
  const employments = employmentsForBranch(
    employmentsQuery.data?.data ?? [],
    branchId,
  ).filter((employment) => employment.status === "ACTIVE");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<OrganizationPlaza["mode"]>("VARIABLE");
  const [waiterEmploymentId, setWaiterEmploymentId] = useState("");
  const [tableIds, setTableIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(!id);
  const mutation = usePanelMutation();
  const period = periodQuery.data?.data;
  const isEditablePeriod =
    period?.status === "PLANNED" || period?.status === "OPEN";

  useEffect(() => {
    const plaza = plazaQuery.data?.data;
    if (!plaza) return;
    setName(plaza.name);
    setMode(plaza.mode ?? "VARIABLE");
    setSelectedSalonId(plaza.salonId);
    setWaiterEmploymentId(plaza.waiterEmploymentId ?? "");
    setTableIds(plaza.tableIds);
    setIsHydrated(true);
  }, [plazaQuery.data]);

  useEffect(() => {
    if (!selectedSalonId && salons[0]) setSelectedSalonId(salons[0].id);
  }, [salons, selectedSalonId]);

  function toggleTable(tableId: string) {
    setTableIds((current) =>
      current.includes(tableId)
        ? current.filter((item) => item !== tableId)
        : [...current, tableId],
    );
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const result = await mutation.run<{ data: OrganizationPlaza }>(
      id ? `/v1/plazas/${id}` : "/v1/plazas",
      id ? "PATCH" : "POST",
      {
        ...(id
          ? {}
          : {
              salonId: selectedSalonId,
              servicePeriodId,
            }),
        name,
        mode,
        waiterEmploymentId: waiterEmploymentId || null,
        tableIds,
      },
    );
    if (!result) return;
    await queryClient.invalidateQueries({
      queryKey: [`organization-plazas-period-${servicePeriodId}`],
    });
    if (!id) {
      onNotify("Plaza creada y asignada a la jornada.");
      onSelect({
        type: "plaza",
        id: result.data.id,
        parentId: servicePeriodId,
        branchId,
        salonId: result.data.salonId,
      });
    }
  }

  const loadError =
    plazaQuery.error ??
    periodQuery.error ??
    salonsQuery.error ??
    tablesQuery.error ??
    employmentsQuery.error ??
    usersQuery.error;

  return (
    <PanelFrame
      kicker="Operación / Plaza"
      title={id ? "Detalle de plaza" : "Nueva plaza"}
      subtitle={
        period
          ? `${period.name} · ${period.businessDate}. Agrupá mesas del mismo salón y asigná un responsable.`
          : "Agrupación operativa de mesas para una jornada concreta."
      }
    >
      <StateView
        isLoading={
          periodQuery.isLoading ||
          salonsQuery.isLoading ||
          employmentsQuery.isLoading ||
          usersQuery.isLoading ||
          (Boolean(selectedSalonId) && tablesQuery.isLoading) ||
          (Boolean(id) && (plazaQuery.isLoading || !isHydrated))
        }
        error={loadError as Error | null}
        onRetry={() =>
          void Promise.all([
            plazaQuery.refetch(),
            periodQuery.refetch(),
            salonsQuery.refetch(),
            tablesQuery.refetch(),
            employmentsQuery.refetch(),
            usersQuery.refetch(),
          ])
        }
      >
        <form className="org-form" onSubmit={(event) => void save(event)}>
          <div
            className="org-operation-context"
            aria-label="Contexto operativo"
          >
            <span>Jornada</span>
            <strong>{period?.name}</strong>
            <small>
              {period
                ? `${servicePeriodStatusLabel(period.status)} · ${servicePeriodTypeLabel(period.type)}`
                : "Cargando…"}
            </small>
          </div>
          {!isEditablePeriod ? (
            <p className="org-panel-note" role="status">
              Esta jornada ya no admite cambios de plazas.
            </p>
          ) : null}
          <label>
            Nombre de la plaza
            <input
              required
              minLength={2}
              maxLength={80}
              disabled={!isEditablePeriod}
              placeholder="Ej. Terraza norte"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <fieldset
            className="org-table-picker org-mode-picker"
            disabled={!isEditablePeriod}
          >
            <legend>Composición organizativa</legend>
            {(["FIXED", "VARIABLE"] as const).map((value) => (
              <label key={value}>
                <input
                  type="radio"
                  name="plaza-mode"
                  value={value}
                  checked={mode === value}
                  onChange={() => setMode(value)}
                />
                <span>
                  <strong>{plazaModeLabel(value)}</strong>
                  <small>
                    {value === "FIXED"
                      ? "Replica nombre y mesas en la próxima jornada; el mozo se vuelve a asignar."
                      : "Existe sólo durante esta jornada y se arma según la operación del día."}
                  </small>
                </span>
              </label>
            ))}
          </fieldset>
          <label>
            Salón físico
            <select
              required
              disabled={Boolean(id) || !isEditablePeriod}
              value={selectedSalonId}
              onChange={(event) => {
                setSelectedSalonId(event.target.value);
                setTableIds([]);
              }}
            >
              <option value="" disabled>
                Elegir salón
              </option>
              {salons
                .filter((salon) => salon.status === "ACTIVE")
                .map((salon) => (
                  <option key={salon.id} value={salon.id}>
                    {salon.name} · {salon.capacity} cubiertos máximos
                  </option>
                ))}
            </select>
            <small>
              La Plaza referencia mesas de un único salón y organiza el trabajo;
              no cambia su ubicación física ni limita permisos.
            </small>
          </label>
          <label>
            Mozo o responsable
            <select
              disabled={!isEditablePeriod}
              value={waiterEmploymentId}
              onChange={(event) => setWaiterEmploymentId(event.target.value)}
            >
              <option value="">Sin asignar todavía</option>
              {employments.map((employment) => {
                const user = userForEmployment(
                  usersQuery.data?.data ?? [],
                  employment,
                );
                return (
                  <option key={employment.id} value={employment.id}>
                    {user?.name ?? employment.personRef} ·{" "}
                    {employment.employeeCode}
                  </option>
                );
              })}
            </select>
            <small>
              Un mismo mozo puede ser responsable de varias Plazas en esta
              jornada.
            </small>
          </label>
          <fieldset className="org-table-picker" disabled={!isEditablePeriod}>
            <legend>Mesas agrupadas en esta plaza</legend>
            <p>
              Los cubiertos son la suma de capacidades de las mesas elegidas; no
              son entidades separadas.
            </p>
            {tables.map((table) => (
              <label key={table.id}>
                <input
                  type="checkbox"
                  checked={tableIds.includes(table.id)}
                  onChange={() => toggleTable(table.id)}
                />
                <span>{table.name || `Mesa ${table.number}`}</span>
                <small>{table.capacity} cubiertos</small>
              </label>
            ))}
            {selectedSalonId && tables.length === 0 ? (
              <p className="org-panel-note">
                Creá al menos una mesa en el salón antes de armar una plaza.
              </p>
            ) : null}
          </fieldset>
          <div className="org-plaza-summary" aria-live="polite">
            <strong>{tableIds.length} mesa(s)</strong>
            <span>
              {tables
                .filter((table) => tableIds.includes(table.id))
                .reduce((total, table) => total + table.capacity, 0)}{" "}
              cubiertos potenciales
            </span>
          </div>
          <PanelMutationFeedback mutation={mutation} />
          <button
            type="submit"
            disabled={
              mutation.isSaving ||
              !isEditablePeriod ||
              !selectedSalonId ||
              tableIds.length === 0
            }
          >
            {mutation.isSaving
              ? "Guardando…"
              : id
                ? "Guardar plaza"
                : "Crear plaza"}
          </button>
        </form>
      </StateView>
    </PanelFrame>
  );
}

interface RoleListItem {
  id: string;
  name: string;
}

function BranchEmployeesPanel({
  branchId,
  onSelect,
}: {
  branchId: string;
  onSelect: (node: OrganizationNode) => void;
}) {
  const { accessToken } = useAuth();
  const { selectedTenantId } = useTenantContext();
  const branchQuery = useTenantQuery<{ data: OrganizationBranch }>(
    `organization-parent-branch-${branchId}`,
    `/v1/branches/${branchId}`,
  );
  const employmentsQuery = useTenantQuery<{ data: BranchEmployment[] }>(
    `branch-employments-${branchId}`,
    `/v1/branches/${branchId}/employments`,
  );
  const usersQuery = useTenantQuery<{ data: OrganizationUser[] }>(
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
  const roles = rolesQuery.data?.data ?? [];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [roleId, setRoleId] = useState("role_employee");
  const [relationshipType, setRelationshipType] =
    useState<EmploymentRelationshipType>("EMPLOYEE");
  const [pendingUser, setPendingUser] = useState<OrganizationUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [mutationMessage, setMutationMessage] = useState<string | null>(null);

  useEffect(() => {
    if (roles.length > 0 && !roles.some((role) => role.id === roleId)) {
      setRoleId(roles[0]!.id);
    }
  }, [roleId, roles]);

  async function inviteAndAssign(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !selectedTenantId) return;
    setIsSaving(true);
    setMutationError(null);
    setMutationMessage(null);
    let invitedUser = pendingUser;
    try {
      if (!invitedUser) {
        const invitation = await apiRequest<{ data: OrganizationUser }>(
          "/v1/users",
          {
            accessToken,
            tenantId: selectedTenantId,
            method: "POST",
            body: { name, email, roleIds: [roleId] },
          },
        );
        invitedUser = invitation.data;
        setPendingUser(invitedUser);
      }
      await apiRequest("/v1/employments", {
        accessToken,
        tenantId: selectedTenantId,
        method: "POST",
        body: buildBranchEmploymentPayload({
          branchId,
          employeeCode,
          personRef: invitedUser.id,
          relationshipType,
          validFrom: new Date().toISOString(),
        }),
      });
      setPendingUser(null);
      setName("");
      setEmail("");
      setEmployeeCode("");
      setRelationshipType("EMPLOYEE");
      setMutationMessage("Empleado invitado y asignado correctamente.");
      await Promise.all([usersQuery.refetch(), employmentsQuery.refetch()]);
    } catch (caught) {
      setMutationError(
        pendingUser || invitedUser
          ? "La invitación fue creada, pero no se pudo asignar la sucursal. Reintentá la asignación."
          : caught instanceof Error
            ? caught.message
            : "No se pudo invitar al empleado",
      );
    } finally {
      setIsSaving(false);
    }
  }

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
        <div className="org-employee-management">
          <section
            className="org-employee-onboarding"
            aria-labelledby="employee-onboarding-heading"
          >
            <p className="org-kicker">Alta vinculada</p>
            <h3 id="employee-onboarding-heading">Invitar y asignar empleado</h3>
            <p>
              El acceso y la relación laboral quedan asociados a esta sucursal.
            </p>
            <form
              className="org-form"
              onSubmit={(event) => void inviteAndAssign(event)}
            >
              <label>
                Nombre
                <input
                  required
                  minLength={2}
                  value={name}
                  disabled={Boolean(pendingUser)}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={email}
                  disabled={Boolean(pendingUser)}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label>
                Código de empleado
                <input
                  required
                  minLength={2}
                  value={employeeCode}
                  onChange={(event) => setEmployeeCode(event.target.value)}
                />
              </label>
              <label>
                Perfil inicial
                <select
                  required
                  value={roleId}
                  disabled={Boolean(pendingUser)}
                  onChange={(event) => setRoleId(event.target.value)}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Relación
                <select
                  value={relationshipType}
                  onChange={(event) =>
                    setRelationshipType(
                      event.target.value as EmploymentRelationshipType,
                    )
                  }
                >
                  <option value="EMPLOYEE">Empleado</option>
                  <option value="CONTRACTOR">Contratista</option>
                  <option value="TEMPORARY">Temporal</option>
                </select>
              </label>
              {mutationError ? (
                <p className="login-error" role="alert">
                  {mutationError}
                </p>
              ) : null}
              {mutationMessage ? (
                <p className="org-form__success" role="status">
                  {mutationMessage}
                </p>
              ) : null}
              <button type="submit" disabled={isSaving || roles.length === 0}>
                {isSaving
                  ? "Guardando…"
                  : pendingUser
                    ? "Reintentar asignación"
                    : "Invitar y asignar"}
              </button>
            </form>
          </section>

          <section aria-labelledby="assigned-employees-heading">
            <h3 id="assigned-employees-heading">Equipo asignado</h3>
            {employments.length > 0 ? (
              <div
                className="org-employee-list"
                role="list"
                aria-label="Empleados asignados"
              >
                {employments.map((employment) => {
                  const user = userForEmployment(users, employment);
                  const roleNames =
                    user?.roleIds.map(
                      (userRoleId) =>
                        roles.find((role) => role.id === userRoleId)?.name ??
                        userRoleId,
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
                        <small>
                          {user?.email ?? employment.relationshipType}
                        </small>
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
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() =>
                          onSelect({
                            type: "employee",
                            id: employment.id,
                            parentId: branchId,
                          })
                        }
                      >
                        Editar persona
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="org-panel-empty">
                <span aria-hidden="true">○</span>
                <h3>No hay empleados asignados</h3>
                <p>
                  Las asignaciones de workforce para esta sucursal aparecerán
                  acá.
                </p>
              </div>
            )}
          </section>
        </div>
      </StateView>
    </PanelFrame>
  );
}

function EmployeeDetailPanel({
  id,
  branchId,
}: {
  id: string;
  branchId: string;
}) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const { selectedTenantId } = useTenantContext();
  const employmentQuery = useTenantQuery<{ data: BranchEmployment }>(
    `organization-employment-${id}`,
    `/v1/employments/${id}`,
  );
  const branchQuery = useTenantQuery<{ data: OrganizationBranch }>(
    `organization-parent-branch-${branchId}`,
    `/v1/branches/${branchId}`,
  );
  const usersQuery = useTenantQuery<{ data: OrganizationUser[] }>(
    "organization-users",
    "/v1/users",
  );
  const rolesQuery = useTenantQuery<{ data: RoleListItem[] }>(
    "organization-roles",
    "/v1/roles",
  );
  const employment = employmentQuery.data?.data;
  const linkedUser = employment
    ? userForEmployment(usersQuery.data?.data ?? [], employment)
    : null;
  const [employeeCode, setEmployeeCode] = useState("");
  const [relationshipType, setRelationshipType] =
    useState<EmploymentRelationshipType>("EMPLOYEE");
  const [employmentStatus, setEmploymentStatus] =
    useState<BranchEmployment["status"]>("ACTIVE");
  const [roleId, setRoleId] = useState("");
  const [membershipStatus, setMembershipStatus] = useState<
    "INVITED" | "ACTIVE" | "SUSPENDED" | "REVOKED"
  >("INVITED");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!employment || usersQuery.isLoading) return;
    setEmployeeCode(employment.employeeCode);
    setRelationshipType(employment.relationshipType);
    setEmploymentStatus(employment.status);
    if (linkedUser) {
      setRoleId(linkedUser.roleIds[0] ?? "");
      setMembershipStatus(editableMembershipStatus(linkedUser.status));
    }
    setIsHydrated(true);
  }, [employment, linkedUser, usersQuery.isLoading]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !selectedTenantId) return;
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updates: Promise<unknown>[] = [
        apiRequest(`/v1/employments/${id}`, {
          accessToken,
          tenantId: selectedTenantId,
          method: "PATCH",
          body: {
            employeeCode,
            relationshipType,
            status: employmentStatus,
          },
        }),
      ];
      if (linkedUser) {
        updates.push(
          apiRequest(`/v1/users/${linkedUser.id}`, {
            accessToken,
            tenantId: selectedTenantId,
            method: "PATCH",
            body: {
              roleIds: [roleId],
              ...(membershipStatus !== "INVITED" ? { membershipStatus } : {}),
            },
          }),
        );
      }
      await Promise.all(updates);
      await Promise.all([
        employmentQuery.refetch(),
        usersQuery.refetch(),
        rolesQuery.refetch(),
        queryClient.invalidateQueries({
          queryKey: [`branch-employments-${branchId}`, selectedTenantId],
        }),
      ]);
      setMessage("Persona y relación laboral actualizadas correctamente.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo actualizar la persona",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PanelFrame
      kicker="Nivel 04 / Persona"
      title={
        linkedUser?.name ?? employment?.personRef ?? "Detalle de integrante"
      }
      subtitle={`Equipo de ${branchQuery.data?.data.name ?? "la sucursal"}`}
    >
      <StateView
        isLoading={
          employmentQuery.isLoading ||
          branchQuery.isLoading ||
          usersQuery.isLoading ||
          rolesQuery.isLoading ||
          !isHydrated
        }
        error={
          (employmentQuery.error ??
            branchQuery.error ??
            usersQuery.error ??
            rolesQuery.error) as Error | null
        }
        onRetry={() =>
          void Promise.all([
            employmentQuery.refetch(),
            branchQuery.refetch(),
            usersQuery.refetch(),
            rolesQuery.refetch(),
          ])
        }
      >
        <form
          className="org-form org-form--employee"
          onSubmit={(event) => void save(event)}
        >
          <fieldset>
            <legend>Acceso al tenant</legend>
            {linkedUser ? (
              <>
                <label>
                  Nombre
                  <input readOnly value={linkedUser.name} />
                </label>
                <label>
                  Email
                  <input readOnly value={linkedUser.email ?? "Sin email"} />
                </label>
                <label>
                  Perfil operativo
                  <select
                    required
                    value={roleId}
                    onChange={(event) => setRoleId(event.target.value)}
                  >
                    <option value="" disabled>
                      Elegir perfil
                    </option>
                    {(rolesQuery.data?.data ?? []).map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Estado de acceso
                  <select
                    value={membershipStatus}
                    onChange={(event) =>
                      setMembershipStatus(
                        event.target.value as typeof membershipStatus,
                      )
                    }
                  >
                    {membershipStatus === "INVITED" ? (
                      <option value="INVITED">Invitación pendiente</option>
                    ) : null}
                    <option value="ACTIVE">Activo</option>
                    <option value="SUSPENDED">Suspendido</option>
                    <option value="REVOKED">Revocado</option>
                  </select>
                </label>
              </>
            ) : (
              <p className="org-panel-note">
                Esta relación laboral no tiene un usuario vinculable. Podés
                editar sus datos laborales, pero no su acceso.
              </p>
            )}
          </fieldset>
          <fieldset>
            <legend>Relación laboral</legend>
            <label>
              Código de empleado
              <input
                required
                minLength={2}
                value={employeeCode}
                onChange={(event) => setEmployeeCode(event.target.value)}
              />
            </label>
            <label>
              Tipo de relación
              <select
                value={relationshipType}
                onChange={(event) =>
                  setRelationshipType(
                    event.target.value as EmploymentRelationshipType,
                  )
                }
              >
                <option value="EMPLOYEE">Empleado</option>
                <option value="CONTRACTOR">Contratista</option>
                <option value="TEMPORARY">Temporal</option>
              </select>
            </label>
            <label>
              Estado laboral
              <select
                value={employmentStatus}
                onChange={(event) =>
                  setEmploymentStatus(
                    event.target.value as BranchEmployment["status"],
                  )
                }
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
                <option value="TERMINATED">Finalizado</option>
              </select>
            </label>
          </fieldset>
          {error ? (
            <p role="alert" className="login-error">
              {error}
            </p>
          ) : null}
          {message ? (
            <p role="status" className="org-form__success">
              {message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isSaving || (Boolean(linkedUser) && !roleId)}
          >
            {isSaving ? "Guardando…" : "Guardar persona"}
          </button>
        </form>
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
