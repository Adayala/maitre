# Contrato API — SPEC-055 Visits

Rutas para abrir/listar/obtener y ejecutar lifecycle sobre Visit. El I0 actual usa `POST /v1/visits`
con `branchId` en body y `GET /v1/visits?branchId=...` para listar. El seating inicial crea Visit
y Occupancies de forma acoplada dentro del command actual. Los cambios posteriores de mesa
pertenecen a SPEC-056. Lifecycle sigue usando endpoints de comando, no PATCH arbitrario.

Todavía no hay enforcement de `Idempotency-Key` ni `If-Match`. `reopen` existe y requiere permiso
manager/elevado con `reason`. Tests cubren create/close, reopen, list por branch, RBAC básico y
bloqueos funcionales de cierre.
