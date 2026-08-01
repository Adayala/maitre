# Verificación — SPEC-144

## Criterios

### CAD-144-01 — La API expone recursos y comandos fiscales con lifecycle explícito

- [ ] recursos y comandos exponen lifecycle fiscal explícito.
- [ ] el fallback descargable sólo existe para AUTHORIZED y conserva hash determinístico.

### CAD-144-02 — Create e issue usan idempotencia; drafts usan concurrencia optimista

- [ ] idempotencia y concurrencia optimista están definidas por operación.

### CAD-144-03 — Issue congela snapshot y ejecuta el adapter fiscal sólo server-side

- [ ] issue congela snapshot y ejecuta adapter sólo server-side.

### CAD-144-04 — Timeout ambiguo deriva a `PENDING_RECONCILIATION` y bloquea nueva numeración

- [ ] timeout ambiguo deriva a `PENDING_RECONCILIATION` sin nueva numeración.

### CAD-144-05 — Credit/debit crean documentos vinculados; autorizados no se mutan in-place

- [ ] notas de crédito/débito crean documentos vinculados sin mutar autorizados.

### CAD-144-06 — La aprobación exige evidencia de idempotencia, timeout y RBAC

- [ ] fixtures cubren idempotencia, concurrencia, redacción, timeout y RBAC.
