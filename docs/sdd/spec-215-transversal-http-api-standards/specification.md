# Especificación — SPEC-215

## 1. Protocolo y representación

- HTTPS obligatorio fuera de local.
- JSON UTF-8 para requests y responses, salvo descargas o webhooks con contrato propio.
- `Content-Type: application/json` en bodies JSON.
- Fechas y timestamps en ISO 8601/RFC 3339; instantes en UTC con `Z`.
- Moneda en minor units enteras y código ISO 4217; nunca `float`.
- IDs opacos como strings; el cliente no infiere tipo, orden o fecha desde ellos.
- Campos desconocidos se manejan según schema explícito; inputs críticos se rechazan en modo estricto.

## 2. Recursos, paths y métodos

```text
GET    /v1/resources
POST   /v1/resources
GET    /v1/resources/{resourceId}
PATCH  /v1/resources/{resourceId}
DELETE /v1/resources/{resourceId}
POST   /v1/resources/{resourceId}/actions/{action}
```

- Sustantivos plurales, minúsculas y kebab-case.
- GET/HEAD no cambian estado observable del negocio.
- PUT reemplaza una representación completa sólo cuando la spec lo permita.
- PATCH define campos actualizables y distingue ausente de `null`.
- DELETE es idempotente en efecto; la respuesta repetida se define por endpoint.
- Acciones de dominio que no son CRUD se modelan explícitamente y no se esconden en PATCH ambiguos.

## 3. Versionado y compatibilidad

- La versión mayor está en el path: `/v1`.
- Cambios aditivos compatibles no crean una nueva versión.
- Remover/renombrar campos, cambiar significado, tipo, requisito o status exitoso es breaking.
- Clientes deben tolerar campos de response desconocidos y no depender del orden JSON.
- Deprecaciones documentan alternativa, telemetría de uso y fecha mínima de retiro.
- OpenAPI versionado y contract tests detectan breaking changes no aprobados.

## 4. Autenticación, tenant y sucursal

```text
Authorization: Bearer <access-token>
X-Tenant-Id: <tenant-id>
X-Branch-Id: <branch-id>   # cuando corresponda
```

Los headers de contexto expresan la selección solicitada, no autoridad. El backend:

1. verifica el token;
2. resuelve la identidad de dominio;
3. comprueba membership, rol, entitlement y alcance de sucursal;
4. construye un `RequestContext` inmutable;
5. pasa ese contexto al caso de uso y persistencia.

Un endpoint no acepta `tenantId` dentro del body para decidir ownership. Cuando el tenant forme parte del recurso o payload de administración, debe coincidir con el contexto autorizado.

## 5. Respuestas exitosas

Un recurso individual usa:

```json
{
  "data": {},
  "meta": { "correlationId": "01..." }
}
```

Las colecciones usan:

```json
{
  "data": [],
  "page": {
    "nextCursor": null,
    "hasMore": false
  },
  "meta": { "correlationId": "01..." }
}
```

- `200`: lectura/actualización exitosa.
- `201`: creación; incluye `Location` cuando existe una URL estable.
- `202`: comando aceptado para procesamiento posterior, con recurso de estado.
- `204`: éxito intencional sin body.

No se responde `200` con `{ success: false }`.

## 6. Errores

Errores usan `application/problem+json` y el modelo RFC 9457:

```json
{
  "type": "https://docs.maitre.app/problems/validation-failed",
  "title": "La solicitud contiene datos inválidos",
  "status": 422,
  "detail": "Revisá los campos indicados.",
  "instance": "/v1/orders/01...",
  "code": "VALIDATION_FAILED",
  "correlationId": "01...",
  "errors": [
    { "path": "items.0.quantity", "code": "TOO_SMALL", "message": "Debe ser mayor a cero" }
  ]
}
```

- `type` identifica el problema de forma estable; `code` facilita clientes y métricas.
- `title` es estable; `detail` puede aportar contexto seguro.
- `errors` aparece sólo para validación y no revela schema interno, SQL o stack.
- Mensajes para usuario se localizan en la UI; la API no obliga a comparar texto.
- Status mínimos: 400 sintaxis, 401 autenticación, 403 autorización, 404 ausencia/no revelación, 409 conflicto, 412 precondición, 422 validación semántica, 429 límite, 500 inesperado, 503 dependencia no disponible.

## 7. Idempotencia

`Idempotency-Key` es obligatorio en POSTs que:

- crean pedidos, pagos, facturas o movimientos de caja;
- invocan proveedores externos;
- pueden reintentarse desde offline o por timeout;
- declaran la necesidad en su spec.

Contrato:

- key opaca de alta entropía, única por intención y actor;
- scope por tenant + operación + key;
- se persiste hash del request normalizado, estado y response relevante;
- misma key y mismo payload devuelve el resultado original;
- misma key y payload distinto devuelve `409 IDEMPOTENCY_CONFLICT`;
- solicitudes concurrentes con misma key se serializan o responden estado definido;
- retención y recovery se declaran por criticidad; fiscal/pagos siguen su norma específica.

El cliente nunca reintenta automáticamente un POST no idempotente.

## 8. Concurrencia

- Recursos susceptibles a edición concurrente exponen versión o `ETag`.
- Cambios condicionales usan `If-Match`; una versión obsoleta devuelve `412` o conflicto de dominio definido.
- No se adopta last-write-wins silencioso para dinero, stock, estado de mesa, pedidos o configuración crítica.
- Transacciones protegen invariantes dentro de una base; integraciones usan outbox/estado recuperable cuando la spec lo requiera.

## 9. Paginación, filtros y orden

- Cursor opaco como default para colecciones mutables.
- `limit` posee default y máximo documentados; superar el máximo produce validación, no consumo ilimitado.
- El orden es estable y contiene un desempate único.
- Cursor está ligado a filtros y orden; modificar la consulta lo invalida.
- Filtros repetibles siguen una convención documentada por endpoint.
- Búsqueda y orden sólo aceptan allowlists; no se traducen strings arbitrarios a SQL.
- Total exacto es opcional y se incluye sólo cuando el costo y caso de uso lo justifican.

## 10. Correlación, trazas y reintentos

- La API acepta `traceparent` estándar y genera trazas cuando falta.
- `X-Correlation-Id` puede recibirse como pista, pero se valida y limita; el servidor garantiza uno confiable.
- `correlationId` aparece en meta o problema y logs.
- 429/503 pueden incluir `Retry-After`.
- Clientes aplican timeout, backoff exponencial con jitter y límites; no reintentan 4xx salvo 408/409/429 bajo contrato explícito.
- Un retry no puede multiplicar efectos; respeta semántica HTTP e idempotencia de aplicación.

## 11. Cache y seguridad del navegador

- Respuestas autenticadas son privadas y no cacheables por intermediarios salvo decisión explícita.
- Datos sensibles usan `Cache-Control: no-store` cuando corresponda.
- CORS aplica allowlist por ambiente; nunca refleja orígenes arbitrarios con credenciales.
- CSRF se evalúa según transporte de credenciales; cookies requieren protecciones explícitas.
- Rate limits se aplican por riesgo y actor detrás de un port reemplazable; no dependen de IP como única identidad.
- Límites de body, profundidad y timeout se fijan antes de parsear trabajo costoso.

## 12. OpenAPI y gobernanza

- Schemas Zod registrados en Fastify generan OpenAPI.
- El documento declara auth, headers, parámetros, responses y problemas esperados.
- Ejemplos contienen datos sintéticos.
- CI regenera y compara el artefacto, valida reglas y detecta breaking changes.
- Cada endpoint enlaza su spec funcional y posee owner.
- Un endpoint no documentado no se considera público ni listo.
