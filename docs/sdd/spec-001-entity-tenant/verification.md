# Verificación — SPEC-001

## Criterios

### CAD-001-01 — Tenant define la raíz de aislamiento organizacional

- [ ] acepta nombre y defaults válidos;
- [ ] rechaza locale, currency, timezone, email o teléfono inválidos;
- [ ] no contiene plan, cuotas, features, passwords, roles ni usuarios embebidos;
- [ ] el contrato documenta a Tenant como raíz de aislamiento y no como suscripción.

### CAD-001-02 — Toda relación con alcance tenant usa `tenantId` explícito e inmutable

- [ ] `tenantId` queda fijo después de crear el agregado;
- [ ] recursos descendientes exigen `tenantId` + autorización persistida;
- [ ] IDs conocidos de otro tenant no eluden autorización;
- [ ] queries y políticas RLS aprobadas fallan cerrado sin contexto tenant.

### CAD-001-03 — Tenant no absorbe suscripción, límites ni capacidades

- [ ] el agregado no almacena plan, trial, billing, cuotas ni entitlements efectivos;
- [ ] los defaults regionales no se interpretan como capacidades habilitadas;
- [ ] contratos dependientes resuelven límites y features fuera de Tenant.

### CAD-001-04 — El ciclo de vida organizacional es acotado y terminal al archivar

- [ ] sólo permite transiciones de estado declaradas;
- [ ] `SUSPENDED` bloquea comandos operativos nuevos;
- [ ] `ARCHIVED` no retorna a estados operativos;
- [ ] lecturas históricas siguen disponibles según autorización aprobada.

### CAD-001-05 — Bootstrap y auditoría no generan ciclos con identidad

- [ ] actor de sistema permite bootstrap sin foreign-key circular;
- [ ] auditoría conserva created/updated por actor autorizado o `SYSTEM`;
- [ ] membership suspendida o revocada bloquea acceso posterior;
- [ ] ningún endpoint público crea organizaciones sin identidad verificada.

### CAD-001-06 — Provisioning inicial es autenticado, idempotente y observable

- [ ] reintentos con la misma idempotency key no duplican Tenant, OWNER ni Subscription;
- [ ] evento y agregado se persisten atómicamente mediante outbox;
- [ ] fallos parciales son recuperables y observables;
- [ ] existe evidencia enlazada de tests, migraciones, ADRs y resultados ejecutados.
