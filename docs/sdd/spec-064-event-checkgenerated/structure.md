# Estructura — SPEC-064

Tres schemas separados, producidos por sus respectivas transacciones/outbox. Aggregate y
partition: Check/`checkId`. Payload: envelope, scope, referencias, Money permitido,
revision y timestamp; Adjusted suma identidad/metadatos catalogados. Ningún schema contiene
Invoice identity ni detalles personales/de pago.
