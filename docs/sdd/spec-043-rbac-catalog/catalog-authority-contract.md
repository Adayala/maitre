# Contrato de autoridad — Catalog

## Identidad y revisionado

- `Product` es identidad lógica tenant-scoped reutilizable en múltiples menus.
- `ProductVersion` es snapshot inmutable de contenido base: nombre, tax category,
  allergens/provenance, modifiers y media refs.
- `MenuRevision` es DRAFT o PUBLISHED; `Category` pertenece a esa revisión.
- `MenuItem` asocia Category con ProductVersion y contiene price, currency, position,
  `catalogEligibility` y overrides permitidos.

Una draft deriva de la published copiando asociaciones/referencias, no clonando Product. Editar
contenido crea ProductVersion; el draft opta por ella. Publicar congela versiones/overrides. El
endpoint `/v1/products/{productId}` opera identidad/versiones; MenuItem se gestiona dentro de la
MenuRevision DRAFT mediante su contrato específico, no mediante Category ownership de Product.

## Disponibilidad

- `catalogEligibility`: `ENABLED | DISABLED | SCHEDULED`, con window/alcance publicados.
- `OperationalAvailability`: proyección `AVAILABLE | UNAVAILABLE | UNKNOWN`, con reason, sources,
  revisions y `asOf`; combina eligibility, stock, kitchen y overrides operativos.

Submit revalida ambos. UNKNOWN falla cerrado. Catalog sólo escribe eligibility; availability se
actualiza desde fuentes operativas y nunca muta Product/Menu snapshot.

## Publicación atómica

Publish recibe draft revision + idempotency key y en una transacción:

1. bloquea draft y valida `If-Match`/alcance;
2. valida categorías, orden, IDs y duplicados;
3. resuelve Product/Modifier versions;
4. valida price/currency/MoneyPolicy; convención MVP `FINAL_GROSS`, conservando TaxRateVersion;
5. valida tax category, media refs y allergen provenance;
6. verifica effective windows por sucursal/canal;
7. crea MenuRevision PUBLISHED y cambia active pointer por scope;
8. escribe `catalog.menu.published.v1` en outbox con cache version.

Una falla no cambia pointer ni emite evento. Media opcional ausente usa fallback; tax/money/alcance
inválido aborta. Reintento devuelve la misma published revision.

## Media port

`MediaAssetReference`: opaque asset ID, media type, byte/dimension limits, checksum, alt text y
lifecycle `PENDING_SCAN | ACTIVE | QUARANTINED | ARCHIVED`. Publish acepta sólo ACTIVE. Upload usa
URL temporal fuera del dominio; storage URL nunca se expone.

Contenido activo se rechaza/sanitiza; imágenes se decodifican/re-encodean y quitan metadata. Asset
ausente/quarantined usa fallback accesible. Retiro no altera snapshots históricos.

## Dependencias y permisos

SPEC-037–039 dependen de Organization, SPEC-143/154, MoneyPolicy y MediaPort. SPEC-040–042 dependen
de 037–039, SPEC-043, SPEC-215/219. QR/Ordering consumen sólo published revisions. Permisos:
`catalog_draft.write`, `catalog_menu.publish`, `catalog_menu.archive`, `catalog_product.write`,
`catalog_price.write`, `catalog_tax.assign`, `catalog_availability.configure` y
`catalog_media.manage`.

Owner/reviewer y aprobación continúan bloqueados.
