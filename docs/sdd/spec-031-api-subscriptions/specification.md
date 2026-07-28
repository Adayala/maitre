# Especificación — SPEC-031

## Endpoints

### `GET /v1/subscriptions/{tenantId}`

Devuelve la Subscription vigente y sus `items`. `{tenantId}` debe coincidir con el tenant autenticado.

### `GET /v1/subscription-catalog`

Devuelve `{ "data": CatalogItem[] }` con los ítems activos de SPEC-228.

### `POST /v1/subscriptions/{tenantId}/items`

```json
{
  "catalogItemCode": "SEATS",
  "quantity": 12,
  "scopeRefId": "branch-uuid"
}
```

Requiere `service:manage`. `quantity` es obligatoria conceptualmente para `QUANTITY` (si se omite,
la API usa `1`) y está prohibida para `SERVICE`. `scopeRefId` es obligatorio salvo alcance `TENANT`.
Responde `201` con el ítem creado o reactivado.

### `PATCH /v1/subscriptions/{tenantId}/items/{itemId}`

Actualiza un ítem cuantitativo:

```json
{ "quantity": 8 }
```

La cantidad debe ser un entero positivo. Responde `404` si el ítem no pertenece a la suscripción.

### `DELETE /v1/subscriptions/{tenantId}/items/{itemId}`

Desactiva el ítem identificado, preserva su fila e historial y recalcula entitlements. El verbo
DELETE expresa baja comercial lógica, no hard delete.

## Autorización y errores

- Todos los endpoints requieren contexto autenticado de tenant.
- Las mutaciones requieren `service:manage`.
- Tenant ajeno o ítem inexistente responde `404` sin filtrar existencia.
- Payload, catálogo inactivo, cantidad o alcance inválidos responden `400`.

## Fuera de alcance

- checkout, charge, refund y proration;
- hard delete;
- writes de Entitlement/Quota;
- tenantId arbitrario en endpoints de usuario tenant.
