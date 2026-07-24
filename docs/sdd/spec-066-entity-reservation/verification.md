# Verificación — SPEC-066

## Criterios

### CAD-066-01 — Reservation conserva identidad de scope, ventana y políticas aplicadas

- [ ] scope, intervalo, partySize, source y policies inválidos se rechazan.

### CAD-066-02 — El lifecycle de Reservation es cerrado y explícito

- [ ] matriz completa de transiciones y terminales es determinista.

### CAD-066-03 — Confirm consume capacidad con revalidación atómica y concurrente

- [ ] confirmaciones concurrentes nunca sobreasignan capacidad.

### CAD-066-04 — Las salidas terminales liberan capacidad exactamente una vez

- [ ] cancel/expire/no-show y outbox liberan exactamente una vez.

### CAD-066-05 — Seating vincula una única Visit sin delegar autoridad en proyecciones

- [ ] seating revalida autoridad y vincula una única Visit.

### CAD-066-06 — La aprobación exige evidencia temporal, concurrente y de privacidad

- [ ] DST, retries, revisión, reconfirmación, PII y aislamiento poseen evidencia.
