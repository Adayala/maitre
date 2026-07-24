# Verificación — SPEC-084

## Criterios

### CAD-084-01 — La capability QRMenu es opaca, revocable y hasheada at rest

- [ ] capability opaca usa hashing, vigencia, revocación y rotación aprobadas.

### CAD-084-02 — La resolución expone sólo menú publicado autorizado

- [ ] la resolución ignora el alcance del cliente y sólo expone menú publicado autorizado.

### CAD-084-03 — Los errores públicos son uniformes y anti-enumeración

- [ ] inválido/vencido/revocado/ausente responde sin enumeración útil.

### CAD-084-04 — Cache, locale y revision tienen semántica consistente

- [ ] locale, cache y revisión convergen tras rotación sin fuga de alcance.

### CAD-084-05 — QRMenu no concede poderes fuera de MENU_READ

- [ ] capability MENU_READ no sirve para order, bill ni payment.

### CAD-084-06 — La aprobación exige evidencia de entropía, replay y rotación

- [ ] fixtures cubren entropía, replay, expiry, cache y aislamiento entre alcances.
