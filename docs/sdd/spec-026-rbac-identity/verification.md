# Verificación — SPEC-026

## Criterios

### CAD-026-01 — Cada acción resuelve User, Membership ACTIVE, permiso y tenant/alcance por sucursal; un claim o selector de Tenant nunca prueba autoridad

- [ ] toda acción resuelve User, Membership y alcance efectivos;
- [ ] claims o selectores de tenant no prueban autoridad;
- [ ] la decisión parte de contexto server-side.

### CAD-026-02 — OWNER/ADMIN/MANAGER cumplen la matriz contractual sin asumir jerarquía ordinal ni wildcard “full control”

- [ ] matriz allow/deny por action/permission/rol coincide con contrato;
- [ ] no existe wildcard implícito “full control”;
- [ ] MANAGER limita lectura al alcance efectivo.

### CAD-026-03 — Un actor no se asigna roles/alcances, no delega capabilities ausentes/no delegables y ADMIN no modifica OWNER o peer protegido

- [ ] ADMIN sólo invita/asigna roles delegables e inferiores;
- [ ] self-grant y peer/superior change fallan;
- [ ] capabilities ausentes o no delegables no pueden delegarse.

### CAD-026-04 — Siempre permanece al menos un OWNER activo; transferencia/cierre usa workflow explícito, concurrencia y auditoría

- [ ] último OWNER no puede revocarse sin transferencia/cierre;
- [ ] concurrencia protege esa garantía;
- [ ] el workflow queda auditado.

### CAD-026-05 — El alcance por sucursal delegado es subconjunto del actor y los recursos de otro tenant se ocultan sin enumerar identidades/memberships

- [ ] sucursal fuera de alcance queda bloqueada;
- [ ] recursos de otro tenant permanecen ocultos sin enumeración;
- [ ] el alcance delegado siempre es subconjunto del actor.

### CAD-026-06 — Invite, cambio de rol/alcance y revoke registran actor, target, diff, motivo y correlation sin tokens/PII excesiva

- [ ] decisiones sensibles producen auditoría sanitizada;
- [ ] invite, cambio de rol/alcance y revoke registran actor/target/diff/motivo;
- [ ] logs no exponen tokens o PII excesiva.
