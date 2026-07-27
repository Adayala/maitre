# Arquitectura, componentes y diseño — relevamiento visual

## Objetivo

Consolidar en una sola lectura la arquitectura actual de Maitre, la composición de componentes del repositorio y el estado del diseño de aplicaciones por rol.

Este documento no reemplaza las specs normativas. Las conecta visualmente.

## Hallazgos del relevamiento

- La arquitectura de negocio, plataforma y portabilidad ya está bien definida en foundations y SDD.
- El backend ya materializa con claridad el patrón `apps → modules → adapters`.
- En runtime operativo, Supabase ya es la persistencia/auth principal cuando hay credenciales;
  `memory`/`fixture` quedan como fallback local para tests o builds sin configuración.
- El backend ya tiene adapters Supabase para fiscal, y el rollout de tablas quedó
  aplicado en el proyecto conectado mediante `supabase/migrations/20260727143000_fiscal_domain.sql`.
- El flujo fiscal técnico ya fue validado end-to-end contra Supabase: create →
  validate → issue → QR. La autorización ARCA sigue simulada, no legalmente productiva.
- La estrategia multiapp por rol ya existe en implementación: `web`, `customer`, `waiter`, `host`, `kitchen`, `cashier`, `api`.
- La capa de diseño compartido todavía está más madura en spec que en código: hoy existen componentes y estilos por app, pero aún no hay `packages/ui` ni `packages/design-tokens`.
- Faltaba una capa visual transversal que conectara arquitectura, UX operativa y composición del monorepo. Este documento cubre ese hueco.

## Cobertura documental actual

| Área | Documento principal | Estado actual |
| --- | --- | --- |
| Principios de arquitectura | [10-architecture-principles.md](10-architecture-principles.md) | Bien definido, pocas vistas integradas |
| Monorepo y boundaries | [SPEC-209](../sdd/spec-209-transversal-monorepo-architecture/specification.md) | Bien definido, foco normativo |
| Diseño y accesibilidad | [SPEC-212](../sdd/spec-212-transversal-design-system-accessibility/specification.md) | Bien definido, implementación parcial |
| Apps y dispositivos | [15-applications-and-devices.md](../sdd/_guides/15-applications-and-devices.md) | Bien definido, faltaba cruce con código real |
| Stack técnico | [TECH_STACK.md](../sdd/TECH_STACK.md) | Claro, orientado a plataforma |

## Estado operativo relevado el 27 de julio de 2026

| Área | Estado runtime validado | Nota |
| --- | --- | --- |
| API local `apps/api` | Operativa contra Supabase | `/health/live` y `/health/ready` responden OK |
| Auth / contexto | Operativo | `/v1/me/context` responde `401` limpio sin bearer |
| Datos organization/floor/reservations/ordering/kitchen/cash | Presentes en Supabase | hay datos reales mínimos para prueba manual |
| Fiscal | Operativo en modo simulado | schema aplicado, seed fiscal creado y emisión live `FACTURA_A` validada; ARCA real sigue pendiente |
| Fallback memory/fixture | Sólo soporte local/test | no forma parte del runtime operativo principal |

## Vista 1 — Plataforma operativa completa

```mermaid
graph LR
    subgraph CX [Experiencias por rol]
        CUSTOMER["Customer App"]
        WAITER["Waiter App"]
        HOST["Host / Maître App"]
        KITCHEN["Kitchen App"]
        CASHIER["Cashier App"]
        WEB["Admin / Web App"]
    end

    subgraph API [API y composición]
        HTTP["apps/api"]
    end

    subgraph DOMAIN [Módulos de dominio]
        ID["identity"]
        ORG["organization"]
        FLOOR["floor"]
        RES["reservations"]
        ORD["ordering"]
        KIT["kitchen"]
        CASH["cash"]
        WORK["workforce"]
        FISCAL["fiscal"]
        SUB["subscription"]
        CAT["catalog"]
        AUDIT["audit"]
    end

    subgraph DATA [Adaptadores e infraestructura]
        AUTH["identity/supabase-auth"]
        SUPA["persistence/supabase"]
    end

    CUSTOMER --> HTTP
    WAITER --> HTTP
    HOST --> HTTP
    KITCHEN --> HTTP
    CASHIER --> HTTP
    WEB --> HTTP

    HTTP --> ID
    HTTP --> ORG
    HTTP --> FLOOR
    HTTP --> RES
    HTTP --> ORD
    HTTP --> KIT
    HTTP --> CASH
    HTTP --> WORK
    HTTP --> FISCAL
    HTTP --> SUB
    HTTP --> CAT
    HTTP --> AUDIT

    ID --> AUTH
    ORG --> SUPA
    FLOOR --> SUPA
    RES --> SUPA
    ORD --> SUPA
    KIT --> SUPA
    CASH --> SUPA
    WORK --> SUPA
    FISCAL --> SUPA
    SUB --> SUPA
    CAT --> SUPA
    AUDIT --> SUPA
```

> Nota: esta vista muestra el runtime operativo principal actual. El adapter
> `persistence/memory` existe sólo como fallback local/test y queda fuera de esta
> vista para no confundirlo con la operación real sobre Supabase.

### Evidencia operativa reciente

- El 27 de julio de 2026 se aplicó la migration fiscal `20260727143000_fiscal_domain.sql`
  al proyecto Supabase conectado.
- Ese mismo día se validó un flujo fiscal live completo sobre Supabase:
  `create → validate → issue → QR`.
- La validación emitió una `FACTURA_A` técnica con CAE simulado; prueba wiring
  end-to-end, no habilitación fiscal legal real.

## Vista 2 — Apps, roles y modo de interacción

```mermaid
graph TB
    subgraph TOUCH [Touch-first]
        GUEST["Customer / Guest"]
        FLOOR_APP["Waiter"]
        HOST_APP["Host"]
        KDS["Kitchen"]
        POS["Cashier"]
    end

    subgraph MIXED [Mixto o no táctil]
        ADMIN["Web / Admin"]
    end

    GUEST -->|"consulta, reserva, seguimiento"| CUSTOMER_SURFACE["cliente"]
    FLOOR_APP -->|"salón, pedidos, mesas"| OPS_SURFACE["operación"]
    HOST_APP -->|"recepción, reservas, waitlist"| OPS_SURFACE
    KDS -->|"producción, despacho"| OPS_SURFACE
    POS -->|"cobro, caja"| OPS_SURFACE
    ADMIN -->|"configuración, control, análisis"| BACKOFFICE["backoffice"]
```

## Vista 3 — Monorepo actual

```mermaid
graph TB
    ROOT["maitre/"]

    ROOT --> APPS["apps/"]
    ROOT --> PACKAGES["packages/"]
    ROOT --> ADAPTERS["adapters/"]
    ROOT --> DOCS["docs/"]

    APPS --> API_APP["api"]
    APPS --> WEB_APP["web"]
    APPS --> CUSTOMER_APP["customer"]
    APPS --> WAITER_APP["waiter"]
    APPS --> HOST_APP2["host"]
    APPS --> KITCHEN_APP["kitchen"]
    APPS --> CASHIER_APP["cashier"]

    PACKAGES --> CONTRACTS["contracts"]
    PACKAGES --> MODULES["modules/*"]

    MODULES --> MOD_ID["identity"]
    MODULES --> MOD_ORG["organization"]
    MODULES --> MOD_FLOOR["floor"]
    MODULES --> MOD_RES["reservations"]
    MODULES --> MOD_ORD["ordering"]
    MODULES --> MOD_KIT["kitchen"]
    MODULES --> MOD_CASH["cash"]
    MODULES --> MOD_WORK["workforce"]
    MODULES --> MOD_FISCAL["fiscal"]
    MODULES --> MOD_SUB["subscription"]
    MODULES --> MOD_CAT["catalog"]
    MODULES --> MOD_AUDIT["audit"]

    ADAPTERS --> AD_PERSIST["persistence/*"]
    ADAPTERS --> AD_AUTH["identity/*"]
```

## Vista 4 — Flujo sincrónico principal

```mermaid
sequenceDiagram
    participant App as App por rol
    participant Api as apps/api
    participant Module as Caso de uso
    participant Repo as Puerto / repositorio
    participant DB as Supabase

    App->>Api: HTTP request + token + tenant/branch
    Api->>Api: parseo, authz, contexto
    Api->>Module: comando / query
    Module->>Repo: puertos del dominio
    Repo->>DB: lectura / escritura
    DB-->>Repo: resultado persistido
    Repo-->>Module: entidades / estado
    Module-->>Api: resultado de negocio
    Api-->>App: response DTO / problem details
```

## Vista 5 — Flujo asíncrono y coordinación entre dominios

```mermaid
graph LR
    ORD["ordering"] -->|"OrderSubmitted"| KIT["kitchen"]
    KIT -->|"ItemReady / CommandReady"| FLOOR["floor"]
    FLOOR -->|"CheckRequested"| CASH["cash"]
    CASH -->|"PaymentCaptured"| FLOOR
    FLOOR -->|"VisitClosed"| FEEDBACK["feedback / reputation futuro"]
    RES["reservations"] -->|"ReservationSeated"| FLOOR
```

## Vista 6 — Componentes de frontend actuales

```mermaid
graph TB
    subgraph LOCAL [Patrón repetido en apps táctiles y de atención]
        AUTH_CTX["auth-context"]
        SESSION_CTX["session-context"]
        NAV_CTX["nav-context / station-context según app"]
        API_CLIENT["api-client / use-api"]
        HEADER["AppHeader"]
        STATE["StateView"]
        FEATURE["feature pages"]
    end

    AUTH_CTX --> SESSION_CTX
    SESSION_CTX --> FEATURE
    NAV_CTX --> FEATURE
    API_CLIENT --> FEATURE
    HEADER --> FEATURE
    STATE --> FEATURE
```

### Lectura del relevamiento

- El patrón de app shell está bastante consolidado.
- La reutilización real hoy es **por copia convergente**, no por paquete compartido.
- Esto confirma que `packages/ui` y `packages/design-tokens` siguen siendo una **siguiente extracción razonable**, no un prerrequisito para seguir iterando producto.

## Vista 7 — Diseño: estado actual vs estado objetivo

```mermaid
graph LR
    subgraph TODAY [Estado actual]
        APP_STYLES["styles/global.css por app"]
        APP_COMPONENTS["componentes base por app"]
        APP_PATTERNS["patrones repetidos por rol"]
    end

    subgraph TARGET [Estado objetivo SPEC-212]
        TOKENS["packages/design-tokens"]
        UI["packages/ui"]
        FEATURES["feature components por app"]
    end

    APP_STYLES -. extraer .-> TOKENS
    APP_COMPONENTS -. extraer .-> UI
    APP_PATTERNS -. estabilizar .-> FEATURES
```

## Vista 8 — Ownership de componentes y responsabilidades

```mermaid
graph TB
    TOK["Design tokens futuros"]
    UI["Primitivas UI futuras"]
    APPSHELL["App shell actual"]
    ROLE["Features por rol"]
    DOMAIN["Módulos de dominio"]

    TOK --> UI
    UI --> APPSHELL
    APPSHELL --> ROLE
    ROLE --> DOMAIN
```

### Regla práctica

- `packages/design-tokens`: semántica visual y escala.
- `packages/ui`: primitivas sin negocio.
- `apps/*/features/*`: experiencia concreta por rol.
- `packages/modules/*`: reglas e invariantes.

## Vista 9 — Portabilidad de despliegue

```mermaid
graph LR
    subgraph LOGIC [Lógica portable]
        MODULES2["modules"]
        CONTRACTS2["contracts"]
        APPSHELL2["apps/api + apps/*"]
    end

    subgraph INITIAL [Plataforma inicial]
        VERCEL["Vercel"]
        SUPABASE["Supabase"]
    end

    subgraph FUTURE [Migración posible]
        CONTAINER["Node / container"]
        PG["PostgreSQL estándar"]
        ALT_EDGE["otro edge / workers"]
    end

    MODULES2 --> APPSHELL2
    CONTRACTS2 --> APPSHELL2
    APPSHELL2 --> VERCEL
    MODULES2 -. misma lógica .-> CONTAINER
    SUPABASE -. datos equivalentes .-> PG
    VERCEL -. despliegue reemplazable .-> ALT_EDGE
```

## Vista 10 — Gap map documental e implementación

| Tema | Definición spec | Implementación actual | Gap principal |
| --- | --- | --- | --- |
| Multiapp por rol | Alta | Alta | Consolidar ownership y navegación cruzada |
| Monorepo por módulos | Alta | Alta | Documentación visual faltante |
| UI compartida | Alta | Media/Baja | Extraer de apps a paquetes |
| Design tokens | Alta | Baja | Hoy viven distribuidos en CSS por app |
| Device strategy touch/non-touch | Alta | Media | Falta reflejarlo como sistema visual unificado |
| Arquitectura visual para onboarding | Media | Baja | Se cubre con este documento |

## Recomendaciones de continuidad

1. Usar este documento como mapa de onboarding técnico y de producto.
2. Mantener [10-architecture-principles.md](10-architecture-principles.md), [SPEC-209](../sdd/spec-209-transversal-monorepo-architecture/specification.md) y [SPEC-212](../sdd/spec-212-transversal-design-system-accessibility/specification.md) como fuentes normativas.
3. Extraer a `packages/ui` y `packages/design-tokens` sólo cuando el patrón ya esté probado en al menos dos apps.
4. Volver a actualizar estas vistas cada vez que cambie una de estas piezas:
   - una nueva app por rol;
   - una extracción a paquete compartido;
   - un cambio de despliegue;
   - un cambio fuerte del flujo operativo del restaurante.
