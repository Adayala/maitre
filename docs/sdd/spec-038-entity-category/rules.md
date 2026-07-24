# Rules — SPEC-038

- Nombre normalizado único por MenuRevision.
- sortOrder + id determinan orden total estable.
- Category hereda Tenant/lifecycle de la revisión.
- Publicada no se muta in-place.
- Product se referencia mediante MenuItem; Category no posee precio/stock/Product lifecycle.
