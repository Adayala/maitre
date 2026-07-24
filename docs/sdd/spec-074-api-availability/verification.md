# Verificación — SPEC-074

## Criterios

### CAD-074-01 — Availability expone una única lectura con inputs allowlisted

- [ ] OpenAPI rechaza campos sensibles, texto libre e inputs fuera de límite.

### CAD-074-02 — Cada slot declara metadata temporal, revisiones y freshness

- [ ] slots exponen metadata/reasons completos sin causas identificables.

### CAD-074-03 — Igual input y revisión producen resultado determinista

- [ ] misma entrada/asOf/revisiones produce el mismo resultado.

### CAD-074-04 — La consulta no consume capacidad ni maquilla estado desactualizado como fresco

- [ ] query deja ledger intacto y un estado desactualizado no autoriza confirmación.

### CAD-074-05 — La respuesta evita inferencias explotables sobre capacidad o identidad

- [ ] Membership/capability, `404`, rate y granularidad resisten enumeración.

### CAD-074-06 — La aprobación exige evidencia temporal, de privacidad y performance

- [ ] DST, buffers, combinaciones, cache/gaps, performance y aislamiento poseen evidencia.
