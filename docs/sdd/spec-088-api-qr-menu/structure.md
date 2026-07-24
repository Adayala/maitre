# Estructura — SPEC-088

```text
GET /public/menu/{token}
├── validate MENU_READ capability
├── resolve published menu revision
├── apply locale + availability view
├── return ETag/cache-control
└── redact internal identifiers
```
