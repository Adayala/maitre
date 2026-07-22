# Especificación — SPEC-144 Invoices API

Create/list/detail y commands `validate`, `issue`, `reconcile`, `credit`, `debit`, `void-draft`.
Create/issue usan idempotency key; draft commands usan `If-Match`. Issue congela snapshot y llama al
adapter fiscal server-side.

Timeout devuelve PENDING_RECONCILIATION y prohíbe nueva numeración hasta consultar por identidad
lógica. Credit/debit crea documento vinculado; nunca muta AUTHORIZED. Responses redactan receptor,
CAE y provider diagnostics según permiso.
