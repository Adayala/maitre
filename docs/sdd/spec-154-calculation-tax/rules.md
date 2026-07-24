# Reglas — SPEC-154

- Es una función pura y determinística.
- Importes del cliente no son autoridad fiscal.
- Se usa decimal exacto; no floats.
- Créditos/débitos respetan snapshot original y semántica de signo.
- Totales por línea/tasa/documento deben reconciliar exactamente.
