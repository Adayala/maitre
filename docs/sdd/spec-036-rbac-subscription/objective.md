# Objetivo — SPEC-036

## Propósito

Autorizar lectura y solicitudes tenant-scoped separándolas de operaciones de plataforma, sin
permitir writes directos sobre Entitlements/Quotas ni inferir autoridad desde etiquetas de rol.

## Criterios de aceptación

### CAD-036-01 — Toda decisión resuelve Membership ACTIVE, permiso y alcance efectivos

Toda decisión resuelve Membership ACTIVE, permiso y alcance; OWNER/ADMIN/MANAGER nominales no
reemplazan assignments efectivos.

### CAD-036-02 — La lectura de Subscription, Entitlement y Quota minimiza términos comerciales

Lectura de Subscription, Entitlement y Quota minimiza términos comerciales según permiso y
necesidad operativa.

### CAD-036-03 — `subscription.change.request` permite solicitar cambios permitidos

`Subscription.change.request` permite solicitar cambios permitidos, no provisionar/suspender/cancelar
como plataforma ni cobrar.

### CAD-036-04 — Operaciones `platform.*` requieren control-plane separado y segregación

Operaciones `platform.*` requieren control-plane separado, step-up, actor real, tenant objetivo,
ticket/reason y segregación.

### CAD-036-05 — Ningún actor escribe Entitlement o Quota derivados

Ningún actor escribe Entitlement/Quota derivados; los overrides siguen workflow, autoridad, motivo,
vigencia y auditoría.

### CAD-036-06 — Cross-tenant, self-grant, impersonation y permisos desconocidos fallan deny-by-default

Cross-tenant, self-grant, impersonation, permiso desconocido y datos comerciales excesivos poseen
outcomes deny-by-default verificables.
