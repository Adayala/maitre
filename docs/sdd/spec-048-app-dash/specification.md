# Especificación — SPEC-048

## Screens

- Setup Wizard (onboarding)
- Dashboard Overview (secciones operacionales)
- Brand Management
- Branch Management
- User Management
- Subscription/Entitlements (sin billing en MVP gratuito)
- Audit Logs
- Settings

## Estados transversales

Cada screen materializada usa un patrón común de carga/estado (`StateView`) con variantes:

```text
LOADING | EMPTY | READY | ERROR
```

El I0 actual no materializa aún `PARTIAL`, `STALE`, `FORBIDDEN` ni `NOT_FOUND` como estados
visuales específicos por pantalla. Setup y Overview consumen directamente SPEC-046/047; Audit usa
la lista simple de SPEC-045. La UI no infiere setup, definiciones de métricas ni redacción de
auditoría: renderiza la respuesta autorizada del backend.

Rutas materializadas hoy en la app:

- `/` → Overview
- `/setup` → Setup Wizard
- `/brands`
- `/branches`
- `/users`
- `/subscription`
- `/audit`
- `/settings`
- `/login`

Dispositivos: responsive web desde viewport móvil hasta desktop; no “desktop only”.
