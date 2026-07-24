# Objetivo — SPEC-019

## Propósito

Definir permissions atómicas e inmutables `resource.action` para que endpoints y commands expresen
la capacidad requerida sin depender de roles nominales, metadata cliente o wildcards ambiguos.

## Resultados esperados

- El catálogo es versionado y definido por plataforma.
- Cada rol referencia códigos existentes.
- Membership/scope y reglas de dominio siguen participando de la decisión.
- Los permisos deprecated conservan historia y sucesor.

## Criterios de aceptación

### CAD-019-01 — Todo código cumple el formato lower-case `resource.action`, es único e inmutable

Todo código cumple el formato lower-case `resource.action`, es único e inmutable.

### CAD-019-02 — No existen wildcards persistidos ni permissions creadas por clientes o tenants

No existen wildcards en assignments persistidos I0 ni permissions creadas por clientes/tenants.

### CAD-019-03 — Un permiso desconocido, deprecated sin migración o alcance insuficiente produce deny-by-default

Un permiso desconocido, deprecated sin migración o alcance insuficiente produce deny-by-default.

### CAD-019-04 — Cada endpoint o command sensible referencia un código de permiso existente

Cada endpoint/command sensible referencia un código de permiso existente y además evalúa reglas de
dominio/segregación.

### CAD-019-05 — Renombrar o deprecar crea sucesor y migra roles y consumidores preservando historia

Renombrar/deprecar crea sucesor y migra roles/consumidores preservando historia.

### CAD-019-06 — Acciones sensibles autorizadas y denegadas producen auditoría sin exponer secretos

Acciones sensibles autorizadas y denegadas producen auditoría sin exponer tokens, claims ni PII
innecesaria.
