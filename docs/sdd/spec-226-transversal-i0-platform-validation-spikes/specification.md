# Especificación — SPEC-226

## 1. Naturaleza del spike

Los spikes son experimentos técnicos timeboxed. Pueden ejecutarse antes de specs funcionales READY porque no implementan comportamiento de producto ni se despliegan como capacidad operativa.

Todo artefacto vive en un área explícita, por ejemplo:

```text
spikes/i0-platform/
```

El código se elimina, archiva o reescribe antes de producción. Sólo contratos, configuración compartible y aprendizajes pasan al monorepo después de review.

## 2. Datos y seguridad

- Datos sintéticos con Tenant A/Tenant B.
- Proyecto/ambiente de desarrollo regenerable.
- Secrets únicamente mediante SPEC-214.
- Sin certificados ARCA, proveedores de pago o email real.
- Logs, artifacts y reports inspeccionados por fugas.
- Recursos con nombre/owner/fecha de expiración.

## 3. SPK-01 — Runtime y portabilidad

### Hipótesis

Una aplicación Vite/React y una instancia Fastify pueden construirse una vez y ejecutarse en Vercel y Node estándar mediante adapters delgados.

### Experimento

- Vite SPA con ruta `/` y manejo de fallback.
- Fastify app factory con `/health/live` y `/health/ready`.
- Entry point Node y adapter Vercel usan la misma app factory.
- Config Zod falla antes de readiness.
- Build/test sin SDK Vercel en dominio/aplicación.

### Criterios

- mismos contract tests para ambos adapters;
- preview responde rutas SPA/API;
- proceso Node local responde igual;
- shutdown/timeout/error handling explícitos;
- bundle y cold-start baseline registrados.

## 4. SPK-02 — PostgreSQL y pooling

### Hipótesis

Node/Vercel conecta a Supabase mediante el pooler transaction mode con conexiones acotadas y prepared statements deshabilitados donde corresponda.

### Experimento

- Drizzle/postgres.js contra Supabase development.
- Conexión runtime mediante Supavisor/pooler.
- Conexión administrativa separada para migraciones.
- Requests concurrentes pequeños y reconexión después de idle.
- Timeouts, socket failure y credencial inválida.

### Criterios

- readiness distingue configuración de dependencia caída;
- no se agota pool en carga demo definida;
- errores no filtran connection string;
- runtime no puede migrar schema;
- `prepare: false`/config equivalente documentada y testeada.

## 5. SPK-03 — Auth e identidad

### Hipótesis

Supabase Auth autentica mientras Maitre resuelve autorización desde User/Membership propios.

### Experimento

- usuarios sintéticos A, B y sin membership;
- login mediante flujo browser soportado;
- API verifica issuer, audience, algoritmo, expiración y firma/JWKS;
- mapping `externalIdentityId → User → Membership`;
- `/v1/me/context` experimental devuelve sólo scope autorizado;
- revocación/inactivación y token vencido.

### Criterios

- token válido no permite seleccionar Tenant B;
- claims editables no otorgan roles/branches;
- service role no entra al browser;
- JWKS/cache/rotation failure se maneja de forma segura;
- logout/reset/verify ownership queda claro entre proveedor y Maitre.

## 6. SPK-04 — Migraciones y RLS

### Hipótesis

Drizzle Kit y SQL revisado pueden reproducir schema, grants y RLS sin cambios manuales del dashboard.

### Experimento

- schema mínimo experimental User/Membership/Tenant/Branch;
- migration desde base vacía;
- grants y policies custom SQL;
- tests positivos/negativos Tenant A/B;
- cambio expand compatible y migración repetible;
- schema drift check.

### Criterios

- setup completo desde Git;
- RLS bloquea cross-tenant;
- service/runtime/migration roles están separados;
- ORM no oculta SQL crítico;
- rollback de app es compatible con expansión.

El modelo experimental no aprueba automáticamente SPEC-001/004/017/020.

## 7. SPK-05 — Toolchain y presupuesto

### Hipótesis

ESLint, TypeScript, Vitest, Testing Library, Playwright, dependency-cruiser, OpenAPI y Sonar pueden operar con feedback útil dentro de la cuota CI.

### Experimento

- ejecutar todos los comandos raíz desde checkout limpio;
- introducir fallos canarios de lint, types, boundary, secret, test y OpenAPI;
- medir cache cold/warm y paralelización;
- generar cobertura/quality report;
- Playwright Chromium sobre preview o entorno local controlado.

### Criterios

- cada canario falla el gate esperado;
- ejecución verde reproducible;
- tiempo/minutos/storage registrados;
- Sonar tiene fallback documentado si SaaS no es elegible;
- ninguna optimización omite un gate requerido.

## 8. SPK-06 — Salida y recuperación

### Hipótesis

Datos y objetos sintéticos pueden exportarse/restaurarse sin depender del dashboard de Supabase.

### Experimento

- dump cifrado + manifest/hash;
- restore en PostgreSQL limpio compatible;
- export/manifest de objetos de prueba;
- mapping de identidad documentado y sesión invalidada;
- reemplazo del adapter de persistencia en composition root o prueba equivalente.

### Criterios

- schema/datos/RLS/objetos pasan checks post-restore;
- RPO/RTO demo observados;
- secretos no aparecen en artifacts;
- limitaciones de export de Auth se documentan;
- pasos manuales y triggers de migración quedan explícitos.

## 9. Evidencia estándar

Cada spike produce:

- commit y fecha;
- hipótesis y resultado `PASS | FAIL | INCONCLUSIVE`;
- ambiente/versiones/config sin secretos;
- comandos reproducibles;
- mediciones y logs sanitizados;
- riesgos/limitaciones;
- artefactos y cleanup;
- recomendación sobre ADR/spec;
- follow-ups con owner.

## 10. Regla de decisión

- ADR se acepta sólo si todos sus criterios P0 pasan.
- Un resultado inconclusive no se interpreta como aceptación.
- Un fallo puede cambiar configuración, herramienta o proveedor mediante nueva opción documentada.
- No se elige una alternativa por preferencia sin repetir criterios equivalentes.
- Resultados se anexan/enlazan desde ADR-002/003 e I0 readiness.
