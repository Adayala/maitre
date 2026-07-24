# Reglas — SPEC-137

- `AUTHORIZED` nunca se edita ni cancela; se corrige con notas referenciadas.
- `VOIDED_DRAFT` sólo aplica a `DRAFT|VALIDATED` no autorizados.
- Identidad fiscal única incluye ambiente, entidad, POS, tipo y número.
- `PENDING_RECONCILIATION` representa ambigüedad, no rechazo definitivo.
- PII y datos fiscales se protegen incluso en borradores y retries.
