# Especificación — SPEC-213

## 1. Recorrido vertical

```text
Login Supabase Auth
  → sesión en React.js
  → GET /v1/me/context
  → validar token
  → resolver User + Membership + Tenant + Branch
  → consultar PostgreSQL con aislamiento de tenant
  → devolver contrato tipado
  → seleccionar contexto autorizado
  → renderizar Dash shell accesible
```

El mismo despliegue expone además `GET /health/live` y `GET /health/ready`. Liveness no consulta dependencias; readiness verifica configuración y conectividad esencial con un presupuesto de tiempo acotado.

## 2. Alcance funcional

### Usuario de demo

- Ingresa con un método de autenticación habilitado por SPEC-023 y Supabase Auth.
- Ve únicamente tenants y sucursales derivados de memberships activas.
- Selecciona una sucursal si posee más de una; si existe una sola, se ingresa directamente.
- Ve nombre de usuario, tenant, sucursal, ambiente y estado de conectividad.
- Puede cerrar sesión y la aplicación elimina estado sensible local.

### Dash shell

El shell contiene navegación mínima, encabezado, selector de contexto y una página de inicio con información de demo. Los módulos todavía no implementados se omiten; no se muestran botones muertos.

## 3. Contratos mínimos

### `GET /health/live`

- público;
- devuelve `200` si el proceso puede atender requests;
- no consulta base de datos ni proveedores;
- no expone versiones o secretos innecesarios.

### `GET /health/ready`

- acceso restringible fuera del monitoreo de plataforma;
- verifica configuración obligatoria y base de datos con timeout;
- devuelve `200` cuando está listo o `503` cuando una dependencia esencial falla;
- informa estados sanitizados por componente.

### `GET /v1/me/context`

- requiere bearer token válido;
- devuelve identidad de dominio y memberships activas con tenant y sucursales autorizadas;
- no requiere ni acepta `X-Tenant-Id` o `X-Branch-Id` para calcular el resultado;
- usa schema Zod como fuente del tipo TypeScript y OpenAPI;
- errores siguen el contrato común y poseen `correlationId`.

#### Response `200`

```json
{
  "data": {
    "user": {
      "id": "usr_01...",
      "displayName": "Alex Demo"
    },
    "memberships": [
      {
        "id": "mem_01...",
        "tenant": {
          "id": "ten_01...",
          "name": "Restaurante Demo"
        },
        "roles": [
          {
            "id": "rol_01...",
            "code": "OWNER"
          }
        ],
        "branchScopeType": "SELECTED_BRANCHES",
        "branches": [
          {
            "id": "brn_01...",
            "code": "PALERMO",
            "name": "Palermo",
            "timezone": "America/Argentina/Buenos_Aires"
          }
        ]
      }
    ]
  },
  "meta": {
    "correlationId": "01J..."
  }
}
```

#### Semántica

- sólo se incluyen User, Membership, Tenant y Branch efectivamente activos;
- `roles` contiene identidad del rol, no permisos expandidos ni claims del proveedor;
- `branches` ya es la lista efectiva después de aplicar `ALL_BRANCHES` o `SELECTED_BRANCHES`;
- `branchScopeType` explica cómo se obtuvo el alcance y permite representar `ALL_BRANCHES` aunque no existan branches activas;
- arrays se ordenan de forma determinista por nombre normalizado y luego ID;
- una identidad habilitada sin memberships activas obtiene `200` con `memberships: []`, permitiendo un estado vacío diseñado;
- User inexistente/deshabilitado sigue los problemas `identity-not-enabled` o `access-suspended` de SPEC-023;
- email, external subject, tokens, permisos completos, entitlements y datos fiscales no forman parte de esta respuesta.

El cliente selecciona IDs exclusivamente de esta respuesta. En endpoints tenant-scoped posteriores envía `X-Tenant-Id` y, cuando corresponda, `X-Branch-Id`; el servidor vuelve a validar el contexto en cada request.

## 4. Datos mínimos

Las migraciones crean sólo las tablas y constraints requeridos por las specs dependientes:

- users y referencia a identidad externa;
- tenants y brands mínimas requeridas por Branch;
- branches;
- memberships, role assignments y branch scopes normalizados;
- audit metadata requerida.

El seed de demo es determinista, ficticio e idempotente. Credenciales y usuarios de Auth se aprovisionan mediante un script separado del seed SQL y nunca se guardan en Git.

## 5. Seguridad y tenancy

- El backend verifica firma, issuer, audience y expiración del token.
- Identidad autenticada no equivale a autorización.
- Todas las lecturas operativas incluyen alcance de tenant y pruebas negativas cross-tenant.
- Service role y conexión de base de datos viven sólo en servidor.
- Logs no contienen tokens, cookies, passwords ni cadenas de conexión.
- CORS, headers de seguridad y límites de request tienen configuración explícita.
- Errores públicos no filtran stack, SQL, políticas o datos internos.

## 6. UI y accesibilidad

- El shell consume `packages/design-tokens` y `packages/ui` de SPEC-212.
- Incluye skip link, landmarks, título de página, foco visible y orden lógico.
- Login, selección de sucursal, error y logout funcionan sólo con teclado.
- Loading, vacío, offline, expiración de sesión y error de API son estados diseñados.
- No existe flash de contenido autorizado antes de resolver sesión y permisos.

## 7. Observabilidad

Cada request API produce logging estructurado con:

- timestamp, level, service, environment y route template;
- correlation/trace id;
- status, latency y resultado sanitizado;
- tenant/user sólo mediante identificadores autorizados y política de privacidad.

OpenTelemetry se usa detrás de `TelemetryPort`. El recorrido permite correlacionar navegación, request y consulta sin hacer obligatorio un proveedor pago. Health endpoints no generan ruido en logs normales salvo error o muestreo.

## 8. Entornos y despliegue

- `local`: Supabase/PostgreSQL local o configuración de desarrollo documentada.
- `development`: proyecto Supabase compartido/regenerable que respalda previews; no requiere deployment Vercel propio en I0.
- `demo`: URL estable con datos ficticios.
- previews: frontend/API por cambio; reutilizan Supabase development con aislamiento sintético y no crean un proyecto por PR.
- `demo`: Production target staged/promovido con `APP_ENV=demo`, nunca producción comercial.

La API arranca tanto mediante adapter Vercel como con `node`, compartiendo la misma instancia Fastify. Ningún test unitario requiere internet.

## 9. Presupuesto inicial

El recorrido debe mantenerse en las cuotas vigentes de SPEC-208:

- un proyecto Vercel por entorno realmente necesario;
- dos proyectos Supabase remotos como máximo durante el MVP;
- CI con caché y jobs cancelables;
- Storybook como artefacto estático, no SaaS;
- telemetría local/estándar y sin proveedor pago obligatorio.
