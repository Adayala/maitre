# Especificación — SPEC-145 ARCA Adapter

Adapter server-side portable para WSAA/WSFEv1, con ambientes homologation/production separados.
Identidad idempotente: environment + fiscalEntity + pointOfSale + voucherType + internal invoice.
Nunca reintenta con número nuevo ante timeout ambiguo: consulta/reconcilia primero.

Normaliza authorized/rejected/pending, códigos y timestamps; conserva payload sensible sólo bajo
retención/acceso aprobados. Tickets, private keys y SOAP no llegan a browser/logs. Producción queda
bloqueada hasta homologación, credenciales, runbook, revisión fiscal y evidencia vigente.

El boundary incluye autenticación WSAA, emisión/consulta WSFEv1, sincronización de tablas
paramétricas, consulta de último autorizado y exportación asistida para Libro IVA Digital. La capa de
dominio consume puertos internos estables y nunca conoce SOAP, CMS, WSDL ni detalles de certificados.
La operación productiva queda sujeta a evidencia de homologación y validación tributaria competente.

Ante rechazo determinista el adapter no reintenta; ante transport error o timeout ambiguo conserva la
misma intención lógica y obliga consulta antes de reasignar numeración. Servicios complementarios como
constatación de comprobantes o padrón pueden agregarse como capacidades independientes, sin afectar la
autoridad del flujo principal de emisión.
