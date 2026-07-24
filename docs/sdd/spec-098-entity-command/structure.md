# Estructura — SPEC-098

```text
Command
├── scope: tenantId, brandId, branchId, visitId, orderId, orderItemId, allocationId, stationId
├── authority: status, aggregateRevision, commandType, schemaVersion
├── payload: discriminated union allowlisted
├── execution: attempts, timestamps, actor metadata
└── routing/audit: routingPolicyRevisionId, reason codes, idempotency metadata
```

Command es autoridad de ejecución culinaria. ProductionQueue y alertas son proyecciones o señales
derivadas, no sustitutos del agregado.
