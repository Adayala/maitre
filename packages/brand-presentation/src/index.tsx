import {
  createContext,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { BrandPresentationDocument } from "@maitre/contracts";

declare const __MAITRE_BUILD_INFO__: {
  commitSha: string;
  deployedAt: string;
  environment: string;
};

export const PLATFORM_PRESENTATION: BrandPresentationDocument = {
  schemaVersion: 1,
  identity: { displayName: "Maitre" },
  assets: {},
  colors: {
    primary: "#5B5CE2",
    secondary: "#111827",
    accent: "#14B8A6",
    canvas: "#F5F7FB",
    surface: "#FFFFFF",
    text: "#101828",
    mutedText: "#667085",
    border: "#DCE3EC",
  },
  typography: {
    heading: {
      family: "Inter",
      fallback: "ui-sans-serif, system-ui, sans-serif",
      weights: [600, 700],
    },
    body: {
      family: "Inter",
      fallback: "ui-sans-serif, system-ui, sans-serif",
      weights: [400, 500, 600],
    },
  },
  shape: { radius: "large", elevation: "subtle" },
  templates: {},
  content: { locale: "es-AR" },
};

export function mergeBrandPresentation(
  document: BrandPresentationDocument,
): BrandPresentationDocument {
  return {
    ...PLATFORM_PRESENTATION,
    ...document,
    identity: { ...PLATFORM_PRESENTATION.identity, ...document.identity },
    assets: { ...PLATFORM_PRESENTATION.assets, ...document.assets },
    colors: { ...PLATFORM_PRESENTATION.colors, ...document.colors },
    typography: {
      ...PLATFORM_PRESENTATION.typography,
      ...document.typography,
    },
    shape: { ...PLATFORM_PRESENTATION.shape, ...document.shape },
    templates: { ...PLATFORM_PRESENTATION.templates, ...document.templates },
    content: { ...PLATFORM_PRESENTATION.content, ...document.content },
  };
}

export function applyBrandPresentation(document: BrandPresentationDocument) {
  document = mergeBrandPresentation(document);
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
    "--brand-font-heading": document.typography.heading
      ? `${document.typography.heading.family}, ${document.typography.heading.fallback}`
      : undefined,
    "--brand-font-body": document.typography.body
      ? `${document.typography.body.family}, ${document.typography.body.fallback}`
      : undefined,
    "--brand-hero-image": document.assets.hero
      ? `url("${document.assets.hero.url}")`
      : undefined,
    "--brand-radius": radiusToken(document.shape.radius),
    "--brand-elevation": elevationToken(document.shape.elevation),
  };
  Object.entries(variables).forEach(([key, value]) => {
    if (value) root.style.setProperty(key, value);
  });
  root.dataset["brandPresentation"] = "active";
  const favicon = document.assets.favicon?.url;
  if (favicon) {
    let link =
      window.document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = window.document.createElement("link");
      link.rel = "icon";
      window.document.head.appendChild(link);
    }
    link.href = favicon;
  }
  if (document.identity.displayName)
    window.document.title = document.identity.displayName;
}

export function clearBrandPresentation() {
  const root = window.document.documentElement;
  [...root.style]
    .filter((key) => key.startsWith("--brand-"))
    .forEach((key) => root.style.removeProperty(key));
  delete root.dataset["brandPresentation"];
}

interface ProviderProps {
  apiUrl: string;
  accessToken: string | null;
  tenantId: string | null;
  branchId?: string | null;
  brandId?: string | null;
  autoResolveBrand?: boolean;
  surface: string;
  children: ReactNode;
}

const BrandPresentationContext = createContext(PLATFORM_PRESENTATION);

export function useBrandPresentation() {
  return useContext(BrandPresentationContext);
}

export function BrandPresentationProvider(props: ProviderProps) {
  const [presentation, setPresentation] = useState(PLATFORM_PRESENTATION);
  useEffect(() => {
    if (!props.tenantId) {
      setPresentation(PLATFORM_PRESENTATION);
      applyBrandPresentation(PLATFORM_PRESENTATION);
      return;
    }
    const controller = new AbortController();
    void (
      props.accessToken
        ? resolveAuthenticatedPresentation(props, controller.signal)
        : resolvePublicPresentation(props, controller.signal)
    )
      .then((document) =>
        mergeBrandPresentation(document ?? PLATFORM_PRESENTATION),
      )
      .then((document) => {
        setPresentation(document);
        applyBrandPresentation(document);
      })
      .catch((error) => {
        if ((error as Error).name !== "AbortError") {
          setPresentation(PLATFORM_PRESENTATION);
          applyBrandPresentation(PLATFORM_PRESENTATION);
        }
      });
    return () => {
      controller.abort();
      clearBrandPresentation();
    };
  }, [
    props.apiUrl,
    props.accessToken,
    props.tenantId,
    props.branchId,
    props.brandId,
    props.surface,
  ]);

  const style = {
    "--color-accent": presentation.colors.primary ?? "#5B5CE2",
    "--color-bg": presentation.colors.canvas ?? "#F5F7FB",
    "--color-fg": presentation.colors.text ?? "#101828",
    "--color-border": presentation.colors.border ?? "#DCE3EC",
    "--primary": presentation.colors.primary ?? "#5B5CE2",
    "--accent": presentation.colors.accent ?? "#14B8A6",
    "--bg": presentation.colors.canvas ?? "#F5F7FB",
    "--surface": presentation.colors.surface ?? "#FFFFFF",
    "--surface-2": presentation.colors.surface ?? "#FFFFFF",
    "--surface-3": presentation.colors.surface ?? "#FFFFFF",
    "--text": presentation.colors.text ?? "#101828",
    "--muted": presentation.colors.mutedText ?? "#667085",
    "--border": presentation.colors.border ?? "#DCE3EC",
    backgroundColor: presentation.colors.canvas ?? "#F5F7FB",
    color: presentation.colors.text ?? "#101828",
    minHeight: "100vh",
    fontFamily: presentation.typography.body
      ? `${presentation.typography.body.family}, ${presentation.typography.body.fallback}`
      : undefined,
  } as CSSProperties;
  const template = presentation.templates[props.surface];
  return (
    <BrandPresentationContext.Provider value={presentation}>
      <div
        style={style}
        data-brand-revision={presentation.schemaVersion}
        data-brand-surface={props.surface}
        data-brand-template={template?.templateId ?? "default"}
        data-brand-variant={template?.variant}
      >
        {props.surface !== "PUBLIC_HOME" ? (
          <BrandSignature document={presentation} />
        ) : null}
        {props.children}
        <DeploymentBuildStamp />
      </div>
    </BrandPresentationContext.Provider>
  );
}

function DeploymentBuildStamp() {
  const info =
    typeof __MAITRE_BUILD_INFO__ === "undefined"
      ? {
          commitSha: "unknown",
          deployedAt: "unknown",
          environment: "development",
        }
      : __MAITRE_BUILD_INFO__;
  const shortCommit =
    info.commitSha === "unknown" ? "sin commit" : info.commitSha.slice(0, 7);
  const deployedAt = new Date(info.deployedAt);
  const readableDate = Number.isNaN(deployedAt.getTime())
    ? info.deployedAt
    : new Intl.DateTimeFormat("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(deployedAt);
  const commitUrl =
    info.commitSha === "unknown"
      ? null
      : `https://github.com/Adayala/maitre/commit/${info.commitSha}`;

  return (
    <details
      style={{
        bottom: 8,
        color: "var(--muted, #595959)",
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 10,
        position: "fixed",
        right: 10,
        zIndex: 9998,
      }}
    >
      <summary
        aria-label={`Información de versión: commit ${shortCommit}`}
        style={{
          background:
            "color-mix(in srgb, var(--surface, #fff) 92%, transparent)",
          border: "1px solid var(--border, #d0d0d0)",
          borderRadius: 999,
          cursor: "pointer",
          listStyle: "none",
          padding: "4px 8px",
        }}
      >
        build {shortCommit}
      </summary>
      <div
        style={{
          background: "var(--surface, #fff)",
          border: "1px solid var(--border, #d0d0d0)",
          borderRadius: 8,
          bottom: 28,
          boxShadow: "0 8px 24px #00000020",
          minWidth: 230,
          padding: 10,
          position: "absolute",
          right: 0,
        }}
      >
        <strong style={{ color: "var(--text, #1a1a1a)" }}>
          Versión desplegada
        </strong>
        <div style={{ marginTop: 6 }}>
          Commit:{" "}
          {commitUrl ? (
            <a href={commitUrl} rel="noreferrer" target="_blank">
              {shortCommit}
            </a>
          ) : (
            shortCommit
          )}
        </div>
        <div>Deploy: {readableDate} UTC</div>
        <div>Entorno: {info.environment}</div>
      </div>
    </details>
  );
}

async function resolveAuthenticatedPresentation(
  props: ProviderProps,
  signal: AbortSignal,
) {
  return resolveBrandId(props, signal).then(async (brandId) => {
    if (!brandId) return PLATFORM_PRESENTATION;
    const query = new URLSearchParams({ surface: props.surface });
    if (props.branchId) query.set("branchId", props.branchId);
    const response = await fetch(
      `${props.apiUrl}/v1/brands/${brandId}/presentation/effective?${query}`,
      {
        headers: {
          Authorization: `Bearer ${props.accessToken}`,
          "X-Tenant-Id": props.tenantId!,
        },
        signal,
      },
    );
    if (!response.ok) throw new Error("presentation-unavailable");
    const payload = (await response.json()) as {
      data: { document: BrandPresentationDocument };
    };
    return payload.data.document;
  });
}

async function resolvePublicPresentation(
  props: ProviderProps,
  signal: AbortSignal,
) {
  if (!props.tenantId || !props.brandId) return null;
  const query = new URLSearchParams({ surface: props.surface });
  const response = await fetch(
    `${props.apiUrl}/public/tenants/${props.tenantId}/brands/${props.brandId}/presentation?${query}`,
    { signal },
  );
  if (!response.ok) return null;
  const payload = (await response.json()) as {
    data: { document: BrandPresentationDocument };
  };
  return payload.data.document;
}

async function resolveBrandId(props: ProviderProps, signal: AbortSignal) {
  if (props.brandId) return props.brandId;
  if (props.autoResolveBrand === false) return null;
  const path = props.branchId ? `/v1/branches/${props.branchId}` : "/v1/brands";
  const response = await fetch(`${props.apiUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${props.accessToken}`,
      "X-Tenant-Id": props.tenantId!,
    },
    signal,
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as {
    data: { brandId?: string } | Array<{ id: string }>;
  };
  return Array.isArray(payload.data)
    ? (payload.data[0]?.id ?? null)
    : (payload.data.brandId ?? null);
}

function radiusToken(radius: BrandPresentationDocument["shape"]["radius"]) {
  return { none: "0px", small: "6px", medium: "10px", large: "16px" }[
    radius ?? "large"
  ];
}

function elevationToken(
  elevation: BrandPresentationDocument["shape"]["elevation"],
) {
  return {
    flat: "none",
    subtle: "0 8px 24px rgba(16, 24, 40, 0.08)",
    expressive: "0 18px 48px rgba(16, 24, 40, 0.16)",
  }[elevation ?? "subtle"];
}

export function BrandMark({
  document,
  className,
}: {
  document: BrandPresentationDocument;
  className?: string;
}) {
  const logo = document.assets.logo?.url;
  return logo ? (
    <img
      className={className}
      src={logo}
      alt={document.identity.displayName ?? "Marca"}
    />
  ) : (
    <span className={className}>
      {document.identity.shortName ?? document.identity.displayName ?? "Maitre"}
    </span>
  );
}

function BrandSignature({ document }: { document: BrandPresentationDocument }) {
  const name =
    document.identity.shortName ?? document.identity.displayName ?? "Maitre";
  const logo = document.assets.logoCompact?.url ?? document.assets.logo?.url;
  return (
    <aside
      aria-label={`Marca activa: ${name}`}
      style={{
        alignItems: "center",
        background: document.colors.surface ?? "#FFFFFF",
        border: `1px solid ${document.colors.border ?? "#D0D0D0"}`,
        borderRadius: "0 0 0 12px",
        color: document.colors.text ?? "#1A1A1A",
        display: "flex",
        gap: 10,
        padding: "8px 12px",
        position: "fixed",
        right: 0,
        top: 0,
        zIndex: 9999,
        boxShadow: "0 4px 16px #00000018",
      }}
    >
      {logo ? (
        <img
          src={logo}
          alt=""
          style={{
            display: "block",
            height: 34,
            maxWidth: 96,
            objectFit: "contain",
          }}
        />
      ) : null}
      <span>
        <strong style={{ display: "block", fontSize: 13 }}>{name}</strong>
        {document.identity.tagline ? (
          <small style={{ display: "block", maxWidth: 260 }}>
            {document.identity.tagline}
          </small>
        ) : null}
      </span>
    </aside>
  );
}
