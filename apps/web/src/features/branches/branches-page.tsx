import { useEffect, useState, type FormEvent } from "react";
import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { StateView } from "../../components/state-view.js";
import { apiRequest } from "../../lib/api-client.js";
import { useAuth } from "../../app/auth-context.js";
import { useTenantContext } from "../../app/tenant-context.js";

interface Branch {
  id: string;
  name: string;
  code: string;
  status: string;
  timezone: string;
}

interface BrandOption { id: string; name: string }
interface Salon { id: string; branchId: string; name: string; capacity: number; description?: string; status: "ACTIVE" | "INACTIVE" }

export function BranchesPage() {
  const { accessToken } = useAuth();
  const { selectedTenantId } = useTenantContext();
  const { data, isLoading, error, refetch } = useTenantQuery<{ data: Branch[] }>(
    "branches",
    "/v1/branches",
  );
  const branches = data?.data ?? [];
  const { data: brandsData } = useTenantQuery<{ data: BrandOption[] }>("brands-for-branches", "/v1/brands");
  const brands = brandsData?.data ?? [];
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const { data: salonsData, refetch: refetchSalons } = useTenantQuery<{ data: Salon[] }>(
    `salons-${selectedBranchId}`,
    `/v1/salons?branchId=${encodeURIComponent(selectedBranchId)}`,
    { enabled: Boolean(accessToken && selectedTenantId && selectedBranchId) },
  );
  const salons = salonsData?.data ?? [];
  const [brandId, setBrandId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [timezone, setTimezone] = useState("America/Argentina/Buenos_Aires");
  const [salonName, setSalonName] = useState("");
  const [salonCapacity, setSalonCapacity] = useState(40);
  const [isSaving, setIsSaving] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandId && brands[0]) setBrandId(brands[0].id);
  }, [brandId, brands]);

  useEffect(() => {
    if (!selectedBranchId && branches[0]) setSelectedBranchId(branches[0].id);
  }, [branches, selectedBranchId]);
  const activeBranches = branches.filter((branch) => isBranchActive(branch.status));
  const inactiveBranches = branches.filter((branch) => !isBranchActive(branch.status));
  const uniqueTimezones = new Set(branches.map((branch) => branch.timezone));
  const summary = getBranchesSummary(branches.length, activeBranches.length, inactiveBranches.length);
  const checklist = [
    { label: "Al menos una sucursal creada", done: branches.length > 0 },
    { label: "Código visible por sucursal", done: branches.every((branch) => branch.code.trim().length > 0) && branches.length > 0 },
    { label: "Zona horaria definida", done: branches.every((branch) => branch.timezone.trim().length > 0) && branches.length > 0 },
    { label: "Sucursal operable", done: activeBranches.length > 0 },
  ];

  async function mutate(path: string, method: "POST" | "PATCH" | "DELETE", body?: unknown) {
    if (!accessToken || !selectedTenantId) return;
    setMutationError(null);
    setIsSaving(true);
    try {
      await apiRequest(path, { accessToken, tenantId: selectedTenantId, method, ...(body !== undefined ? { body } : {}) });
      await refetch();
      if (selectedBranchId) await refetchSalons();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "No se pudo guardar el cambio");
      throw err;
    } finally {
      setIsSaving(false);
    }
  }

  async function createBranch(e: FormEvent) {
    e.preventDefault();
    try {
      await mutate("/v1/branches", "POST", { brandId, name, code, timezone });
      setName("");
      setCode("");
    } catch { /* error is displayed by mutate */ }
  }

  async function createSalon(e: FormEvent) {
    e.preventDefault();
    try {
      await mutate("/v1/salons", "POST", { branchId: selectedBranchId, name: salonName, capacity: salonCapacity });
      setSalonName("");
    } catch { /* error is displayed by mutate */ }
  }

  return (
    <section aria-labelledby="branches-heading" className="overview-page">
      <h1 id="branches-heading">Sucursales</h1>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        onRetry={() => void refetch()}
      >
        <>
          <article className="overview-card">
            <h2>Nueva sucursal</h2>
            {brands.length > 0 ? (
              <form className="user-management-form" onSubmit={createBranch}>
                <label>Marca<select required value={brandId} onChange={(event) => setBrandId(event.target.value)}>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label>
                <label>Nombre<input required value={name} onChange={(event) => setName(event.target.value)} /></label>
                <label>Código<input required value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} /></label>
                <label>Zona horaria<input required value={timezone} onChange={(event) => setTimezone(event.target.value)} /></label>
                <button type="submit" disabled={isSaving}>Crear sucursal</button>
              </form>
            ) : <p>Primero necesitás crear una marca.</p>}
            {mutationError ? <p role="alert" className="login-error">{mutationError}</p> : null}
          </article>
        {branches.length > 0 ? (
          <>
            <article className={`overview-priority overview-priority--${summary.tone}`}>
              <div className="overview-priority__copy">
                <span className="overview-priority__eyebrow">Estado de sedes</span>
                <strong>{summary.title}</strong>
                <p>{summary.message}</p>
              </div>
            </article>

            <dl className="kpi-grid">
              <div>
                <dt>Sucursales</dt>
                <dd>{branches.length}</dd>
              </div>
              <div>
                <dt>Activas</dt>
                <dd>{activeBranches.length}</dd>
              </div>
              <div>
                <dt>A revisar</dt>
                <dd>{inactiveBranches.length}</dd>
              </div>
              <div>
                <dt>Zonas horarias</dt>
                <dd>{uniqueTimezones.size}</dd>
              </div>
            </dl>

            <article className="overview-card">
              <h2>Checklist operacional</h2>
              <div className="overview-checklist">
                {checklist.map((step) => (
                  <div key={step.label} className={`overview-check ${step.done ? "overview-check--done" : ""}`}>
                    <strong>{step.done ? "✓" : "•"}</strong>
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
            </article>

            <section className="profile-module-grid" aria-label="Resumen de sucursales">
              {branches.map((branch) => {
                const status = describeBranchStatus(branch.status);
                return (
                  <article key={branch.id} className="profile-card">
                    <p className="profile-eyebrow">{status.label}</p>
                    <h2>{branch.name}</h2>
                    <p>
                      Código <strong>{branch.code}</strong>
                    </p>
                    <p>
                      Zona horaria <strong>{branch.timezone}</strong>
                    </p>
                    <p>{status.message}</p>
                  </article>
                );
              })}
            </section>

            <article className="overview-card">
              <h2>Detalle tabular</h2>
              <table>
                <caption className="sr-only">Listado de sucursales</caption>
                <thead>
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Código</th>
                    <th scope="col">Zona horaria</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Gestionar</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((branch) => (
                    <tr key={branch.id}>
                      <td>{branch.name}</td>
                      <td>{branch.code}</td>
                      <td>{branch.timezone}</td>
                      <td>{branch.status}</td>
                      <td><select value={isBranchActive(branch.status) ? "ACTIVE" : "INACTIVE"} disabled={isSaving} onChange={(event) => void mutate(`/v1/branches/${branch.id}`, "PATCH", { status: event.target.value }).catch(() => undefined)}><option value="ACTIVE">Activa</option><option value="INACTIVE">Inactiva</option></select></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          </>
        ) : <article className="overview-priority overview-priority--warning"><div className="overview-priority__copy"><strong>Todavía no hay sucursales</strong><p>Creá una para habilitar salones y operación.</p></div></article>}

          <article className="overview-card">
            <h2>Salones</h2>
            {branches.length > 0 ? (
              <>
                <label className="organization-selector">Sucursal<select value={selectedBranchId} onChange={(event) => setSelectedBranchId(event.target.value)}>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
                <form className="user-management-form" onSubmit={createSalon}>
                  <label>Nombre<input required value={salonName} onChange={(event) => setSalonName(event.target.value)} /></label>
                  <label>Capacidad<input required type="number" min={1} value={salonCapacity} onChange={(event) => setSalonCapacity(Number(event.target.value))} /></label>
                  <button type="submit" disabled={isSaving}>Crear salón</button>
                </form>
                <div className="profile-module-grid organization-list">
                  {salons.map((salon) => (
                    <article className="profile-card" key={salon.id}>
                      <label>Nombre<input defaultValue={salon.name} onBlur={(event) => { const nextName = event.target.value.trim(); if (nextName && nextName !== salon.name) void mutate(`/v1/salons/${salon.id}`, "PATCH", { name: nextName }).catch(() => undefined); }} /></label>
                      <label>Capacidad<input type="number" min={1} defaultValue={salon.capacity} onBlur={(event) => { const capacity = Number(event.target.value); if (capacity !== salon.capacity) void mutate(`/v1/salons/${salon.id}`, "PATCH", { capacity }).catch(() => undefined); }} /></label>
                      <label>Estado<select value={salon.status} onChange={(event) => void mutate(`/v1/salons/${salon.id}`, "PATCH", { status: event.target.value }).catch(() => undefined)}><option value="ACTIVE">Activo</option><option value="INACTIVE">Inactivo</option></select></label>
                      {salon.status === "ACTIVE" ? <button type="button" disabled={isSaving} onClick={() => void mutate(`/v1/salons/${salon.id}`, "DELETE").catch(() => undefined)}>Desactivar salón</button> : null}
                    </article>
                  ))}
                  {salons.length === 0 ? <p>No hay salones en esta sucursal.</p> : null}
                </div>
              </>
            ) : <p>Creá una sucursal antes de administrar salones.</p>}
          </article>
        </>
      </StateView>
    </section>
  );
}

function normalizeBranchStatus(status: string) {
  return status.trim().toUpperCase();
}

function isBranchActive(status: string) {
  const normalized = normalizeBranchStatus(status);
  return normalized === "ACTIVE" || normalized === "OPEN" || normalized === "ENABLED";
}

function describeBranchStatus(status: string) {
  if (isBranchActive(status)) {
    return {
      label: "Operable",
      message: "La sucursal aparece en estado apto para formar parte del circuito operativo visible.",
    };
  }

  return {
    label: "Revisar habilitación",
    message: "Conviene validar setup, publicación o disponibilidad antes de tomarla como sede operativa.",
  };
}

function getBranchesSummary(total: number, active: number, inactive: number) {
  if (total === 0) {
    return {
      tone: "warning" as const,
      title: "Faltan sucursales para operar",
      message: "Sin al menos una sede cargada no hay base real para reservas, floor, host ni operación diaria.",
    };
  }

  if (active === 0) {
    return {
      tone: "warning" as const,
      title: "Hay sucursales creadas, pero ninguna activa",
      message: "La estructura existe, aunque todavía no se ve una sede plenamente lista para operar.",
    };
  }

  if (inactive > 0) {
    return {
      tone: "info" as const,
      title: "Red de sucursales visible con pendientes",
      message: `Hay ${inactive} sucursal(es) para revisar antes de considerarlas operativas en todos los flujos.`,
    };
  }

  return {
    tone: "success" as const,
    title: "Estructura de sucursales lista",
    message: "Las sedes visibles ya muestran base suficiente para seguir afinando experiencia pública y operación interna.",
  };
}
