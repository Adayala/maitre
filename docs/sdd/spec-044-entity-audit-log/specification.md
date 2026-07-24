# Especificación — SPEC-044

## Schema JSON

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "partitionKey": "tenant-id:period",
  "sequence": 123,
  "occurredAt": "ISO8601",
  "recordedAt": "ISO8601",
  "actor": { "type": "USER | SERVICE | PLATFORM", "id": "opaque-id" },
  "action": "resource.action",
  "resourceType": "string",
  "resourceId": "uuid",
  "outcome": "SUCCEEDED | DENIED | FAILED",
  "reasonCode": "canonical-code",
  "correlationId": "uuid",
  "requestId": "uuid",
  "causationId": "uuid | null",
  "diff": { "before": {}, "after": {}, "redactedFields": [] },
  "technicalSignals": { "networkClass": "PUBLIC | PRIVATE | UNKNOWN" },
  "previousHash": "sha256:hex",
  "recordHash": "sha256:hex",
  "retentionPolicyId": "AUDIT-RETENTION-001"
}
```

`recordHash` cubre la serialización canónica y `previousHash` de su partición. El primer record usa
un genesis marker normativo. Hash chain detecta tampering, pero no reemplaza backup/retención.
