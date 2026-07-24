# Especificación — SPEC-093 Special Requests API

Registra request tipada contra Reservation/Visit/Order con estado
`PENDING -> ACCEPTED | REJECTED | FULFILLED`. Sólo un actor operativo autorizado acepta/rechaza;
crear no implica aceptación.

Texto opcional se limita, normaliza y sanitiza; no reemplaza códigos de alérgenos. Purpose,
visibilidad, retención y consentimiento se guardan explícitamente. Eventos/logs omiten el texto y
la API lo redacta salvo permiso específico.

Los targets permitidos son `Reservation`, `Visit` y `Order`, siempre dentro del mismo alcance
`tenantId/brandId/branchId` derivado de auth y del recurso referenciado. El lifecycle autoritativo
es `PENDING -> ACCEPTED | REJECTED | FULFILLED`; `FULFILLED` sólo es válido después de `ACCEPTED` y
requiere trazabilidad operativa suficiente.

Cada request tipada conserva `requestType`, `targetType`, `targetId`, `purpose`, `visibility`,
`retentionPolicy`, `consentBasis`, actor creador, actor resolutor, timestamps y reason codes de
aceptación/rechazo. Texto libre es opcional, acotado y sanitizado; si la policy del tipo no admite
texto, la API lo rechaza explícitamente.
