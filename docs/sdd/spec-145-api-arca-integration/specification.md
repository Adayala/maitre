# Especificación — SPEC-145 ARCA Adapter

Adapter server-side portable para WSAA/WSFEv1, con ambientes homologation/production separados.
Identidad idempotente: environment + fiscalEntity + pointOfSale + voucherType + internal invoice.
Nunca reintenta con número nuevo ante timeout ambiguo: consulta/reconcilia primero.

Normaliza authorized/rejected/pending, códigos y timestamps; conserva payload sensible sólo bajo
retención/acceso aprobados. Tickets, private keys y SOAP no llegan a browser/logs. Producción queda
bloqueada hasta homologación, credenciales, runbook, revisión fiscal y evidencia vigente.
