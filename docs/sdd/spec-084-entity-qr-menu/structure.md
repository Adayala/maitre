# Estructura — SPEC-084

```text
QRMenu
├── scope: tenantId, brandId, branchId, tableId?
├── capability: token hash, fingerprint, purpose MENU_READ
├── lifecycle: issuedAt, expiresAt?, revokedAt?, rotatedFromId?
├── publication: menuRevisionId, locale policy, cache policy
└── audit/rate-limit metadata
```

QRMenu es autoridad sólo sobre la capability pública de lectura; el catálogo sigue siendo autoridad
del dominio Catalog.
