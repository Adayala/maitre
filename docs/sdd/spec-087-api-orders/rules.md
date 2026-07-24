# Reglas — SPEC-087

- Cliente no define importes, impuestos, descuentos ni currency autoritativa.
- Create/submit requieren `Idempotency-Key`; comandos versionados validan revisión esperada.
- Detail fuera de alcance usa `404`; colecciones filtran antes de paginar.
- `409 CATALOG_CHANGED` expone diferencias aprobadas sin aceptar cambios silenciosos.
- Submit y cancelación auditan actor, motivo y correlación; no reescriben historial.
- Respuestas y eventos derivados no convierten la API en autoridad fiscal ni de pago.
