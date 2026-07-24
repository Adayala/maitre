# Especificación — SPEC-144 Invoices API

Create/list/detail y commands `validate`, `issue`, `reconcile`, `credit`, `debit`, `void-draft`.
Create/issue usan idempotency key; draft commands usan `If-Match`. Issue congela snapshot y llama al
adapter fiscal server-side.

Timeout devuelve PENDING_RECONCILIATION y prohíbe nueva numeración hasta consultar por identidad
lógica. Credit/debit crea documento vinculado; nunca muta AUTHORIZED. Responses redactan receptor,
CAE y provider diagnostics según permiso.

`POST /invoices` crea borradores fiscales a partir de una intención comercial o de caja; `GET
/invoices` lista con filtros por tenant, fiscal entity, branch, status, date range y linkage;
`GET /invoices/{invoiceId}` devuelve snapshot, estado, referencias fiscales y visibilidad redactada
según permisos. `POST /invoices/{invoiceId}:validate` verifica consistencia fiscal sin emitir.

`POST /invoices/{invoiceId}:issue` es el único comando que puede pasar de `DRAFT|VALIDATED` a
`AUTHORIZED|REJECTED|PENDING_RECONCILIATION`. `POST /invoices/{invoiceId}:reconcile` consulta al
proveedor cuando el resultado es ambiguo. `POST /invoices/{invoiceId}:credit` y `:debit` crean un
nuevo documento enlazado al comprobante origen; `POST /invoices/{invoiceId}:void-draft` sólo aplica a
documentos no autorizados. Errores usan `404` para scope ajeno, `409` para lifecycle conflict, `412`
para revisión obsoleta y `422` para invalidaciones fiscales semánticas.
