# Reglas — SPEC-144

- Create/issue son idempotentes por intención lógica.
- Mutaciones sobre draft requieren control optimista.
- AUTHORIZED nunca se muta; correcciones usan documentos derivados.
- Timeout ambiguo obliga reconciliación antes de nueva numeración.
- Datos sensibles y diagnósticos del proveedor se redactan según permiso.
