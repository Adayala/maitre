import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../app/auth-context.js";
import { useTenantContext } from "../../app/tenant-context.js";
import { StateView } from "../../components/state-view.js";
import { apiDownload, apiRequest } from "../../lib/api-client.js";
import { useTenantQuery } from "../../lib/use-tenant-query.js";

type FiscalStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
type TaxCondition = "RI" | "MONOTRIBUTISTA" | "EXENTO";
type RegistrationStatus = "DECLARED" | "VERIFIED" | "REJECTED" | "INACTIVE";

interface FiscalEntity {
  id: string;
  cuit: string;
  legalName?: string;
  displayName?: string;
  name: string;
  status: FiscalStatus;
  taxCondition: TaxCondition;
  legalAddress?: string;
  fiscalAddress?: string;
  activityCode?: string;
  certificate?: { validTo: string };
  updatedAt: string;
}

interface Branch {
  id: string;
  name: string;
  code: string;
  status: string;
  fiscalEntityId?: string;
}

interface PointOfSale {
  id: string;
  fiscalEntityId: string;
  branchId?: string;
  environment: "HOMOLOGATION" | "PRODUCTION";
  officialCode: string;
  arcaDomicileCode?: string;
  arcaDomicileLabel?: string;
  issuingSystem?: string;
  registrationStatus?: RegistrationStatus;
  registrationEvidenceRef?: string;
  allowedVoucherTypes: string[];
  status: "ACTIVE" | "INACTIVE";
}

interface Subscription {
  id: string;
  subscriberFiscalEntityId?: string;
}

interface Invoice {
  id: string;
  voucherType: string;
  number?: number;
  status: "DRAFT" | "VALIDATED" | "AUTHORIZED" | "REJECTED" | "PENDING_RECONCILIATION" | "VOIDED_DRAFT";
  currency: string;
  totals: { grossMinorUnits: number };
  authorizedAt?: string;
}

const voucherTypes = [
  "FACTURA_A",
  "FACTURA_B",
  "FACTURA_C",
  "NOTA_CREDITO_A",
  "NOTA_CREDITO_B",
  "NOTA_CREDITO_C",
  "NOTA_DEBITO_A",
  "NOTA_DEBITO_B",
  "NOTA_DEBITO_C",
] as const;

export function FiscalSettingsPage() {
  const { accessToken } = useAuth();
  const { selectedTenantId } = useTenantContext();
  const queryClient = useQueryClient();
  const entitiesQuery = useTenantQuery<{ data: FiscalEntity[] }>(
    "fiscal-entities",
    "/v1/fiscal-entities?limit=100",
  );
  const branchesQuery = useTenantQuery<{ data: Branch[] }>(
    "branches-for-fiscal",
    "/v1/branches?limit=100",
  );
  const subscriptionQuery = useQuery({
    queryKey: ["subscription-fiscal-owner", selectedTenantId],
    queryFn: () =>
      apiRequest<{ data: Subscription }>(`/v1/subscriptions/${selectedTenantId}`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
      }),
    enabled: Boolean(accessToken && selectedTenantId),
  });

  const entities = entitiesQuery.data?.data ?? [];
  const branches = branchesQuery.data?.data ?? [];
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const selectedEntity = entities.find((entity) => entity.id === selectedEntityId);
  const pointsQuery = useQuery({
    queryKey: ["fiscal-points-of-sale", selectedTenantId, selectedEntityId],
    queryFn: () =>
      apiRequest<{ data: PointOfSale[] }>(
        `/v1/fiscal-points-of-sale?fiscalEntityId=${encodeURIComponent(selectedEntityId)}`,
        { accessToken: accessToken!, tenantId: selectedTenantId! },
      ),
    enabled: Boolean(accessToken && selectedTenantId && selectedEntityId),
  });
  const points = pointsQuery.data?.data ?? [];
  const invoicesQuery = useQuery({
    queryKey: ["fiscal-invoices", selectedTenantId, selectedEntityId],
    queryFn: () =>
      apiRequest<{ data: Invoice[] }>(
        `/v1/invoices?fiscalEntityId=${encodeURIComponent(selectedEntityId)}`,
        { accessToken: accessToken!, tenantId: selectedTenantId! },
      ),
    enabled: Boolean(accessToken && selectedTenantId && selectedEntityId),
  });
  const invoices = invoicesQuery.data?.data ?? [];

  const [createForm, setCreateForm] = useState({
    legalName: "",
    displayName: "",
    cuit: "",
    taxCondition: "RI" as TaxCondition,
  });
  const [editForm, setEditForm] = useState({
    legalName: "",
    displayName: "",
    legalAddress: "",
    fiscalAddress: "",
    activityCode: "",
    taxCondition: "RI" as TaxCondition,
    status: "ACTIVE" as FiscalStatus,
    reason: "",
  });
  const [posForm, setPosForm] = useState({
    branchId: "",
    environment: "HOMOLOGATION" as "HOMOLOGATION" | "PRODUCTION",
    officialCode: "0001",
    arcaDomicileCode: "",
    arcaDomicileLabel: "",
  });
  const [ownerReason, setOwnerReason] = useState("Asignación de titular fiscal");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedEntityId && entities[0]) setSelectedEntityId(entities[0].id);
  }, [entities, selectedEntityId]);

  useEffect(() => {
    if (!selectedEntity) return;
    setEditForm({
      legalName: selectedEntity.legalName ?? selectedEntity.name,
      displayName: selectedEntity.displayName ?? "",
      legalAddress: selectedEntity.legalAddress ?? "",
      fiscalAddress: selectedEntity.fiscalAddress ?? "",
      activityCode: selectedEntity.activityCode ?? "",
      taxCondition: selectedEntity.taxCondition,
      status: selectedEntity.status,
      reason: "",
    });
  }, [selectedEntity]);

  useEffect(() => {
    const eligible = branches.find(
      (branch) => !branch.fiscalEntityId || branch.fiscalEntityId === selectedEntityId,
    );
    if (eligible && !branches.some((branch) => branch.id === posForm.branchId)) {
      setPosForm((current) => ({ ...current, branchId: eligible.id }));
    }
  }, [branches, posForm.branchId, selectedEntityId]);

  const ownerId = subscriptionQuery.data?.data.subscriberFiscalEntityId;
  const owner = entities.find((entity) => entity.id === ownerId);
  const readiness = useMemo(() => {
    const activeBranches = branches.filter(
      (branch) => branch.fiscalEntityId === selectedEntityId && branch.status === "ACTIVE",
    );
    return {
      identity: Boolean(selectedEntity?.legalName && selectedEntity.cuit),
      owner: ownerId === selectedEntityId,
      branch: activeBranches.length > 0,
      homologation: points.some((point) => point.environment === "HOMOLOGATION"),
      production: points.some(
        (point) =>
          point.environment === "PRODUCTION" &&
          point.status === "ACTIVE" &&
          point.registrationStatus === "VERIFIED",
      ),
    };
  }, [branches, ownerId, points, selectedEntity]);

  async function mutate<T>(action: () => Promise<T>, success: string) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await action();
      setMessage(success);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["fiscal-entities", selectedTenantId] }),
        queryClient.invalidateQueries({ queryKey: ["branches-for-fiscal", selectedTenantId] }),
        queryClient.invalidateQueries({ queryKey: ["subscription-fiscal-owner", selectedTenantId] }),
        queryClient.invalidateQueries({ queryKey: ["fiscal-points-of-sale", selectedTenantId] }),
      ]);
      return result;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar el cambio");
      return undefined;
    } finally {
      setBusy(false);
    }
  }

  async function createEntity(event: FormEvent) {
    event.preventDefault();
    const response = await mutate(
      () =>
        apiRequest<{ data: FiscalEntity }>("/v1/fiscal-entities", {
          accessToken: accessToken!,
          tenantId: selectedTenantId!,
          method: "POST",
          body: {
            ...createForm,
            cuit: createForm.cuit.replace(/\D/g, ""),
            ...(createForm.displayName ? {} : { displayName: undefined }),
          },
        }),
      "Entidad fiscal creada.",
    );
    if (response) {
      setSelectedEntityId(response.data.id);
      setCreateForm({ legalName: "", displayName: "", cuit: "", taxCondition: "RI" });
    }
  }

  async function updateEntity(event: FormEvent) {
    event.preventDefault();
    if (!selectedEntity) return;
    await mutate(
      () =>
        apiRequest(`/v1/fiscal-entities/${selectedEntity.id}`, {
          accessToken: accessToken!,
          tenantId: selectedTenantId!,
          method: "PATCH",
          headers: {
            "If-Match": String(new Date(selectedEntity.updatedAt).getTime()),
            "X-Step-Up-At": new Date().toISOString(),
          },
          body: {
            ...editForm,
            displayName: editForm.displayName || undefined,
            legalAddress: editForm.legalAddress || undefined,
            fiscalAddress: editForm.fiscalAddress || undefined,
            activityCode: editForm.activityCode || undefined,
            reason: editForm.reason || "Actualización de identidad fiscal desde Maitre Dash",
          },
        }),
      "Datos fiscales actualizados y auditados.",
    );
  }

  async function assignOwner() {
    if (!selectedEntity) return;
    await mutate(
      () =>
        apiRequest("/v1/subscriptions/fiscal-owner", {
          accessToken: accessToken!,
          tenantId: selectedTenantId!,
          method: "PATCH",
          body: {
            subscriberFiscalEntityId: selectedEntity.id,
            reason: ownerReason,
          },
        }),
      "Titular fiscal de la suscripción actualizado.",
    );
  }

  async function assignBranch(branch: Branch, fiscalEntityId: string | null) {
    await mutate(
      () =>
        apiRequest(`/v1/branches/${branch.id}`, {
          accessToken: accessToken!,
          tenantId: selectedTenantId!,
          method: "PATCH",
          body: { fiscalEntityId },
        }),
      fiscalEntityId ? "Sucursal asociada a la entidad fiscal." : "Asociación fiscal removida.",
    );
  }

  async function createPointOfSale(event: FormEvent) {
    event.preventDefault();
    if (!selectedEntity) return;
    await mutate(
      () =>
        apiRequest("/v1/fiscal-points-of-sale", {
          accessToken: accessToken!,
          tenantId: selectedTenantId!,
          method: "POST",
          body: {
            fiscalEntityId: selectedEntity.id,
            ...posForm,
            issuingSystem: "WSFEV1",
            allowedVoucherTypes: [...voucherTypes],
          },
        }),
      "Punto de venta declarado.",
    );
  }

  async function updateRegistration(
    point: PointOfSale,
    status: RegistrationStatus,
  ) {
    const evidenceRef =
      status === "VERIFIED"
        ? window.prompt("Referencia de evidencia ARCA (obligatoria)")
        : undefined;
    if (status === "VERIFIED" && !evidenceRef) return;
    const rejectionReason =
      status === "REJECTED" ? window.prompt("Motivo del rechazo") ?? undefined : undefined;
    await mutate(
      () =>
        apiRequest(`/v1/fiscal-points-of-sale/${point.id}/registration`, {
          accessToken: accessToken!,
          tenantId: selectedTenantId!,
          method: "POST",
          body: { status, evidenceRef, rejectionReason },
        }),
      `Registro del punto ${point.officialCode} actualizado.`,
    );
  }

  async function downloadInvoice(invoice: Invoice) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const { blob, fileName } = await apiDownload(
        `/v1/invoices/${invoice.id}/document?format=pdf`,
        { accessToken: accessToken!, tenantId: selectedTenantId! },
      );
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = fileName;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(href), 0);
      setMessage(`Comprobante ${invoiceLabel(invoice)} descargado.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo descargar el comprobante");
    } finally {
      setBusy(false);
    }
  }

  const loading =
    entitiesQuery.isLoading || branchesQuery.isLoading || subscriptionQuery.isLoading;
  const queryError =
    entitiesQuery.error ?? branchesQuery.error ?? subscriptionQuery.error;

  return (
    <section aria-labelledby="fiscal-heading" className="overview-page fiscal-control">
      <header className="fiscal-hero">
        <div>
          <p className="fiscal-kicker">ARCA · IDENTIDAD · EMISIÓN</p>
          <h1 id="fiscal-heading">Control fiscal</h1>
          <p>
            Administrá quién factura, desde qué sucursal y con qué punto de venta.
            Los secretos nunca se muestran en esta pantalla.
          </p>
        </div>
        <div className="fiscal-hero__stamp" aria-label="Ambiente seguro">
          <span>PRODUCCIÓN</span>
          <strong>FAIL CLOSED</strong>
        </div>
      </header>

      <StateView isLoading={loading} error={queryError as Error | null}>
        <>
          {message ? <p className="fiscal-notice" role="status">{message}</p> : null}
          {error ? <p className="login-error" role="alert">{error}</p> : null}

          <section className="fiscal-readiness" aria-label="Preparación fiscal">
            {Object.entries(readiness).map(([key, done], index) => (
              <div key={key} className={done ? "is-ready" : ""}>
                <span>0{index + 1}</span>
                <strong>{readinessLabel(key)}</strong>
                <small>{done ? "Listo" : "Pendiente"}</small>
              </div>
            ))}
          </section>

          <div className="fiscal-layout">
            <aside className="fiscal-rail" aria-label="Entidades fiscales">
              <div className="fiscal-section-heading">
                <p>01 / Identidad</p>
                <h2>Entidades</h2>
              </div>
              {entities.map((entity) => (
                <button
                  type="button"
                  key={entity.id}
                  className={entity.id === selectedEntityId ? "is-selected" : ""}
                  onClick={() => setSelectedEntityId(entity.id)}
                >
                  <span>{entity.status}</span>
                  <strong>{entity.legalName ?? entity.name}</strong>
                  <small>{formatCuit(entity.cuit)} · {entity.taxCondition}</small>
                </button>
              ))}
              <details>
                <summary>Nueva entidad fiscal</summary>
                <form className="fiscal-form" onSubmit={createEntity}>
                  <label>Razón social<input required minLength={3} value={createForm.legalName} onChange={(event) => setCreateForm({ ...createForm, legalName: event.target.value })} /></label>
                  <label>Nombre comercial<input value={createForm.displayName} onChange={(event) => setCreateForm({ ...createForm, displayName: event.target.value })} /></label>
                  <label>CUIT<input required inputMode="numeric" placeholder="11 dígitos" value={createForm.cuit} onChange={(event) => setCreateForm({ ...createForm, cuit: event.target.value })} /></label>
                  <label>Condición<select value={createForm.taxCondition} onChange={(event) => setCreateForm({ ...createForm, taxCondition: event.target.value as TaxCondition })}><option value="RI">Responsable inscripto</option><option value="MONOTRIBUTISTA">Monotributista</option><option value="EXENTO">Exento</option></select></label>
                  <button disabled={busy}>Crear entidad</button>
                </form>
              </details>
            </aside>

            <div className="fiscal-workbench">
              {selectedEntity ? (
                <>
                  <article className="overview-card fiscal-identity-card">
                    <div className="fiscal-section-heading">
                      <p>02 / Perfil registral</p>
                      <h2>{selectedEntity.legalName ?? selectedEntity.name}</h2>
                    </div>
                    <form className="fiscal-form fiscal-form--grid" onSubmit={updateEntity}>
                      <label>Razón social<input required value={editForm.legalName} onChange={(event) => setEditForm({ ...editForm, legalName: event.target.value })} /></label>
                      <label>Nombre comercial<input value={editForm.displayName} onChange={(event) => setEditForm({ ...editForm, displayName: event.target.value })} /></label>
                      <label>CUIT<input disabled value={formatCuit(selectedEntity.cuit)} /></label>
                      <label>Condición<select value={editForm.taxCondition} onChange={(event) => setEditForm({ ...editForm, taxCondition: event.target.value as TaxCondition })}><option value="RI">Responsable inscripto</option><option value="MONOTRIBUTISTA">Monotributista</option><option value="EXENTO">Exento</option></select></label>
                      <label>Domicilio legal<input value={editForm.legalAddress} onChange={(event) => setEditForm({ ...editForm, legalAddress: event.target.value })} /></label>
                      <label>Domicilio fiscal<input value={editForm.fiscalAddress} onChange={(event) => setEditForm({ ...editForm, fiscalAddress: event.target.value })} /></label>
                      <label>Actividad<input value={editForm.activityCode} onChange={(event) => setEditForm({ ...editForm, activityCode: event.target.value })} /></label>
                      <label>Estado<select value={editForm.status} onChange={(event) => setEditForm({ ...editForm, status: event.target.value as FiscalStatus })}><option value="ACTIVE">Activa</option><option value="INACTIVE">Inactiva</option><option value="ARCHIVED">Archivada</option></select></label>
                      <label className="fiscal-form__wide">Motivo del cambio<input value={editForm.reason} onChange={(event) => setEditForm({ ...editForm, reason: event.target.value })} placeholder="Obligatorio para cambios sensibles" /></label>
                      <button disabled={busy}>Guardar perfil fiscal</button>
                    </form>
                  </article>

                  <div className="fiscal-two-up">
                    <article className="overview-card">
                      <div className="fiscal-section-heading"><p>03 / Propiedad</p><h2>Suscripción</h2></div>
                      <p>El titular comercial actual es <strong>{owner ? owner.legalName ?? owner.name : "ninguno"}</strong>.</p>
                      <label className="fiscal-field">Motivo<input value={ownerReason} onChange={(event) => setOwnerReason(event.target.value)} /></label>
                      <button type="button" disabled={busy || ownerId === selectedEntity.id} onClick={() => void assignOwner()}>
                        {ownerId === selectedEntity.id ? "Es el titular actual" : "Asignar como titular"}
                      </button>
                    </article>

                    <article className="overview-card">
                      <div className="fiscal-section-heading"><p>04 / Territorio</p><h2>Sucursales</h2></div>
                      <div className="fiscal-branch-list">
                        {branches.map((branch) => (
                          <label key={branch.id}>
                            <span><strong>{branch.name}</strong><small>{branch.code} · {branch.status}</small></span>
                            <input type="checkbox" checked={branch.fiscalEntityId === selectedEntity.id} disabled={busy || Boolean(branch.fiscalEntityId && branch.fiscalEntityId !== selectedEntity.id)} onChange={(event) => void assignBranch(branch, event.target.checked ? selectedEntity.id : null)} />
                          </label>
                        ))}
                      </div>
                    </article>
                  </div>

                  <article className="overview-card">
                    <div className="fiscal-section-heading"><p>05 / ARCA</p><h2>Puntos de venta</h2></div>
                    <div className="fiscal-pos-grid">
                      {points.map((point) => (
                        <article key={point.id} className="fiscal-pos">
                          <header><strong>PV {point.officialCode}</strong><span className={`fiscal-badge fiscal-badge--${(point.registrationStatus ?? "DECLARED").toLowerCase()}`}>{point.registrationStatus ?? "DECLARED"}</span></header>
                          <dl><div><dt>Ambiente</dt><dd>{point.environment}</dd></div><div><dt>Sistema</dt><dd>{point.issuingSystem ?? "WSFEV1"}</dd></div><div><dt>Domicilio</dt><dd>{point.arcaDomicileCode ?? "Sin declarar"}</dd></div><div><dt>Estado</dt><dd>{point.status}</dd></div></dl>
                          <label>Registro<select value={point.registrationStatus ?? "DECLARED"} disabled={busy} onChange={(event) => void updateRegistration(point, event.target.value as RegistrationStatus)}><option value="DECLARED">Declarado</option><option value="VERIFIED">Verificado</option><option value="REJECTED">Rechazado</option><option value="INACTIVE">Inactivo</option></select></label>
                          {point.status === "ACTIVE" ? <button className="button-secondary" type="button" disabled={busy} onClick={() => void mutate(() => apiRequest(`/v1/fiscal-points-of-sale/${point.id}/deactivate`, { accessToken: accessToken!, tenantId: selectedTenantId!, method: "POST" }), "Punto de venta desactivado.")}>Desactivar</button> : null}
                        </article>
                      ))}
                    </div>
                    <details>
                      <summary>Declarar nuevo punto de venta</summary>
                      <form className="fiscal-form fiscal-form--grid" onSubmit={createPointOfSale}>
                        <label>Sucursal<select required value={posForm.branchId} onChange={(event) => setPosForm({ ...posForm, branchId: event.target.value })}><option value="">Elegir</option>{branches.filter((branch) => branch.fiscalEntityId === selectedEntity.id).map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
                        <label>Ambiente<select value={posForm.environment} onChange={(event) => setPosForm({ ...posForm, environment: event.target.value as typeof posForm.environment })}><option value="HOMOLOGATION">Homologación</option><option value="PRODUCTION">Producción</option></select></label>
                        <label>Código oficial<input required pattern="[0-9]{1,5}" value={posForm.officialCode} onChange={(event) => setPosForm({ ...posForm, officialCode: event.target.value })} /></label>
                        <label>Código domicilio ARCA<input required value={posForm.arcaDomicileCode} onChange={(event) => setPosForm({ ...posForm, arcaDomicileCode: event.target.value })} /></label>
                        <label className="fiscal-form__wide">Etiqueta del domicilio<input value={posForm.arcaDomicileLabel} onChange={(event) => setPosForm({ ...posForm, arcaDomicileLabel: event.target.value })} /></label>
                        <button disabled={busy || !posForm.branchId}>Declarar punto</button>
                      </form>
                    </details>
                  </article>

                  <article className="overview-card fiscal-documents">
                    <div className="fiscal-section-heading"><p>06 / Documentos</p><h2>Comprobantes</h2></div>
                    <p className="fiscal-documents__intro">
                      Descargá la representación fiscal congelada de cada comprobante autorizado.
                      Homologación se identifica dentro del archivo y no se presenta como producción.
                    </p>
                    {invoicesQuery.isLoading ? <p role="status">Cargando comprobantes…</p> : null}
                    {!invoicesQuery.isLoading && invoices.length === 0 ? (
                      <p className="fiscal-documents__empty">Todavía no hay comprobantes para esta entidad.</p>
                    ) : null}
                    <div className="fiscal-document-list">
                      {invoices.map((invoice) => (
                        <article key={invoice.id} className="fiscal-document-row">
                          <div>
                            <span>{invoice.status}</span>
                            <strong>{invoiceLabel(invoice)}</strong>
                            <small>
                              {invoice.authorizedAt
                                ? new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(invoice.authorizedAt))
                                : "Sin autorización"}
                            </small>
                          </div>
                          <strong>{formatMoney(invoice.totals.grossMinorUnits, invoice.currency)}</strong>
                          <button
                            type="button"
                            className="button-secondary"
                            disabled={busy || invoice.status !== "AUTHORIZED"}
                            onClick={() => void downloadInvoice(invoice)}
                          >
                            {invoice.status === "AUTHORIZED"
                              ? "Descargar PDF"
                              : "No disponible"}
                          </button>
                        </article>
                      ))}
                    </div>
                  </article>
                </>
              ) : (
                <article className="overview-priority overview-priority--warning">
                  <div className="overview-priority__copy"><strong>No hay entidad fiscal</strong><p>Creá la primera para configurar sucursales y ARCA.</p></div>
                </article>
              )}
            </div>
          </div>
        </>
      </StateView>
    </section>
  );
}

function formatCuit(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11
    ? `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`
    : value;
}

function readinessLabel(key: string) {
  return ({
    identity: "Identidad",
    owner: "Titular",
    branch: "Sucursal",
    homologation: "Homologación",
    production: "Producción",
  } as Record<string, string>)[key] ?? key;
}

function invoiceLabel(invoice: Invoice) {
  const type = invoice.voucherType.replaceAll("_", " ");
  return invoice.number == null ? type : `${type} · ${String(invoice.number).padStart(8, "0")}`;
}

function formatMoney(minorUnits: number, currency: string) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(minorUnits / 100);
}
