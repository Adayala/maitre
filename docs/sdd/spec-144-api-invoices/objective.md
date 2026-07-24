# Objetivo — SPEC-144

Definir la API autoritativa para crear, validar, emitir, reconciliar y derivar invoices fiscales sin
permitir mutaciones incompatibles con la trazabilidad tributaria.

## Criterios de aceptación

### CAD-144-01 — La API expone recursos y comandos fiscales con lifecycle explícito

la API expone create/list/detail y comandos `validate`, `issue`, `reconcile`, `credit`,
`debit` y `void-draft` con límites de lifecycle explícitos.

### CAD-144-02 — Create e issue usan idempotencia; drafts usan concurrencia optimista

create e issue usan `Idempotency-Key`; comandos sobre drafts usan control optimista por
`If-Match`/revision esperada.

### CAD-144-03 — Issue congela snapshot y ejecuta el adapter fiscal sólo server-side

issue congela el snapshot fiscal, serializa numeración aplicable y ejecuta el adapter
fiscal server-side sin exponer secretos ni payloads sensibles al cliente.

### CAD-144-04 — Timeout ambiguo deriva a `PENDING_RECONCILIATION` y bloquea nueva numeración

timeout o resultado ambiguo devuelve `PENDING_RECONCILIATION` y prohíbe asignar nueva
numeración hasta consultar la identidad lógica del comprobante.

### CAD-144-05 — Credit/debit crean documentos vinculados; autorizados no se mutan in-place

credit/debit generan documentos vinculados; un comprobante `AUTHORIZED` nunca se muta ni
se corrige in-place.

### CAD-144-06 — La aprobación exige evidencia de idempotencia, timeout y RBAC

La aprobación exige fixtures de idempotencia, concurrencia, redacción de datos, timeout
ambiguo, linkage de notas y restricciones RBAC.
