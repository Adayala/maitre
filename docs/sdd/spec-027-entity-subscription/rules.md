# Rules — SPEC-027

## Invariantes

### 1. Subscription vigente única
Como máximo una Subscription vigente por Tenant y contexto comercial; historia cancelada no se
sobrescribe.

### 2. Status transitions
`TRIAL → ACTIVE → SUSPENDED → CANCELLED`. `CANCELLED` es terminal.

### 3. Período
Inicio/fin y cambios de período son explícitos, versionados y auditados. No existe renovación/cobro
automático hasta que un contrato comercial lo defina.

### 4. Cancellation
Cancelar registra motivo/actor, conserva datos y no reanuda la misma Subscription.

### 5. Autoridad
Items/catálogo describen servicios solicitados; Entitlement derivado decide capacidad efectiva.
Subscription no es permiso, factura ni credencial.
