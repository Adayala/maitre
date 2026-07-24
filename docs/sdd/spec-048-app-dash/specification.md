# Especificación — SPEC-048

## Screens

- Setup Wizard (onboarding)
- Dashboard Overview (secciones operacionales)
- Tenant Management
- Brand Management
- Branch Management
- User Management
- Subscription/Entitlements (sin billing en MVP gratuito)
- Audit Logs
- Settings

## Estados transversales

Cada screen define:

```text
LOADING | EMPTY | READY | PARTIAL | STALE | ERROR | FORBIDDEN | NOT_FOUND
```

Actions visibles provienen de capability/response, pero el backend reautoriza. La UI no infiere
setup, metric definitions, Entitlements ni Audit redaction.

Dispositivos: responsive web desde viewport móvil hasta desktop; no “desktop only”.
