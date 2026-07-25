# Contrato API — SPEC-058 Checks

Crear/obtener Check y ejecutar add-adjustment, request-payment, settle o void. Creación por
Visit/revisión es idempotente y captura snapshots; la recomputación ocurre dentro de esos
workflows y no es un endpoint público arbitrario. El cliente no aporta totales
autoritativos. En I0 la superficie materializada usa create/get, `add-line`, `add-adjustment`,
`request-payment`, `settle` y `void`, con permisos explícitos y totales recalculados por servidor.
La respuesta separa total/saldo y expone sólo un `paymentsSummary` redactado, nunca datos de
tarjeta. `If-Match`/`Idempotency-Key` completos quedan como endurecimiento posterior si aún no
están materializados en todos los handlers.
