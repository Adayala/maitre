# Especificación — SPEC-220

## 1. Activos y fuentes de verdad

El inventario de recuperación cubre:

| Activo | Fuente de verdad | Mecanismo |
| --- | --- | --- |
| Schema, grants y RLS | migraciones Git | rebuild + verify |
| Datos PostgreSQL | base primaria | dump/restore o backup administrado |
| Objetos | storage privado | manifest + export/copy + hashes |
| Identidades | Supabase Auth + dominio | export disponible + procedimiento de reautenticación |
| Configuración | schemas/inventario Git | reinyección desde plataforma autorizada |
| Secretos/certificados | emisor/secret store | reemisión, restore seguro o rotación |
| Código/artefactos | Git + CI | checkout/build reproducible |
| Auditoría | almacenamiento definido por spec | export/restore con integridad |

Telemetría, cache, previews y proyecciones reconstruibles se clasifican separadamente y pueden no respaldarse.

## 2. RPO y RTO

- **RPO:** pérdida máxima aceptable medida desde el último punto recuperable.
- **RTO:** tiempo máximo objetivo para restaurar el servicio acordado.

Objetivos iniciales para ambientes no productivos:

| Ambiente | Datos | RPO propuesto | RTO propuesto |
| --- | --- | --- | --- |
| local/test | sintéticos/regenerables | no aplica | 1 hora mediante rebuild |
| development | sintéticos | 7 días o regeneración | 4 horas |
| demo | sintéticos curados | 24 horas | 4 horas en horario de trabajo |
| production | reales | no definido | no definido |

Los valores de development/demo son hipótesis `NOT_APPROVED` hasta medir SPK-06. Para datos totalmente regenerables, la pérdida aceptada es reconstruir el dataset; no se reporta un RPO de backup ficticio. Production permanece bloqueado hasta aprobar RPO/RTO por recorrido, presupuesto, on-call, backups administrados, redundancia y obligaciones contractuales.

## 3. Backup PostgreSQL

- `pg_dump` lógico en formato portable/apropiado y ejecutado con credencial dedicada de lectura mínima.
- Dump incluye datos y metadata necesaria; schema/grants/RLS se contrastan con migraciones.
- El output se cifra antes de abandonar el entorno controlado.
- Se genera manifest con fecha UTC, ambiente, database/schema version, herramienta, tamaño, hash y resultado.
- Backup se copia fuera de Supabase y de la cuenta/failure domain origen cuando sea viable.
- La automatización nunca imprime connection string, password o contenido del dump.
- Backups incompletos, vacíos inesperados o sin hash fallan y alertan.

I0 no programa retención de dumps. SPK-06 crea un dump temporal cifrado, verifica hash, restaura en destino aislado y lo elimina al cerrar el ejercicio. Si aparece un dato no regenerable, se bloquea su incorporación hasta aprobar destino, custodia, frecuencia y retención; no se almacena un dump inseguro como compensación.

## 4. Objetos

El backup de PostgreSQL no contiene bytes de Supabase Storage.

- Exportar manifest de bucket, path lógico, tenant/owner, tamaño, MIME, versión/hash y metadata.
- Copiar objetos privados con verificación de hash.
- Detectar faltantes, extras y objetos huérfanos respecto de PostgreSQL.
- Restaurar primero metadata/ownership y luego objetos o según runbook probado.
- Preservar clasificación y no convertir objetos privados en públicos durante recovery.
- Objetos regenerables pueden excluirse si el proceso y source están versionados.

Storage permanece deshabilitado en I0. SPK-06 sólo evalúa export de objetos si el experimento crea fixtures temporales; no se crean buckets de producto para satisfacer esta spec.

## 5. Identidad

- El dominio preserva User y memberships, pero credenciales/sesiones dependen de Supabase Auth.
- Se documenta qué información de identidad puede exportarse de forma soportada.
- Hashes o factores no transferibles no se fuerzan mediante mecanismos no soportados.
- Un DR puede requerir invalidar sesiones y ejecutar reautenticación/reset comunicado.
- MFA, recovery codes y links no se incluyen en dumps generales.
- Reconciliación verifica que cada identidad restaurada mapee al User correcto sin ampliar permisos.

Los usuarios Auth I0 son sintéticos y se recrean mediante script autorizado separado del seed SQL. El script no contiene passwords/tokens; los valores se inyectan temporalmente. SPK-06 documenta limitaciones de export, pero no retiene credenciales.

## 6. Configuración, secretos y certificados

- Git conserva schemas e inventario, no valores.
- Secretos se restauran desde store autorizado o se reemiten/rotan.
- Un backup de secreto posee cifrado, custodia dual/segregada y acceso auditado cuando la reemisión no sea posible.
- Certificados ARCA siguen procedimiento específico de custodia, expiración y revocación.
- Restore no reutiliza credenciales posiblemente comprometidas después de incidente.

## 7. Regla 3-2-1 adaptada

Para datos reales o no regenerables, el diseño busca:

- al menos tres copias lógicas, incluyendo primaria;
- dos mecanismos/ubicaciones independientes;
- una copia fuera del failure domain del proveedor/cuenta principal.

Durante demo free tier, cualquier desviación queda explícita con el dato en riesgo, compensación y trigger de upgrade. Un backup en la misma base/cuenta no protege contra todos los incidentes.

I0 declara una desviación total para datos regenerables: Git/migraciones/seed son fuentes de rebuild, no copias de la base. La regla 3-2-1 se vuelve obligatoria antes del primer dato no regenerable, salvo alternativa aprobada por riesgo.

## 8. Restore y disaster recovery

El runbook de restore incluye:

1. declarar incidente y congelar escrituras cuando corresponda;
2. elegir punto de recuperación y verificar manifest/hash;
3. provisionar destino limpio compatible;
4. aplicar migraciones/base y restaurar datos;
5. restaurar/reconciliar objetos e identidad;
6. inyectar/rotar configuración y secretos;
7. ejecutar integridad, RLS, conteos y smoke/E2E;
8. reconciliar efectos externos desde el punto recuperado;
9. reabrir tráfico gradualmente y observar;
10. documentar pérdida real, tiempos y follow-up.

No se envían nuevamente pagos, facturas ARCA, emails o webhooks sólo porque el estado local fue restaurado. Se reconcilian con proveedor usando idempotencia/evidencia.

## 9. Pruebas de restauración

- Según SPK-06 durante I0; mensual sólo si demo incorpora datos no regenerables después de aprobar su backup.
- Antes de migración destructiva o cambio mayor de persistencia.
- En destino aislado y sin credenciales capaces de contactar proveedores reales.
- Ejecutada por una persona distinta del autor cuando el equipo lo permita.
- Mide RPO/RTO real y registra pasos manuales, errores, hashes y evidencia.
- Un backup que no pudo restaurarse queda fallido aunque el job de exportación haya sido verde.

## 10. Retención y borrado

Cada categoría de datos declara:

- propósito y owner;
- evento que inicia retención;
- plazo o criterio aprobado;
- archivo/anominización/borrado;
- dependencias, backups y objetos;
- legal hold y autorización;
- evidencia de ejecución.

El borrado de datos activos no desaparece instantáneamente de backups inmutables. Se evita su restauración indebida mediante ventanas acotadas, registro de tombstones y reaplicación de borrados después del restore.

Legal hold suspende la purga sólo para alcance y período autorizados.

## 11. Integridad y reconciliación

Verificaciones mínimas posteriores:

- versión de migraciones y constraints;
- grants/RLS/policies;
- conteos y checksums por tablas críticas;
- referencias y orphan detection;
- manifest versus objetos;
- users versus external identities/memberships;
- outbox/inbox, idempotencia y comandos pendientes;
- secuencias/numeración fiscal sin duplicación;
- comparación con proveedores de pago/ARCA cuando corresponda.

## 12. Seguridad operacional

- Credenciales de backup no administran schema ni aplicación.
- Backups cifrados poseen keys separadas y rotables.
- Acceso/descarga/restore se audita.
- No usar GitHub artifacts públicos, emails, chat o discos personales sin control como destino.
- Backups reales no entran a development/demo.
- Expiración elimina copia y metadata sensible mediante procedimiento verificable.
- Restore sandbox no tiene egress a proveedores productivos.

## 13. Observabilidad

Se monitorea:

- último backup exitoso por activo/ambiente;
- edad versus RPO;
- tamaño/anomalías y duración;
- hash/upload/export failures;
- último restore probado y RTO observado;
- copias próximas a expirar o que exceden retención;
- drift entre inventario, objetos y DB.

Alertas enlazan runbook y owner; un backup fallido no se silencia por un intento posterior sin revisar el gap.

En I0 no hay backup programado ni alerta operativa. El ejercicio produce evidencia `PASS | FAIL | INCONCLUSIVE` en SPEC-226. Métricas de edad/RPO se activan cuando exista una política durable aprobada.

## 14. Perfil I0

El contrato concreto de rebuild, dump temporal, manifest, restore y cleanup está en [i0-recovery-profile.md](i0-recovery-profile.md). Ante conflicto, ese perfil limita I0; las secciones de datos reales siguen siendo gates futuros.
