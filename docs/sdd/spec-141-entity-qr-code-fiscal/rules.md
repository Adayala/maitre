# Reglas — SPEC-141

- Sólo se deriva de Invoice AUTHORIZED.
- Canonical payload y renderer deben ser determinísticos.
- Cliente no aporta payload fiscal autoritativo.
- CAE y datos fiscales incluidos siguen el formato oficial; secretos quedan fuera.
- Cambios oficiales generan nuevas versiones de renderer/fixtures sin mutar historia.
