# Especificación — SPEC-031

## Endpoints

### `GET /v1/subscriptions/{tenantId}`

Devuelve la Subscription vigente y sus `items`. `{tenantId}` debe coincidir con el tenant autenticado.

### `GET /v1/subscription-catalog`

Devuelve `{ "data": CatalogItem[] }` con los ítems activos de SPEC-228, incluyendo
`description` y `benefits`.

### `GET /v1/subscription-packages`

Devuelve `{ "data": SubscriptionCatalogPackage[] }` ordenado por `sortOrder`. Cada paquete incluye
su propuesta comercial, beneficios y composición versionada. El cliente calcula el estimado con
los precios vigentes del catálogo y aplica los ítems mediante las mutaciones granulares existentes.

### `GET /v1/subscriptions/{tenantId}/access?branchId={branchId}`

Proyección mínima para aplicaciones consumidoras. Devuelve exclusivamente servicios activos y
cantidades contratadas que aplican al tenant y, cuando se informa `branchId`, a esa sucursal:

```json
{
  "data": {
    "tenantId": "uuid",
    "branchId": "uuid",
    "services": [
      { "code": "CORE", "quantity": 1, "scopeRefId": null },
      { "code": "FLOOR", "quantity": 1, "scopeRefId": "branch-uuid" },
      { "code": "WAITERS", "quantity": 8, "scopeRefId": "branch-uuid" }
    ]
  }
}
```

No expone precios, IDs internos de contratación ni ítems inactivos. Requiere sesión válida y
contexto del mismo tenant, pero no permisos comerciales: las apps operativas necesitan conocer sus
capacidades efectivas para ocultar superficies no contratadas.

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
