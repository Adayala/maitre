# Verificación — SPEC-064

## Criterios

### CAD-064-01 — El registry admite sólo los eventos aprobados de billing check

- [ ] registry rechaza CheckGenerated y namespaces/nombres no aprobados.

### CAD-064-02 — Cada evento conserva trigger, partition y revisión exactos

- [ ] open, cada adjustment y settle producen el schema/revisión correspondiente.

### CAD-064-03 — Los schemas monetarios exponen sólo el detalle necesario

- [ ] golden fixtures verifican importes, totales, schemas y redacción.

### CAD-064-04 — CheckSettled se publica sólo con liquidación comercial completa

- [ ] balance no cero o Payment ambiguo impide CheckSettled.

### CAD-064-05 — Los eventos de Check no implican autoridad fiscal ni datos sensibles

- [ ] consumidores fiscales no infieren Invoice ni mutan sin revalidar.

### CAD-064-06 — La aprobación exige evidencia monetaria, de compatibilidad y aislamiento

- [ ] duplicate, reorder, gap, replay, compatibilidad y routing poseen evidencia.
