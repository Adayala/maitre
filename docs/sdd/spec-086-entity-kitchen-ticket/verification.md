# Verificación — SPEC-086

## Criterios

### CAD-086-01 — KitchenTicket fija identidad y creación idempotente por order revision y station

- [ ] creación idempotente por order revision + station evita duplicados.

### CAD-086-02 — Los snapshots culinarios excluyen precio y PII innecesaria

- [ ] payload culinario mínimo excluye precio y PII, conservando lo operativo.

### CAD-086-03 — Comandos y revisiones respetan monotonicidad de estado

- [ ] comandos y revisiones esperadas respetan monotonicidad aprobada.

### CAD-086-04 — Replay y reorder convergen sin retroceder terminales

- [ ] replay, retries y reorder convergen sin retroceder estados terminales.

### CAD-086-05 — Transferencias y repriorizaciones quedan auditadas sin ownership ambiguo

- [ ] transferencias, cancelaciones y prioridad quedan auditadas sin doble ownership.

### CAD-086-06 — La aprobación exige evidencia de split, transfer y reorder

- [ ] fixtures cubren split, retry, transfer, cancel y cross-scope.
