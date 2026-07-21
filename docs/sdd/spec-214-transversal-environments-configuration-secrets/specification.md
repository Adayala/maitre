# Especificación — SPEC-214

## 1. Modelo de ambientes

| Ambiente | Propósito | Datos | Persistencia |
| --- | --- | --- | --- |
| `local` | desarrollo individual | sintéticos | descartable |
| `test` | tests automatizados | fixtures sintéticos | efímera |
| `preview` | validar un cambio | sintéticos, aislados lógicamente | temporal |
| `development` | integración compartida | sintéticos | regenerable |
| `demo` | demostraciones estables | sintéticos curados | respaldada |
| `production` | operación real futura | reales | no habilitada por esta spec |

`production` queda reservado para evitar que un despliegue accidental se presente como productivo. Su habilitación requiere decisión de uso comercial, seguridad, privacidad, backup, soporte y plataforma compatibles.

### Mapping inicial en Vercel Hobby

| Ambiente Maitre | Target Vercel | Fuente |
| --- | --- | --- |
| `local` | Development | `vercel env pull` o valores locales seguros |
| `test` | no deploy | variables sintéticas de CI |
| `preview` | Preview | branches/PRs |
| `development` | no provisionado como deployment I0 | Supabase development respalda previews |
| `demo` | Production target sobre `main` | datos sintéticos curados |
| `production` | no configurado | decisión futura |

Usar el target llamado “Production” por Vercel para publicar `demo` no convierte a Maitre en producción comercial. `APP_ENV=demo` y `VITE_APP_ENV=demo` conservan esa distinción dentro del sistema. I0 usa un Production build staged y promoción explícita para evitar reconstruir otro artefacto.

## 2. Clasificación de configuración

### Pública

Puede incluirse en el bundle del navegador:

- origen público de API;
- URL pública de Supabase;
- clave `anon`/publishable diseñada por el proveedor para clientes;
- ambiente y versión pública sanitizada;
- flags que no otorguen acceso ni oculten controles de autorización.

Toda variable web pública usa el prefijo requerido por el bundler, actualmente `VITE_`, y se declara en un schema específico de browser. Que un valor sea público no elimina la necesidad de restringirlo por origen, RLS y cuota.

### Server-only

- connection strings y credenciales de base de datos;
- Supabase service role;
- secretos JWT o claves privadas;
- certificados y claves de ARCA;
- tokens de email, pagos, observabilidad o webhooks;
- material de cifrado y credenciales administrativas.

El walking skeleton no requiere una secret/service-role key de Supabase. Si un caso administrativo futuro la necesita, se agrega como variable opcional server-only mediante una spec, con autorización previa, alcance y rotación; nunca se reutiliza como credencial general de runtime.

No se permite importar el módulo de configuración server-only desde `apps/web`, `packages/ui`, `packages/design-tokens` ni contratos compartidos con el navegador.

### No secreta de runtime

Timeouts, límites, niveles de log, orígenes permitidos y feature flags se validan igual que los secretos. No se codifican como constantes dispersas cuando cambian por ambiente.

## 3. Contrato tipado

`packages/config` expone entrypoints separados:

```text
@maitre/config/browser
@maitre/config/server
@maitre/config/test
```

- Zod valida presencia, tipo, rango, URL, enum y relaciones entre valores.
- El parseo ocurre una vez en el composition root.
- La aplicación recibe un objeto inmutable y tipado; no lee `process.env` fuera de config.
- Los mensajes de arranque nombran la variable inválida, pero nunca imprimen su valor secreto.
- Defaults se limitan a valores seguros y no ambiguos para `local`/`test`.
- CI compara el schema con `.env.example` y la matriz documentada para detectar drift.

## 4. Archivos locales

- `.env.example` contiene nombres, comentarios y valores ficticios no funcionales.
- `.env`, `.env.local` y variantes con valores reales están ignorados por Git.
- Los tests usan valores sintéticos definidos en setup o archivos explícitamente seguros.
- Ningún script copia secretos a archivos generados persistentes.
- La documentación explica cómo obtener cada valor sin reproducirlo.

## 5. Inyección por plataforma

Vercel y CI inyectan variables por ambiente. La configuración equivalente puede entregarse a un proceso Node.js o contenedor estándar.

- Preview recibe sólo los secretos mínimos necesarios y nunca credenciales de demo con escritura amplia.
- Development y demo usan credenciales separadas cuando el proveedor lo permita.
- Runtime y migraciones usan roles de base de datos distintos.
- Variables se asignan explícitamente a preview/development/production; no se confía en defaults del dashboard.
- Un inventario versionado registra nombre, clasificación, consumidor, owner, ambientes, origen y política de rotación, pero no el valor.

La integración Supabase–Vercel puede inyectar nombres propios del proveedor. El deployment los mapea al contrato de [configuration-inventory.md](configuration-inventory.md); application/domain no lee `POSTGRES_*`, `NEXT_PUBLIC_*` ni nombres de integración directamente.

`DATABASE_URL` corresponde al endpoint pooled de runtime. `DATABASE_MIGRATION_URL` corresponde a una conexión administrativa/directa separada y sólo existe en el job/manual de migración autorizado. La selección exacta de pooler y parámetros queda pendiente de SPK-02.

## 6. Feature flags

- Un flag controla exposición, no autorización ni invariantes de seguridad.
- Tiene owner, razón, ambiente, valor por defecto y fecha de retiro.
- Flags server-side se evalúan antes de entregar capacidades sensibles.
- Durante el MVP se usa configuración tipada; no se agrega un SaaS de flags sin una spec y necesidad medida.
- Un flag temporal vencido falla el control de deuda o genera una tarea obligatoria.

## 7. Ciclo de vida de secretos

Cada secreto posee:

- sistema emisor y propósito;
- owner y consumidores;
- fecha de creación/última rotación;
- mecanismo de revocación;
- ambientes habilitados;
- clasificación y criticidad;
- procedimiento de rotación y recuperación.

Se rota inmediatamente ante exposición, cambio de responsable, uso inesperado o recomendación del emisor. La rotación normal se ajusta a capacidad del proveedor y riesgo; no se inventa una cadencia que provoque trabajo manual inseguro.

## 8. Promoción, despliegue y rollback

- El mismo commit/artefacto verificable se promueve; los valores cambian por ambiente.
- Configuración requerida se valida antes de dirigir tráfico.
- Cambios de config quedan en audit log del proveedor y en el change record, sin valores.
- El rollback restaura commit y configuración compatibles.
- Una migración incompatible no depende únicamente de rollback de aplicación; sigue expansión/contracción o compensación documentada.
- El runbook incluye smoke test y verificación de health/readiness.

## 9. Detección de fugas

- Secret scanning bloquea commits y CI.
- Se revisan source maps, bundles, logs, reportes de tests y artefactos.
- Logs aplican allowlist de campos; redaction es defensa adicional.
- Un secreto detectado se considera comprometido: primero revocar/rotar, luego eliminar del historial o artefactos según el incidente.
- Nunca se publica el valor en un issue, PR, chat o captura para pedir ayuda.

## 10. Incorporación de una integración externa

1. El owner conecta cuentas mediante la integración oficial e invita a los responsables necesarios.
2. Se verifica repositorio, proyecto y environments sin copiar valores.
3. Se compara el inventario de variables disponible contra el contrato versionado.
4. Se crean aliases/mappings para browser, runtime y migración.
5. Se confirma que Preview no recibe credenciales de migración ni administrativas.
6. Se redeploya porque cambios de variables no alteran deployments previos.
7. Se ejecutan smoke tests y los spikes SPK-02/03 antes de aceptar ADR-002.
