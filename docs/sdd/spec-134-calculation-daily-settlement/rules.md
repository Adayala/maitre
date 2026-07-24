# Rules — SPEC-134

- El cálculo es puro y no muta ledger ni reconciliaciones.
- Se calcula por currency y no netea monedas entre sí.
- Reconciliación con Payment usa identidades de fuente explícitas.
- Resultados cerrados/exportados no se reescriben; recálculo crea nueva versión.
- Input hash, cutoffs y revisiones son obligatorios para reproducibilidad.
