# Especificación — SPEC-044

## Schema I0

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "occurredAt": "ISO8601",
  "actorType": "USER | SYSTEM",
  "actorId": "opaque-id-or-null",
  "action": "CREATE | UPDATE | DELETE",
  "resourceType": "string",
  "resourceId": "uuid",
  "previousState": {},
  "newState": {},
  "correlationId": "uuid-or-null"
}
```

El I0 actual implementa un registro append-only simple. No existen `partitionKey`, `sequence`,
`recordedAt`, actor `SERVICE|PLATFORM`, `outcome`, `reasonCode`, `requestId`, `causationId`,
`technicalSignals`, `previousHash`, `recordHash` ni `retentionPolicyId` materializados en la
entidad.

`previousState` y `newState` son snapshots opcionales y el caller decide qué redacción aplicar
antes de escribirlos. El módulo de auditoría no sanitiza ni genera diffs por sí mismo.
