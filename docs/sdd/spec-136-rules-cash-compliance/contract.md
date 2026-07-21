# Contrato de reglas — SPEC-136 Cash Compliance

Evaluar sesiones, movimientos, descuentos y reconciliaciones mediante políticas versionadas
de límites, evidencia, segregación y retención. Cada finding es explicable, identifica regla y
versión, y tiene severidad INFO/WARNING/BLOCKING; ninguna regla elimina registros del ledger.
Tests cubren fraccionamiento de importes, diferencias reiteradas, autoaprobación, excepciones
documentadas, cambios de política, datos incompletos y comportamiento seguro por defecto.
