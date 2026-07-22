# Especificación — SPEC-171 Feedback RBAC

Permisos separados: `feedback.submit`, `case.read/manage`, `content.read`, `pii.read`, `redact`,
`export`; `reputation.aggregate.read`; `sentiment.run/model.manage`; `review_connector.manage`.

GUEST usa capability para submit; `customer`, `staff` y `reputation analyst` no son roles locales.
MANAGER u otros roles reciben assignments por branch/purpose. Texto/PII se deniega por default;
export exige step-up/audit. Model/connector admin no implica leer contenido.
