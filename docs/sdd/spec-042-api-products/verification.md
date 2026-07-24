# Verificación — SPEC-042

## Criterios

### CAD-042-01 — Create/list/get/PATCH derivan Tenant del contexto y no aceptan category, price, currency, position o operational status como campos de Product

- [ ] create/list/get/PATCH derivan Tenant del contexto;
- [ ] Category/price/position/availability en body se rechazan;
- [ ] Product no acepta operational status como campo propio.

### CAD-042-02 — Create usa Idempotency-Key y valida tax/allergen/dietary/modifier/media refs contra catálogos/scopes autorizados

- [ ] create retry no duplica Product;
- [ ] catalog/media/modifier ref desconocida o cross-tenant falla;
- [ ] las refs sólo se aceptan contra catálogos/scopes autorizados.

### CAD-042-03 — PATCH exige `If-Match`; editar Product no cambia MenuRevision publicada ni OrderItem histórico

- [ ] PATCH stale devuelve 412;
- [ ] editar Product no cambia snapshot publicado;
- [ ] OrderItem histórico permanece inalterado.

### CAD-042-04 — Archive conserva identidad/snapshots e impide nuevas colocaciones; no existe hard DELETE

- [ ] archive impide nueva colocación y conserva historia;
- [ ] identidad y snapshots se conservan;
- [ ] no existe hard DELETE.

### CAD-042-05 — Media se vincula por asset refs ya validadas; esta API no acepta URLs arbitrarias ni define upload/CDN multipart

- [ ] no se aceptan URL/multipart/secret payloads;
- [ ] media se vincula por asset refs ya validadas;
- [ ] upload/CDN multipart queda fuera de esta API.

### CAD-042-06 — 404/409/412/422, RBAC, auditoría, redacción y OpenAPI poseen evidencia de catalog refs, concurrency e isolation

- [ ] RBAC/errors/OpenAPI coinciden con contrato;
- [ ] auditoría y redacción poseen evidencia;
- [ ] catalog refs, concurrency e isolation quedan cubiertas.
