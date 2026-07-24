# Objetivo — SPEC-084

Definir QRMenu como capability pública opaca para lectura de menú publicado con aislamiento,
rotación y anti-enumeración.

## Criterios de aceptación

### CAD-084-01 — La capability QRMenu es opaca, revocable y hasheada at rest

token/capability, alcance, vigencia, revocación y rotación quedan definidos con opacidad y
hashing at rest.

### CAD-084-02 — La resolución expone sólo menú publicado autorizado

la resolución devuelve sólo menú publicado autorizado y no depende de IDs aportados por el
cliente.

### CAD-084-03 — Los errores públicos son uniformes y anti-enumeración

respuestas para ausente, vencido, revocado o inválido son uniformes y resistentes a
enumeración.

### CAD-084-04 — Cache, locale y revision tienen semántica consistente

cache, locale, revisión y rotación tienen semántica consistente y no filtran alcance.

### CAD-084-05 — QRMenu no concede poderes fuera de MENU_READ

QRMenu no concede capacidades de ordering, bill o payment fuera de su propósito.

### CAD-084-06 — La aprobación exige evidencia de entropía, replay y rotación

La aprobación exige fixtures de entropía, replay, expiry, rotación, cache y aislamiento.
