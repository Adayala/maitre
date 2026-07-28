# Estructura — SPEC-232

```text
Brand
  └── BrandPresentation (draft + published revisions)
        ├── AssetRefs
        ├── semantic tokens
        ├── typography
        └── template selections

Branch
  └── allowlisted presentation overrides

PresentationResolver
  -> tenant/brand/branch validation
  -> published snapshot
  -> platform fallback
  -> app-safe effective theme
```

Persistencia recomendada:

- tabla versionada `brand_presentations`;
- tabla/bucket `brand_assets` con ownership y metadata;
- override versionado `branch_presentations`;
- snapshot publicado inmutable y cacheable por revisión.

No se agrega JSON abierto a `Brand`: Brand referencia la presentación publicada y el agregado de
presentación valida su propio schema.
