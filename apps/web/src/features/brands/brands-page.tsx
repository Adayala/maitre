import { useEffect, useState, type FormEvent } from "react";
import type { BrandPresentationDocument } from "@maitre/contracts";
import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { StateView } from "../../components/state-view.js";
import { apiRequest } from "../../lib/api-client.js";
import { useAuth } from "../../app/auth-context.js";
import { useTenantContext } from "../../app/tenant-context.js";
import { applyBrandPresentation } from "../../../../../packages/brand-presentation/src/index.js";

interface Brand {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export function BrandsPage() {
  const { accessToken } = useAuth();
  const { selectedTenantId } = useTenantContext();
  const { data, isLoading, error, refetch } = useTenantQuery<{ data: Brand[] }>(
    "brands",
    "/v1/brands",
  );
  const brands = data?.data ?? [];
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const activeBrands = brands.filter((brand) => isBrandActive(brand.status));
  const inactiveBrands = brands.filter((brand) => !isBrandActive(brand.status));
  const summary = getBrandsSummary(brands.length, activeBrands.length, inactiveBrands.length);
  const checklist = [
    { label: "Al menos una marca creada", done: brands.length > 0 },
    { label: "Slug visible", done: brands.every((brand) => brand.slug.trim().length > 0) && brands.length > 0 },
    { label: "Marca publicable", done: activeBrands.length > 0 },
    { label: "Base comercial relevada", done: brands.length > 0 },
  ];
  useEffect(() => {
    if (!brands.length) {
      setSelectedBrandId("");
      return;
    }
    if (!brands.some((brand) => brand.id === selectedBrandId)) setSelectedBrandId(brands[0]!.id);
  }, [brands, selectedBrandId]);
  const selectedBrand = brands.find((brand) => brand.id === selectedBrandId);

  async function create(e: FormEvent) {
    e.preventDefault();
    if (!accessToken || !selectedTenantId) return;
    setIsSaving(true);
    setMutationError(null);
    try {
      await apiRequest("/v1/brands", {
        accessToken,
        tenantId: selectedTenantId,
        method: "POST",
        body: { name, description: description || undefined, config: { language: "es", currency: "ARS" } },
      });
      setName("");
      setDescription("");
      await refetch();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "No se pudo crear la marca");
    } finally {
      setIsSaving(false);
    }
  }

  async function update(brand: Brand, status: "ACTIVE" | "INACTIVE") {
    if (!accessToken || !selectedTenantId) return;
    setIsSaving(true);
    setMutationError(null);
    try {
      await apiRequest(`/v1/brands/${brand.id}`, {
        accessToken,
        tenantId: selectedTenantId,
        method: "PATCH",
        body: { status },
      });
      await refetch();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "No se pudo actualizar la marca");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section aria-labelledby="brands-heading" className="overview-page">
      <h1 id="brands-heading">Marcas</h1>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        onRetry={() => void refetch()}
      >
        <>
          <article className="overview-card">
            <h2>Nueva marca</h2>
            <form className="user-management-form" onSubmit={create}>
              <label>Nombre<input required minLength={3} value={name} onChange={(event) => setName(event.target.value)} /></label>
              <label>Descripción<input value={description} onChange={(event) => setDescription(event.target.value)} /></label>
              <button type="submit" disabled={isSaving}>{isSaving ? "Guardando…" : "Crear marca"}</button>
            </form>
            {mutationError ? <p role="alert" className="login-error">{mutationError}</p> : null}
          </article>
        {brands.length > 0 ? (
          <>
            <article className={`overview-priority overview-priority--${summary.tone}`}>
              <div className="overview-priority__copy">
                <span className="overview-priority__eyebrow">Estado comercial</span>
                <strong>{summary.title}</strong>
                <p>{summary.message}</p>
              </div>
            </article>

            <dl className="kpi-grid">
              <div>
                <dt>Marcas</dt>
                <dd>{brands.length}</dd>
              </div>
              <div>
                <dt>Activas</dt>
                <dd>{activeBrands.length}</dd>
              </div>
              <div>
                <dt>A revisar</dt>
                <dd>{inactiveBrands.length}</dd>
              </div>
              <div>
                <dt>Slugs definidos</dt>
                <dd>{brands.filter((brand) => brand.slug.trim().length > 0).length}</dd>
              </div>
            </dl>

            <article className="overview-card">
              <h2>Checklist de publicación</h2>
              <div className="overview-checklist">
                {checklist.map((step) => (
                  <div key={step.label} className={`overview-check ${step.done ? "overview-check--done" : ""}`}>
                    <strong>{step.done ? "✓" : "•"}</strong>
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
            </article>

            <section className="profile-module-grid" aria-label="Resumen de marcas">
              {brands.map((brand) => {
                const status = describeBrandStatus(brand.status);
                return (
                  <article key={brand.id} className="profile-card">
                    <p className="profile-eyebrow">{status.label}</p>
                    <h2>{brand.name}</h2>
                    <p>
                      Slug <strong>{brand.slug}</strong>
                    </p>
                    <p>{status.message}</p>
                  </article>
                );
              })}
            </section>

            <article className="overview-card">
              <h2>Detalle tabular</h2>
              <table>
                <caption className="sr-only">Listado de marcas</caption>
                <thead>
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Slug</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Gestionar</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => (
                    <tr key={brand.id}>
                      <td>{brand.name}</td>
                      <td>{brand.slug}</td>
                      <td>{brand.status}</td>
                      <td>
                        <select
                          value={isBrandActive(brand.status) ? "ACTIVE" : "INACTIVE"}
                          disabled={isSaving || normalizeBrandStatus(brand.status) === "ARCHIVED"}
                          onChange={(event) => void update(brand, event.target.value as "ACTIVE" | "INACTIVE")}
                        >
                          <option value="ACTIVE">Activa</option>
                          <option value="INACTIVE">Inactiva</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </article>
          {selectedBrand ? (
            <>
              <article className="overview-card">
                <label>
                  Marca a personalizar
                  <select value={selectedBrand.id} onChange={(event) => setSelectedBrandId(event.target.value)}>
                    {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                  </select>
                </label>
              </article>
              <BrandPresentationEditor key={selectedBrand.id} brand={selectedBrand} />
            </>
          ) : null}
        </>
        ) : <article className="overview-priority overview-priority--warning"><div className="overview-priority__copy"><strong>Todavía no hay marcas</strong><p>Creá la primera marca para poder asociar sucursales.</p></div></article>}
        </>
      </StateView>
    </section>
  );
}

interface PresentationRecord {
  id: string;
  revision: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  document: BrandPresentationDocument;
}

function BrandPresentationEditor({ brand }: { brand: Brand }) {
  const { accessToken } = useAuth();
  const { selectedTenantId } = useTenantContext();
  const { data, refetch } = useTenantQuery<{ data: { draft: PresentationRecord | null; published: PresentationRecord | null; history: PresentationRecord[] } }>(
    `brand-presentation-${brand.id}`,
    `/v1/brands/${brand.id}/presentation`,
  );
  const [document, setDocument] = useState<BrandPresentationDocument>(() => defaultPresentation(brand.name));
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const apiUrl = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:3001";

  useEffect(() => {
    const source = data?.data.draft?.document ?? data?.data.published?.document;
    if (source) setDocument(source);
  }, [data]);

  function updateIdentity(field: "displayName" | "shortName" | "tagline", value: string) {
    setDocument((current) => ({ ...current, identity: { ...current.identity, [field]: value || undefined } }));
  }
  function updateColor(field: keyof BrandPresentationDocument["colors"], value: string) {
    setDocument((current) => ({ ...current, colors: { ...current.colors, [field]: value } }));
  }
  function updateAsset(field: "logo" | "logoDark" | "favicon" | "hero", value: string) {
    setDocument((current) => ({
      ...current,
      assets: {
        ...current.assets,
        [field]: value ? {
          assetId: stableEditorAssetId(field), kind: assetKind(field), url: value,
          mimeType: value.endsWith(".svg") ? "image/svg+xml" : "image/png", checksum: `url:${value}`,
        } : undefined,
      },
    }));
  }

  async function request(path: string, method: "PUT" | "POST", body?: unknown) {
    if (!accessToken || !selectedTenantId) return;
    setSaving(true);
    setMessage(null);
    try {
      await apiRequest(path, { accessToken, tenantId: selectedTenantId, method, ...(body ? { body } : {}) });
      await refetch();
      setMessage("Cambio guardado correctamente.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudo guardar la presentación");
    } finally { setSaving(false); }
  }

  async function uploadAsset(field: "logo" | "logoDark" | "favicon" | "hero", file: File) {
    if (!accessToken || !selectedTenantId) return;
    setSaving(true);
    setMessage(null);
    try {
      const base64 = await fileToBase64(file);
      const response = await apiRequest<{ data: { id: string; kind: "LOGO" | "LOGO_DARK" | "FAVICON" | "HERO"; publicUrl: string; mimeType: string; checksum: string } }>(
        `/v1/brands/${brand.id}/assets`,
        { accessToken, tenantId: selectedTenantId, method: "POST", body: { kind: assetKind(field), fileName: file.name.replace(/[^a-zA-Z0-9._-]/g, "-"), mimeType: file.type, base64 } },
      );
      const asset = response.data;
      setDocument((current) => ({
        ...current,
        assets: { ...current.assets, [field]: { assetId: asset.id, kind: asset.kind, url: `${apiUrl}${asset.publicUrl}`, mimeType: asset.mimeType, checksum: asset.checksum } },
      }));
      setMessage("Asset cargado. Guardá el draft para incorporarlo.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudo cargar el asset");
    } finally { setSaving(false); }
  }

  return (
    <article className="overview-card brand-editor">
      <div className="brand-editor__header">
        <div><p className="profile-eyebrow">SPEC-232</p><h2>Identidad visual de {brand.name}</h2><p>Editá un draft, previsualizalo y publicalo atómicamente para todas las apps.</p></div>
        <span>{data?.data.published ? `Publicada · revisión ${data.data.published.revision}` : "Sin publicación"}</span>
      </div>
      <div className="brand-editor__grid">
        <section>
          <h3>Identidad y assets</h3>
          <label>Nombre visible<input value={document.identity.displayName ?? ""} onChange={(event) => updateIdentity("displayName", event.target.value)} /></label>
          <label>Nombre corto<input value={document.identity.shortName ?? ""} onChange={(event) => updateIdentity("shortName", event.target.value)} /></label>
          <label>Claim<input value={document.identity.tagline ?? ""} onChange={(event) => updateIdentity("tagline", event.target.value)} /></label>
          <label>URL del logo<input type="url" value={document.assets.logo?.url ?? ""} onChange={(event) => updateAsset("logo", event.target.value)} /></label>
          <label>Cargar logo<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAsset("logo", file); }} /></label>
          <label>URL del logo oscuro<input type="url" value={document.assets.logoDark?.url ?? ""} onChange={(event) => updateAsset("logoDark", event.target.value)} /></label>
          <label>URL del favicon<input type="url" value={document.assets.favicon?.url ?? ""} onChange={(event) => updateAsset("favicon", event.target.value)} /></label>
          <label>URL de portada<input type="url" value={document.assets.hero?.url ?? ""} onChange={(event) => updateAsset("hero", event.target.value)} /></label>
          <label>Cargar portada<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAsset("hero", file); }} /></label>
        </section>
        <section>
          <h3>Paleta semántica</h3>
          {(["primary", "secondary", "accent", "canvas", "surface", "text", "mutedText", "border"] as const).map((field) => (
            <label key={field}>{colorLabel(field)}<span className="brand-color-field"><input type="color" value={document.colors[field] ?? "#000000"} onChange={(event) => updateColor(field, event.target.value.toUpperCase())} /><code>{document.colors[field]}</code></span></label>
          ))}
        </section>
        <section className="brand-preview" style={{
          background: document.colors.canvas, color: document.colors.text,
          borderColor: document.colors.border, fontFamily: document.typography.body?.fallback,
        }}>
          <p className="profile-eyebrow">Preview</p>
          {document.assets.logo?.url ? <img src={document.assets.logo.url} alt="" /> : null}
          <h3 style={{ color: document.colors.primary }}>{document.identity.displayName}</h3>
          <p>{document.identity.tagline}</p>
          {document.assets.hero?.url ? <img className="brand-preview__hero" src={document.assets.hero.url} alt="" /> : null}
          <button type="button" style={{ background: document.colors.primary, color: document.colors.surface }}>Acción principal</button>
        </section>
      </div>
      <div className="brand-editor__actions">
        <button type="button" disabled={saving} onClick={() => { applyBrandPresentation(document); setMessage("Preview aplicado localmente. No afecta producción."); }}>Previsualizar en Dash</button>
        <button type="button" disabled={saving} onClick={() => void request(`/v1/brands/${brand.id}/presentation/draft`, "PUT", { presentation: document })}>Guardar draft</button>
        <button type="button" disabled={saving || !data?.data.draft} onClick={() => void request(`/v1/brands/${brand.id}/presentation/publish`, "POST")}>Publicar</button>
      </div>
      {message ? <p role="status">{message}</p> : null}
      {data?.data.history.length ? <details><summary>Historial de revisiones</summary><ul>{data.data.history.map((item) => <li key={item.id}>Revisión {item.revision} · {item.status}{item.status === "ARCHIVED" ? <button type="button" onClick={() => void request(`/v1/brands/${brand.id}/presentation/rollback`, "POST", { revision: item.revision })}>Restaurar</button> : null}</li>)}</ul></details> : null}
    </article>
  );
}

function defaultPresentation(name: string): BrandPresentationDocument {
  return {
    schemaVersion: 1, identity: { displayName: name, shortName: name },
    assets: {}, colors: { primary: "#2B5CAD", secondary: "#24352E", accent: "#D49A4A", canvas: "#FFFFFF", surface: "#FFFFFF", text: "#1A1A1A", mutedText: "#595959", border: "#D0D0D0" },
    typography: {}, shape: { radius: "medium", elevation: "subtle" }, templates: {}, content: { locale: "es-AR" },
  };
}
function stableEditorAssetId(field: string) {
  const suffix: Record<string, string> = { logo: "21", logoDark: "22", favicon: "23", hero: "24" };
  return `00000000-0000-0000-0000-0000000000${suffix[field] ?? "25"}`;
}
function assetKind(field: string): "LOGO" | "LOGO_DARK" | "FAVICON" | "HERO" {
  return ({ logo: "LOGO", logoDark: "LOGO_DARK", favicon: "FAVICON", hero: "HERO" } as const)[field as "logo"] ?? "LOGO";
}
function colorLabel(field: string) {
  return ({ primary: "Principal", secondary: "Secundario", accent: "Acento", canvas: "Fondo", surface: "Panel", text: "Texto", mutedText: "Texto secundario", border: "Bordes" } as Record<string, string>)[field] ?? field;
}
function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("No se pudo leer el archivo"));
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.readAsDataURL(file);
  });
}

function normalizeBrandStatus(status: string) {
  return status.trim().toUpperCase();
}

function isBrandActive(status: string) {
  const normalized = normalizeBrandStatus(status);
  return normalized === "ACTIVE" || normalized === "PUBLISHED" || normalized === "ENABLED";
}

function describeBrandStatus(status: string) {
  if (isBrandActive(status)) {
    return {
      label: "Lista para comunicar",
      message: "La marca aparece en estado apto para ser usada como referencia comercial y pública.",
    };
  }

  return {
    label: "Revisar publicación",
    message: "Conviene validar estado y visibilidad antes de usar esta marca como eje comercial principal.",
  };
}

function getBrandsSummary(total: number, active: number, inactive: number) {
  if (total === 0) {
    return {
      tone: "warning" as const,
      title: "Todavía no hay marcas cargadas",
      message: "Sin una marca visible cuesta ordenar catálogo, sedes y experiencia pública del tenant.",
    };
  }

  if (active === 0) {
    return {
      tone: "warning" as const,
      title: "Hay marcas, pero ninguna parece publicada",
      message: "La estructura comercial existe, aunque todavía no se ve una marca lista para sostener la experiencia visible.",
    };
  }

  if (inactive > 0) {
    return {
      tone: "info" as const,
      title: "Base comercial armada con pendientes",
      message: `Hay ${inactive} marca(s) para revisar antes de tomarlas como habilitadas en todos los frentes.`,
    };
  }

  return {
    tone: "success" as const,
    title: "Marcas listas para sostener operación y experiencia pública",
    message: "La capa comercial visible ya muestra una base consistente para seguir afinando owner app y experiencia cliente.",
  };
}
