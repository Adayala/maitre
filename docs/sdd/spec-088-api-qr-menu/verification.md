# Verificación — SPEC-088

## Criterios

### CAD-088-01 — La API pública de QRMenu expone sólo capability y payload permitidos

- [ ] endpoint y payload público excluyen IDs y datos internos.

### CAD-088-02 — Los errores de token usan contrato uniforme y anti-enumeración

- [ ] capability inválida/vencida/revocada usa respuesta anti-enumeración estable.

### CAD-088-03 — ETag, cache-control, locale y revision tienen semántica consistente

- [ ] ETag, locale y cache convergen con revisión/rotación aprobadas.

### CAD-088-04 — La autorización deriva sólo del token opaco

- [ ] el alcance del cliente no influye en la resolución.

### CAD-088-05 — La superficie pública no concede acciones fuera de MENU_READ

- [ ] la API no habilita order, bill ni payment.

### CAD-088-06 — La aprobación exige evidencia de cache, rotación y localización

- [ ] fixtures cubren replay, expiry, cache y aislamiento entre sucursales.
