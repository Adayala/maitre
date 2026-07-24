# Rules — SPEC-095

- Evento por item/allocation y evento agregado no son intercambiables.
- `ordering.order.ready.v1` sólo se emite al cambiar la derivación agregada a READY.
- Reintentos o duplicados no deben producir una segunda transición lógica READY.
- Payloads incluyen sólo metadata operativa mínima y revisiones.
- Eventos tardíos no retroceden ni vuelven a declarar readiness agregada incorrectamente.
