# Contrato API — SPEC-144 Invoices

Crear, listar y obtener comprobantes, y ejecutar validate/issue/reconcile/credit mediante
comandos explícitos. Create e issue requieren Idempotency-Key; If-Match protege el draft y la
emisión congela el snapshot. Un timeout fiscal retorna estado pendiente, no un falso error
reintentable. Tests cubren concurrencia, duplicados, rechazo ARCA, notas asociadas, PII,
RBAC, auditoría y aislamiento entre tenants. `GET /v1/invoices/:id/document` acepta
`format=html|pdf` (HTML por defecto para compatibilidad). Ambos documentos descargables se
derivan sólo de un AUTHORIZED, son determinísticos y fallan cerrado para cualquier otro estado.

`POST /v1/invoices/:id/deliveries` exige `Idempotency-Key`, acepta un email y
`format=PDF|HTML`, y responde `202` al encolar o `200` al repetir exactamente la misma
solicitud. La dirección se persiste tenant-scoped en `fiscal_invoice_deliveries`; el evento
`fiscal.invoice-delivery.queued.v1` sólo contiene identificadores y formato, nunca el email.
El worker y el proveedor de correo permanecen desacoplados de este contrato.

El procesador reclama atómicamente entregas `QUEUED|FAILED`, renderiza el documento mediante
`InvoiceDeliveryDocumentPort` y envía mediante `InvoiceEmailSenderPort`. Una entrega `SENT` es
terminal e idempotente; un fallo persiste sólo la clase de error redactada y puede reintentarse.
Los eventos `sent`/`failed` no contienen destinatarios ni contenido del comprobante.

El adaptador runtime `ResendInvoiceEmailSender` usa `POST https://api.resend.com/emails`, envía
el comprobante como adjunto base64 y propaga `invoice-delivery/{deliveryId}` como clave de
idempotencia del proveedor. Requiere `RESEND_API_KEY` y `FISCAL_EMAIL_FROM` sólo en servidor.
`POST /v1/invoice-deliveries/:id/process` ejecuta una entrega del tenant autenticado y exige
`invoice:issue`; sin configuración falla cerrado y nunca simula un envío exitoso.
