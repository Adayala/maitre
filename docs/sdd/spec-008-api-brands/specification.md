# Especificación — SPEC-008

## Brands API

CRUD endpoints for Brands resource.

### POST /brands
Create new Brands.

### GET /brands/:id
Fetch Brands by ID.

### PATCH /brands/:id
Update Brands.

### GET /brands?filter=...
List Brands (filtered).

## Validations

- Multi-tenant isolation verified
- Entitlements checked
- Error codes: 400, 401, 403, 404, 409, 429, 500
