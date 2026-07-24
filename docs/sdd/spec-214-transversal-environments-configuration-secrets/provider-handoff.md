# Handoff Vercel/Supabase — SPEC-214

Checklist no secreto para coordinar al custodio de proveedores (pendiente confirmar: Adrian),
Platform Owner y reviewer. No incluye ni solicita valores sensibles por Git, issue o chat.

## Datos que debe confirmar el custodio

| Dato | Clasificación | Registro permitido |
| --- | --- | --- |
| Organización y project slug de Supabase | interno no secreto | documentación/config metadata |
| Project ref y región | interno no secreto | documentación/config metadata |
| Organización/team y project name de Vercel | interno no secreto | documentación/config metadata |
| Repo/branch vinculados y production branch | interno no secreto | documentación |
| Plan/tier efectivo y owners de billing | interno sensible | registro operativo restringido, sin medios de pago |
| Cuotas/alertas observadas | interno no secreto | provider register SPEC-208 |
| Emails/roles de miembros | PII/acceso | consola del provider; documento sólo roles/owners acordados |
| URLs públicas/issuer/JWKS | configuración pública | variables allowlisted/inventario |
| Publishable browser key | pública pero controlada | Vercel env; no hardcode innecesario |
| DB URLs/passwords/service-role/private keys | secreto | sólo secret store del provider/CI autorizado |

Si se comparte accidentalmente un secreto fuera del canal autorizado, se detiene el handoff, se
rota/revoca y se registra el incidente sin copiar el valor.

## Roles mínimos

| Sistema | Custodio | Platform Owner | Reviewer |
| --- | --- | --- | --- |
| GitHub repo/integration | administra instalación y alcance | valida branch/deploy mapping | revisa least privilege |
| Vercel | configura proyecto/env vars/domains | valida builds/deploys/budgets | revisa aislamiento/secret exposure |
| Supabase | configura proyecto/Auth/DB | valida migrations/runtime/restore | revisa RLS, access y exit strategy |

El custodio puede ejecutar acciones de consola, pero ADR-002 y los contratos de plataforma
requieren reviewers independientes según `ownership-review-matrix.md`.

## Secuencia

### 1. Confirmar alcance y cuentas

- Confirmar aceptación del rol `Provider Custodian` y si también asume `Platform Owner`.
- Identificar owners y backup/offboarding para GitHub, Vercel y Supabase.
- Verificar MFA y cuentas individuales; no usar usuario/contraseña compartidos.
- Mantener tier gratuito y billing/upgrade manual; no habilitar autoscaling pago sin decisión.

### 2. Crear o seleccionar Supabase development

- Usar proyecto development no productivo y región acordada por latencia/residencia.
- Registrar org/project ref/region sin secrets.
- No importar datos reales; seeds son sintéticos.
- Configurar Auth URLs sólo para orígenes locales/development/preview autorizados.
- No entregar service-role al browser, previews ni runtime I0 si no es requerida.
- Obtener conexiones pooled/runtime y direct/migration por canales separados.

### 3. Vincular GitHub y Vercel

- Instalar integración sólo para `Adayala/maitre`, no todos los repos por defecto.
- Vercel project apunta al root/build definido por ADR-003 cuando sea aceptada.
- Production branch: `main`; previews se aíslan y nunca reciben secretos productivos.
- Requerir checks/gates antes de promover; auto-deploy no equivale a release aprobada.
- Confirmar que logs/build artifacts no imprimen variables.

### 4. Inyectar configuración

Mapear nombres provider→nombres portables según `configuration-inventory.md`:

- browser allowlist sólo para URL y publishable key;
- API runtime recibe pooled `DATABASE_URL` únicamente en ambientes autorizados;
- migration URL existe sólo en job/manual autorizado, no API/browser/preview;
- issuer/audience/JWKS se fijan por allowlist, nunca desde el token;
- valores por ambiente se cargan directamente en consola/secret store.

### 5. Verificar aislamiento

- Un preview no accede a DB/Auth productivos.
- Un tenant no lee/escribe otro tenant por API; RLS actúa como defensa adicional.
- Build web no contiene nombres prohibidos ni secrets canarios.
- Revocar membership/User surte efecto server-side aunque el JWT siga vigente.
- CORS/Auth redirect URLs rechazan orígenes no allowlisted.

### 6. Verificar operación y salida

- Medir límites/cuotas del tier gratuito y configurar thresholds/runbook.
- Exportar schema/datos sintéticos y restaurar en entorno limpio.
- Documentar pausa/inactividad, backups disponibles y recuperación real del plan.
- Probar rotación de credencial sin downtime o con ventana declarada.
- Documentar desvinculación GitHub/Vercel/Supabase y eliminación segura del entorno.

## Evidencia de handoff

```yaml
provider: vercel | supabase | github
environment: development | preview | demo
custodian: <identidad que aceptó>
platformOwner: <identidad que aceptó>
reviewer: <identidad independiente>
projectRef: <referencia no secreta>
region: <si aplica>
tier: free
configuredAt: <timestamp UTC>
verifiedCommit: <sha completo>
checks:
  leastPrivilege: PASS | FAIL
  environmentIsolation: PASS | FAIL
  browserSecretAudit: PASS | FAIL
  connectivity: PASS | FAIL
  tenantIsolation: PASS | FAIL
  budgetThresholds: PASS | FAIL
  exportRestore: PASS | FAIL
evidenceRefs: [<artifacts redactados>]
```

El handoff no termina con “proyecto vinculado”. Todos los checks deben tener evidencia y reviewer;
un resultado FAIL mantiene SPEC-210/214/226 `BLOCKED`.

## Información que falta solicitar a Adrian

Sin pedir secretos por este medio:

1. ¿Acepta formalmente ser `Provider Custodian` y/o `Platform Owner`?
2. ¿Qué organización/proyecto development de Supabase propone y en qué región/tier?
3. ¿Tiene permisos para instalar la integración GitHub sólo sobre `Adayala/maitre`?
4. ¿Puede crear/configurar el proyecto Vercel y separar Preview/Development/Demo?
5. ¿Quién será backup y reviewer independiente?
6. ¿Puede cargar directamente los secretos en las consolas y participar de la prueba de rotación,
   cuotas y export/restore?

## Estado del handoff

Información no secreta recibida:

| Campo | Estado |
| --- | --- |
| Supabase project ref | `hnemqtlpxqwqjligyksr` |
| Supabase public URL | `https://hnemqtlpxqwqjligyksr.supabase.co` |
| Publishable key | recibida; no persistida en Git |
| Secret key | expuesta por canal no autorizado; no persistida y requiere revocación/rotación |
| Direct database hostname | identificado; password no recibido/persistido |
| Región | pendiente |
| Tier efectivo | pendiente de confirmar Free |
| Pooled runtime connection | pendiente |
| Direct migration connection | pendiente de carga segura |
| Vercel organization/project | pendiente |
| Custodian/owner/reviewer | pendiente de aceptación |

La cadena compartida conserva el placeholder `[YOUR-PASSWORD]`; no es una credencial funcional y
no debe completarse en documentación. El custodio carga las conexiones reales directamente en
los secret stores autorizados. Esta metadata no demuestra conectividad, aislamiento ni restore;
los checks del handoff siguen pendientes.

Una secret key fue compartida por un canal no autorizado durante el handoff. Debe tratarse como
comprometida: revocar/rotar en el proveedor, cargar el reemplazo directamente en el secret store
del ambiente permitido y verificar que no aparezca en historial, logs o artifacts. La nueva clave
no se comparte por documentación, issue, commit ni chat. Hasta completar y verificar la rotación,
los checks de secrets y conectividad permanecen `FAIL/BLOCKED`.
