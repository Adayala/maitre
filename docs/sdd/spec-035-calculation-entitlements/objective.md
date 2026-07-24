# Objetivo — SPEC-035

## Propósito

Calcular Entitlements efectivos a partir de Subscription, items, catálogo y overrides aprobados de
forma determinista, tipada, scoped y auditable.

## Criterios de aceptación

### CAD-035-01 — El cálculo recibe inputs versionados y `asOf` explícito

El cálculo recibe inputs versionados y `asOf` explícito; no consulta reloj, red, billing ni estado
global oculto.

### CAD-035-02 — Sólo participan Subscription/items vigentes y scopes del Tenant

Sólo Subscription/items vigentes y scopes pertenecientes al Tenant participan; input inválido o
cross-tenant falla cerrado.

### CAD-035-03 — Cada entitlement code define tipo, agregación y precedence

Cada entitlement code define tipo, agregación y precedence; nunca se suman cantidades ni mezclan
LIMITED/UNLIMITED/DENIED implícitamente.

### CAD-035-04 — Overrides requieren autoridad, reason, vigencia y scope

Overrides requieren autoridad, reason, vigencia y scope; expiry los excluye sin editar historia.

### CAD-035-05 — Mismo input canónico produce el mismo set lógico y el reemplazo es atómico

Mismo input canónico produce el mismo set lógico, source refs, revision y orden; reemplazo de
proyección es atómico.

### CAD-035-06 — Vacío, suspensión, solapamiento, reducción, config inválida, unlimited, override y aislamiento tienen fixtures

Vacío, suspensión, solapamiento, reducción, config inválida, unlimited, override y aislamiento poseen
fixtures esperadas.
