# Especificación — SPEC-141 FiscalQrCode

Derivado únicamente de Invoice AUTHORIZED. Guarda format/normative version, canonical payload,
hash y invoice reference. La misma Invoice/version produce bytes idénticos.

Campos, encoding, URL y límites provienen del NormativeSourceRegistry; no se aceptan payloads del
cliente. CAE y datos fiscales se incluyen sólo como exige el formato, nunca secrets. Cambio oficial
crea nueva versión de renderer y fixtures, sin mutar representaciones históricas.

FiscalQrCode referencia exactamente una Invoice `AUTHORIZED` y conserva `formatVersion`,
`normativeVersion`, `canonicalPayload`, `payloadHash`, `invoiceRef` y metadata de validación o
rendering. El mismo input fiscal y la misma versión normativa deben producir una representación
idéntica bit a bit.

El `NormativeSourceRegistry` define campos, orden, encoding, URL base, límites de longitud y reglas
de serialización. El cliente nunca aporta el payload fiscal autoritativo. CAE, fechas y demás datos
fiscales sólo se incluyen en la forma mínima exigida por la norma; secretos, tokens o credenciales
nunca forman parte del QR.
