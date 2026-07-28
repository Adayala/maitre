import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { BrandPresentationDocument } from "@maitre/contracts";

export const PLATFORM_PRESENTATION: BrandPresentationDocument = {
  schemaVersion: 1,
  identity: { displayName: "Maitre" },
  assets: {},
  colors: {
    primary: "#2B5CAD", canvas: "#FFFFFF", surface: "#FFFFFF", text: "#1A1A1A",
    mutedText: "#595959", border: "#D0D0D0",
  },
  typography: {},
  shape: { radius: "medium", elevation: "subtle" },
  templates: {},
  content: { locale: "es-AR" },
};

export function applyBrandPresentation(document: BrandPresentationDocument) {
  const root = window.document.documentElement;
  clearBrandPresentation();
  const colors = document.colors;
  const variables: Record<string, string | undefined> = {
    "--brand-primary": colors.primary,
    "--brand-secondary": colors.secondary,
    "--brand-accent": colors.accent,
    "--brand-canvas": colors.canvas,
    "--brand-surface": colors.surface,
    "--brand-text": colors.text,
    "--brand-muted-text": colors.mutedText,
    "--brand-border": colors.border,
    "--brand-font-heading": document.typography.heading ? `${document.typography.heading.family}, ${document.typography.heading.fallback}` : undefined,
    "--brand-font-body": document.typography.body ? `${document.typography.body.family}, ${document.typography.body.fallback}` : undefined,
    "--brand-hero-image": document.assets.hero ? `url("${document.assets.hero.url}")` : undefined,
  };
  Object.entries(variables).forEach(([key, value]) => { if (value) root.style.setProperty(key, value); });
  root.dataset["brandPresentation"] = "active";
  const favicon = document.assets.favicon?.url;
  if (favicon) {
    let link = window.document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = window.document.createElement("link");
      link.rel = "icon";
      window.document.head.appendChild(link);
    }
    link.href = favicon;
  }
  if (document.identity.displayName) window.document.title = document.identity.displayName;
}

export function clearBrandPresentation() {
  const root = window.document.documentElement;
  [...root.style].filter((key) => key.startsWith("--brand-")).forEach((key) => root.style.removeProperty(key));
  delete root.dataset["brandPresentation"];
}

interface ProviderProps {
  apiUrl: string;
  accessToken: string | null;
  tenantId: string | null;
  branchId?: string | null;
  brandId?: string | null;
  surface: string;
  children: ReactNode;
}

export function BrandPresentationProvider(props: ProviderProps) {
  const [presentation, setPresentation] = useState(PLATFORM_PRESENTATION);
  useEffect(() => {
    if (!props.accessToken || !props.tenantId) {
      setPresentation(PLATFORM_PRESENTATION);
      applyBrandPresentation(PLATFORM_PRESENTATION);
      return;
    }
    const controller = new AbortController();
    void resolveBrandId(props, controller.signal)
      .then(async (brandId) => {
        if (!brandId) return PLATFORM_PRESENTATION;
        const query = new URLSearchParams({ surface: props.surface });
        if (props.branchId) query.set("branchId", props.branchId);
        const response = await fetch(`${props.apiUrl}/v1/brands/${brandId}/presentation/effective?${query}`, {
          headers: { Authorization: `Bearer ${props.accessToken}`, "X-Tenant-Id": props.tenantId! },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("presentation-unavailable");
        const payload = await response.json() as { data: { document: BrandPresentationDocument } };
        return payload.data.document;
      })
      .then((document) => { setPresentation(document); applyBrandPresentation(document); })
      .catch((error) => {
        if ((error as Error).name !== "AbortError") {
          setPresentation(PLATFORM_PRESENTATION);
          applyBrandPresentation(PLATFORM_PRESENTATION);
        }
      });
    return () => { controller.abort(); clearBrandPresentation(); };
  }, [props.apiUrl, props.accessToken, props.tenantId, props.branchId, props.brandId, props.surface]);

  const style = {
    "--color-accent": presentation.colors.primary,
    "--color-bg": presentation.colors.canvas,
    "--color-fg": presentation.colors.text,
    "--color-border": presentation.colors.border,
    "--primary": presentation.colors.primary,
    "--accent": presentation.colors.accent,
    "--bg": presentation.colors.canvas,
    "--surface": presentation.colors.surface,
    "--surface-2": presentation.colors.surface,
    "--surface-3": presentation.colors.surface,
    "--text": presentation.colors.text,
    "--muted": presentation.colors.mutedText,
    "--border": presentation.colors.border,
    fontFamily: presentation.typography.body ? `${presentation.typography.body.family}, ${presentation.typography.body.fallback}` : undefined,
  } as CSSProperties;
  const template = presentation.templates[props.surface];
  return (
    <div
      style={style}
      data-brand-revision={presentation.schemaVersion}
      data-brand-surface={props.surface}
      data-brand-template={template?.templateId ?? "default"}
      data-brand-variant={template?.variant}
    >
      <BrandSignature document={presentation} />
      {props.children}
    </div>
  );
}

async function resolveBrandId(props: ProviderProps, signal: AbortSignal) {
  if (props.brandId) return props.brandId;
  const path = props.branchId ? `/v1/branches/${props.branchId}` : "/v1/brands";
  const response = await fetch(`${props.apiUrl}${path}`, {
    headers: { Authorization: `Bearer ${props.accessToken}`, "X-Tenant-Id": props.tenantId! },
    signal,
  });
  if (!response.ok) return null;
  const payload = await response.json() as { data: { brandId?: string } | Array<{ id: string }> };
  return Array.isArray(payload.data) ? payload.data[0]?.id ?? null : payload.data.brandId ?? null;
}

export function BrandMark({ document, className }: { document: BrandPresentationDocument; className?: string }) {
  const logo = document.assets.logo?.url;
  return logo
    ? <img className={className} src={logo} alt={document.identity.displayName ?? "Marca"} />
    : <span className={className}>{document.identity.shortName ?? document.identity.displayName ?? "Maitre"}</span>;
}

function BrandSignature({ document }: { document: BrandPresentationDocument }) {
  const name = document.identity.shortName ?? document.identity.displayName ?? "Maitre";
  const logo = document.assets.logoCompact?.url ?? document.assets.logo?.url;
  return (
    <aside
      aria-label={`Marca activa: ${name}`}
      style={{
        alignItems: "center", background: document.colors.surface ?? "#FFFFFF",
        border: `1px solid ${document.colors.border ?? "#D0D0D0"}`, borderRadius: "0 0 0 12px",
        color: document.colors.text ?? "#1A1A1A", display: "flex", gap: 10, padding: "8px 12px",
        position: "fixed", right: 0, top: 0, zIndex: 9999, boxShadow: "0 4px 16px #00000018",
      }}
    >
      {logo
        ? <img src={logo} alt="" style={{ display: "block", height: 34, maxWidth: 96, objectFit: "contain" }} />
        : null}
      <span>
        <strong style={{ display: "block", fontSize: 13 }}>{name}</strong>
        {document.identity.tagline ? <small style={{ display: "block", maxWidth: 260 }}>{document.identity.tagline}</small> : null}
      </span>
    </aside>
  );
}
