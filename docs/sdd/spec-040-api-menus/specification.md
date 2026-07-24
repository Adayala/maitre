# Especificación — SPEC-040

## Endpoints

### `GET /v1/menus`

Lista menús/revisiones visibles con filtros `brandId`, `status`, `branchId`, cursor y orden estable.

### `POST /v1/menus`

```json
{
  "brandId": "uuid",
  "name": "Cena",
  "currency": "ARS",
  "branchScopes": ["branch-id"],
  "validFrom": null,
  "validUntil": null
}
```

Requiere `Idempotency-Key`. Devuelve `Menu` + revisión `DRAFT` y `ETag`.

### `GET /v1/menus/{menuId}/revisions/{revision}`

Devuelve snapshot/draft completo según permisos, con `Categories`/`MenuItems` y `ETag`.

### `PATCH /v1/menus/{menuId}/revisions/{revision}`

Modifica metadata/alcances de `DRAFT` con `If-Match`; `Categories`/`MenuItems` usan sus contratos.

### `POST /v1/menus/{menuId}/revisions/{revision}/publish`

Comando idempotente con `If-Match`. Valida/congela snapshot y cambia el puntero activo.

### `POST /v1/menus/{menuId}/archive`

Archiva para nueva oferta sin borrar revisiones publicadas.
