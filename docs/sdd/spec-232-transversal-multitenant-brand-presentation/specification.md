# Especificación — SPEC-232

## BrandPresentation

```ts
type BrandPresentation = {
  schemaVersion: 1;
  revision: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  identity: {
    displayName?: string;
    shortName?: string;
    tagline?: string;
  };
  assets: {
    logo?: AssetRef;
    logoCompact?: AssetRef;
    logoDark?: AssetRef;
    favicon?: AssetRef;
    hero?: AssetRef;
    background?: AssetRef;
    placeholders?: Record<string, AssetRef>;
  };
  colors: {
    primary?: CssColor;
    secondary?: CssColor;
    accent?: CssColor;
    canvas?: CssColor;
    surface?: CssColor;
    text?: CssColor;
    mutedText?: CssColor;
    border?: CssColor;
  };
  typography: {
    heading?: FontRef;
    body?: FontRef;
    numeric?: FontRef;
    scale?: "compact" | "comfortable" | "large";
  };
  shape: {
    radius?: "none" | "small" | "medium" | "large";
    elevation?: "flat" | "subtle" | "expressive";
  };
  templates: Partial<Record<
    "PUBLIC_HOME" | "MENU" | "RESERVATION" | "PROMOTION" | "LOGIN" |
    "WAITER" | "HOST" | "KITCHEN" | "CASHIER" | "DASH",
    { templateId: string; variant?: string; config?: Record<string, unknown> }
  >>;
  content: {
    locale?: string;
    supportUrl?: string;
    legalUrl?: string;
    social?: Record<string, string>;
  };
};
```

`AssetRef` usa `assetId`, URL resuelta, MIME, dimensiones, checksum y variantes. `FontRef` limita
orígenes, formatos, pesos y estrategia de fallback. `config` de template se valida contra el schema
de la plantilla seleccionada; no habilita HTML, CSS o JavaScript arbitrario.

## Publicación

Edición crea draft. Preview recibe el draft sólo para una sesión autorizada. Publicar valida assets,
contraste, schemas y referencias, incrementa `revision` y genera un snapshot inmutable. Rollback
publica una revisión anterior como una revisión nueva.

## API

- `GET /v1/brands/{brandId}/presentation`
- `PUT /v1/brands/{brandId}/presentation/draft`
- `POST /v1/brands/{brandId}/presentation/preview`
- `POST /v1/brands/{brandId}/presentation/publish`
- `POST /v1/brands/{brandId}/presentation/rollback`
- `GET /v1/brands/{brandId}/presentation/effective?branchId=&surface=`
- `GET|POST /v1/brands/{brandId}/assets`
- `DELETE /v1/brands/{brandId}/assets/{assetId}`
- `GET /public/tenants/{tenantId}/brands/{brandId}/presentation`
- `GET /public/tenants/{tenantId}/brands/{brandId}/assets/{assetId}`
- resolución pública mediante capability o contexto público que ya identifica tenant/brand;
  nunca mediante un slug global ambiguo.

Los uploads aceptan PNG, JPEG, WebP, SVG, favicon o WOFF2, con máximo de 5 MB. La API valida firma
binaria, bloquea scripts y handlers en SVG, calcula SHA-256 y persiste metadata separada de los bytes.
Los objetos se guardan bajo `tenants/{tenantId}/brands/{brandId}/...` en el bucket `brand-assets`.

## Gestión

Dash permite elegir cualquiera de las marcas del tenant, editar identidad y paleta, subir logos o
portadas, aplicar preview local, guardar draft, publicar y restaurar una revisión archivada. Las
URLs persistidas por el uploader apuntan al endpoint público controlado; el editor no necesita
conocer una ruta interna del proveedor de Storage.

## Aplicación

El cliente transforma el snapshot en CSS custom properties semánticas. Si una propiedad falta o es
inválida usa el fallback de plataforma. Cambiar de branch recalcula el tema efectivo y elimina
variables del contexto anterior antes de aplicar las nuevas. Customer, Waiter, Host, Kitchen,
Cashier y Dash muestran la firma de marca efectiva y exponen la plantilla elegida mediante
`data-brand-template`, sin duplicar configuración por aplicación.
