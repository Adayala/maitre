# Objetivo — SPEC-088

Definir la API pública de QRMenu para resolver una capability opaca de lectura con cache, locale y
anti-enumeración.

## Criterios de aceptación

### CAD-088-01 — La API pública de QRMenu expone sólo capability y payload permitidos

endpoint, capability `MENU_READ` y payload permitido quedan definidos sin IDs internos, con
`name`, `slug` y `asOf` como metadata pública mínima del menú.

### CAD-088-02 — Los errores de token usan contrato uniforme y anti-enumeración

token inválido, ausente, vencido o revocado responde con contrato uniforme y resistente a
enumeración.

### CAD-088-03 — ETag, cache-control, locale y revision tienen semántica consistente

ETag y cache-control tienen semántica consistente en I0; locale y revision editorial más rica
se endurecen después cuando exista soporte autoritativo.

### CAD-088-04 — La autorización deriva sólo del token opaco

la API ignora scope aportado por cliente y deriva autorización sólo del token.

### CAD-088-05 — La surface pública no concede acciones fuera de MENU_READ

la surface pública no concede acciones de ordering, bill ni payment.

### CAD-088-06 — La aprobación exige evidencia de cache, rotación y localización

La aprobación exige fixtures de cache básica, anti-enumeración y aislamiento; rotación,
expiry observable y localización fuerte pueden endurecerse después.
