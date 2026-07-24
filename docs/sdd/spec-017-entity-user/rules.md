# Reglas — SPEC-017

## Invariantes

1. User es global y no contiene `tenantId`.
2. User no contiene password, hash, token, MFA secret ni recovery code.
3. User no contiene rol, permiso, entitlement ni alcance por sucursal.
4. Provider + external identity es único e inmutable salvo proceso de linking/migración aprobado.
5. Email no concede identidad ni autorización.
6. User no ACTIVE no puede obtener un contexto autorizado.
7. Desactivar User no borra historial ni actor references.
8. Campos de auditoría usan UTC y Clock inyectado.
9. PII se minimiza en APIs, logs, fixtures y eventos.
10. Guest/comensal anónimo no se modela como User interno.

## Transiciones

- Suspender exige actor, razón auditable y revoca acceso efectivo.
- Reactivar desde SUSPENDED exige autorización administrativa.
- Desactivar es terminal en I0 y desactiva/revoca memberships mediante caso de uso transaccional/consistente.
