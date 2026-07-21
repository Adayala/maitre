# Verificación — SPEC-001

## Dominio

- [ ] acepta nombre y defaults válidos;
- [ ] rechaza locale, currency, timezone, email o teléfono inválidos;
- [ ] sólo permite transiciones de estado declaradas;
- [ ] `ARCHIVED` no retorna a estados operativos;
- [ ] no contiene plan, cuotas, features, passwords, roles ni users embebidos.

## Persistencia

- [ ] migración y rollback funcionan desde una base vacía;
- [ ] timestamps se almacenan como `timestamptz` y se serializan en UTC;
- [ ] mapper conserva camelCase en API y snake_case en DB;
- [ ] actor de sistema permite bootstrap sin foreign-key circular;
- [ ] evento y agregado se persisten atómicamente mediante outbox.

## Seguridad y aislamiento

- [ ] User de Tenant A no lee ni modifica Tenant B;
- [ ] IDs conocidos de otro tenant no eluden autorización;
- [ ] Membership suspendida o revocada bloquea acceso;
- [ ] Tenant suspendido bloquea comandos operativos;
- [ ] queries y políticas RLS aprobadas fallan cerrado sin tenant context.

## Provisioning

- [ ] reintentos con la misma idempotency key no duplican Tenant, OWNER ni Subscription;
- [ ] fallos parciales son recuperables y observables;
- [ ] ningún endpoint público crea organizaciones sin identidad y autorización verificadas.

Los checks sólo se completan con enlaces a tests, migraciones, ADRs y resultados ejecutados.
