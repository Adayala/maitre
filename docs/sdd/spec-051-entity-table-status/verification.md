# Verificación — SPEC-051

## Criterios

### CAD-051-01 — La proyección expone contexto completo y explicable del estado de mesa

- [ ] forma, referencias, revisiones y `asOf` son completos y coherentes.

### CAD-051-02 — La precedencia de señales es versionada y determinista

- [ ] cada combinación de señales respeta la precedencia versionada.

### CAD-051-03 — Occupancy activa domina la ocupación visible de la mesa

- [ ] Occupancy ACTIVE domina Reservation y distingue PAYING de OCCUPIED.

### CAD-051-04 — Señales stale o desordenadas no degradan la revisión autoritativa

- [ ] revisiones stale/desordenadas convergen o disparan refetch sin regresión.

### CAD-051-05 — Ninguna mutación toma la proyección como autoridad

- [ ] comandos ignoran la proyección como autoridad y revalidan sus fuentes.

### CAD-051-06 — La aprobación exige evidencia de precedencia, convergencia y aislamiento

- [ ] ventanas, límites temporales, limpieza, bloqueo, aislamiento y ausencia de writes
      directos quedan cubiertos.
