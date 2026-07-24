# Verificación — SPEC-210

## Criterios

### CAD-210-01 — La plataforma elegida preserva PostgreSQL estándar, identidad reemplazable y aislamiento multi-tenant

- [ ] un usuario del tenant A no puede leer ni modificar datos del tenant B;
- [ ] login, refresh, logout y revocación cumplen las specs de Identity;
- [ ] la autorización no depende solo de claims del proveedor.

### CAD-210-02 — El baseline I0 delimita estructura física, scopes y relaciones sin habilitar DDL prematuro

- [x] el baseline delimita las tablas I0 sin anticipar dominios posteriores;
- [x] el diccionario especifica tipo, nulabilidad, scope y constraints mínimas por entidad;
- [x] las discrepancias entre SPEC-001–006 y SPEC-017–020 tienen un identificador trazable;
- [x] toda relación tenant-scoped posee una estrategia de FK compuesta;
- [x] Role y Permission son catálogos globales versionados, no autoridad del cliente;
- [x] User permanece global y la autorización se deriva de Membership;
- [x] no se generó DDL ni se asumió que conectar Supabase autoriza migraciones;
- [ ] owners y reviewers resuelven y aprueban todos los `OPEN-*`;
- [ ] los contratos de repositorio justifican los índices candidatos;
- [ ] el plan de migración queda derivado del diccionario aprobado.

### CAD-210-03 — Browser y runtime no exponen secretos ni acceso directo a tablas operacionales

- [ ] React.js no contiene secretos ni acceso directo a tablas operacionales;
- [ ] secret/service-role key no es requerida por runtime ni aparece en bundles, logs o responses;
- [ ] preview carece de credenciales y workflow de migración compartida.

### CAD-210-04 — Dump, restore, exportación y sustitución de proveedor son verificables antes de adopción

- [ ] migraciones crean una base vacía reproducible;
- [ ] dump y restore recuperan schema, datos, grants y RLS;
- [ ] el adapter puede sustituirse por un fake en tests y por PostgreSQL estándar en una prueba.

### CAD-210-05 — La operación en free tier falla de forma segura y observable dentro del perímetro MVP

- [ ] SPK-02 demuestra desde Vercel el pooler/modo/configuración adecuados;
- [ ] los objetos privados requieren signed URL válida y expirable;
- [ ] la API informa una pausa/indisponibilidad sin filtrar detalles internos;
- [ ] uso proyectado se mantiene bajo 70% de las cuotas críticas de Free.

### CAD-210-06 — ADR-002 permanece bloqueada hasta completar evidencia PASS de los spikes requeridos

- [ ] el gate comercial está documentado y bloquea una promoción accidental;
- [ ] el segundo proyecto Supabase no existe sin necesidad aprobada;
- [ ] ADR-002 permanece PROPOSED mientras algún spike requerido esté `NOT_RUN`, FAIL o INCONCLUSIVE.
