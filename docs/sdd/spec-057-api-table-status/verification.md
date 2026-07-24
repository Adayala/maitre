# Verificación — SPEC-057

## Criterios

### CAD-057-01 — La proyección expone únicamente lecturas aprobadas por Branch y Table

- [ ] OpenAPI contiene sólo las dos lecturas aprobadas.

### CAD-057-02 — Cada representación conserva explicabilidad, revisión y frescura

- [ ] forma, reason, redacción, revisiones, `asOf` y freshness son coherentes.

### CAD-057-03 — Paginación y conditional GET mantienen orden y scope estables

- [ ] filtros, cursor, límite, ETag y `304` son estables.

### CAD-057-04 — El lag o las dependencias parciales nunca fabrican disponibilidad

- [ ] eventos duplicados/tardíos convergen;
- [ ] gap obliga refetch y polling funciona como fallback sin fabricar AVAILABLE.

### CAD-057-05 — La proyección no expone PII ni se usa como superficie de escritura

- [ ] no existe escritura ni PII y toda acción revalida autoridad.

### CAD-057-06 — La aprobación exige evidencia de precedencia, fallback y privacidad

- [ ] precedencia completa, ventanas DST, dependencias parciales, privacidad y aislamiento
      poseen fixtures deterministas.
