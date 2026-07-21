# Reglas — SPEC-215

## Invariantes

1. Todo endpoint público vive bajo una versión mayor explícita.
2. Schemas ejecutables y OpenAPI provienen de una sola fuente.
3. Headers de tenant/sucursal nunca otorgan acceso por sí mismos.
4. Un handler valida, autoriza, ejecuta y mapea; no contiene reglas de negocio.
5. Errores usan Problem Details y jamás filtran secretos o detalles internos.
6. Un cliente decide por `status`, `type` o `code`, nunca por texto humano.
7. Comandos críticos reintentables exigen idempotencia persistida.
8. Operaciones concurrentes críticas no usan last-write-wins silencioso.
9. Colecciones poseen límites y orden estable.
10. Los reintentos son acotados y sólo se realizan cuando la operación es segura.
11. IDs son opacos y todos los timestamps representan zona/offset inequívoco.
12. No se introduce un endpoint sin spec, autorización, observabilidad y tests de contrato.
13. Los endpoints de descubrimiento de contexto no aceptan selección como autoridad y documentan su semántica explícitamente.

## Excepciones

Webhooks, descargas, streaming o protocolos externos pueden apartarse del envelope general si su spec define media type, autenticación, errores, límites, idempotencia y observabilidad equivalentes.
