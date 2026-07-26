# Especificación — SPEC-093 Special Requests API

Registra request tipada contra Reservation/Visit/Order con estado
`PENDING -> ACCEPTED | REJECTED | FULFILLED`. Sólo un actor operativo autorizado acepta/rechaza;
crear no implica aceptación.

Texto opcional se limita, normaliza y sanitiza mínimamente; no reemplaza códigos de alérgenos.
El I0 actual no guarda `purpose`, `visibility`, `retentionPolicy` ni `consentBasis` como campos
estructurados. Tampoco redacta automáticamente el texto en lecturas/eventos dentro de esta
superficie materializada.

Los targets permitidos son `Reservation`, `Visit` y `Order`, siempre dentro del mismo alcance
`tenantId/brandId/branchId` derivado de auth y del recurso referenciado. El lifecycle autoritativo
es `PENDING -> ACCEPTED | REJECTED | FULFILLED`; `FULFILLED` sólo es válido después de `ACCEPTED` y
requiere trazabilidad operativa suficiente.

Cada request I0 conserva `requestType`, `targetType`, `targetId`, actor creador, actor resolutor,
timestamps, `reasonCode` opcional y `freeText` opcional. El `freeText` se trimmea, colapsa
whitespace y rechaza longitudes mayores al cap. No hay todavía policy por tipo que prohíba texto
ni metadata adicional de consentimiento/retención.
