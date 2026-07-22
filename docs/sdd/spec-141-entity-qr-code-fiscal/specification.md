# Especificación — SPEC-141 FiscalQrCode

Derivado únicamente de Invoice AUTHORIZED. Guarda format/normative version, canonical payload,
hash y invoice reference. La misma Invoice/version produce bytes idénticos.

Campos, encoding, URL y límites provienen del NormativeSourceRegistry; no se aceptan payloads del
cliente. CAE y datos fiscales se incluyen sólo como exige el formato, nunca secrets. Cambio oficial
crea nueva versión de renderer y fixtures, sin mutar representaciones históricas.
