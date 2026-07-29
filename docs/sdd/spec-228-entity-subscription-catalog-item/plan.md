# Plan de implementación — SPEC-228

## Componentes

- Migración `subscription_catalog_items` y FK desde `subscription_items`.
- `CatalogItem` y `CatalogRepositoryPort` en el módulo Subscription.
- Repositorios InMemory y Supabase.
- Seed del catálogo compartido y endpoint `GET /v1/subscription-catalog`.

## Data flow

El panel lee el catálogo, envía el código y alcance elegidos, la API valida la definición y el
dominio persiste el precio vigente en SubscriptionItem antes de recalcular entitlements.
