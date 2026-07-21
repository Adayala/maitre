# Decisiones y fuentes — SPEC-215

## Decisiones

- RFC 9457 evita inventar un formato propietario de errores y permite extensiones de dominio.
- La versión mayor en path simplifica clientes y operación durante el MVP.
- Cursor es el default porque los datos operativos cambian durante la navegación; offset puede usarse en reportes estables si una spec lo justifica.
- Los envelopes uniforman metadata y paginación; 204 y archivos quedan fuera por semántica HTTP.
- `X-Tenant-Id`/`X-Branch-Id` expresan contexto seleccionado, nunca autorización.
- El estado de idempotencia se persiste porque memoria de una función serverless no es durable.

## Fuentes normativas

- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html)

## Decisiones pendientes por dominio

- Retención de idempotency keys para pedidos, pagos, caja y ARCA.
- Política de no revelación 403 versus 404 por recurso.
- Límites de página, body y rate por endpoint.
- Recursos que requieren ETag versus versión de dominio en body.
- Cache permitido para menú QR público y catálogos de baja variación.
