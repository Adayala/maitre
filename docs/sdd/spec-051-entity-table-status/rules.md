# Rules — SPEC-051

- Es derivado y no posee comandos de escritura.
- La precedencia contractual es `BLOCKED > PAYING > OCCUPIED > CLEANING > RESERVED >
  AVAILABLE`.
- `PAYING` sólo describe una Occupancy ACTIVE cuya Visit está `CLOSING`.
- RESERVED usa la ventana de una CapacityPolicyVersion explícita y nunca desplaza una
  Occupancy ACTIVE.
- El cálculo es determinista para las mismas fuentes, revisiones y `asOf`.
- Datos stale, incompletos o desordenados se exponen o fuerzan refetch; no se presentan como
  frescos.
- Cualquier TTL requiere una política aprobada y evidencia de frescura; no se fija por
  conveniencia de implementación.
