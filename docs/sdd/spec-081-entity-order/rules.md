# Rules — SPEC-081

- `tenantId`, `brandId`, `branchId` y `visitId` quedan fijos desde creación.
- `DRAFT`, `SUBMITTED` y `CANCELLED` son estados persistidos; fulfillment se deriva y no se escribe.
- Submit requiere la misma currency y policy set para todo el agregado; mezcla inválida falla.
- Catálogo cambiado, modifier inválido o restricción incumplida devuelve `409 CATALOG_CHANGED` o
  `422` semántico según corresponda, nunca autoajustando silenciosamente.
- Cambios post-submit generan ajustes auditados y nunca borran items ni rehacen el snapshot.
- Money usa precisión exacta; Order no almacena PAN, CVV, secretos de pago ni PII innecesaria.
- Proyecciones externas no autorizan mutaciones; sólo revisión esperada y comandos del agregado.
