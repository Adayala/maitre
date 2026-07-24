# Especificación — SPEC-171 Feedback RBAC

Permisos separados: `feedback.submit`, `case.read/manage`, `content.read`, `pii.read`, `redact`,
`export`; `reputation.aggregate.read`; `sentiment.run/model.manage`; `review_connector.manage`.

GUEST usa capability para submit; `customer`, `staff` y `reputation analyst` no son roles locales.
MANAGER u otros roles reciben assignments por sucursal/propósito. Texto/PII se deniega por default;
export exige step-up/audit. Model/connector admin no implica leer contenido.

El control de acceso sigue deny-by-default y combina alcance organizacional con propósito de uso cuando
corresponde. Un actor puede gestionar el caso (`case.manage`) sin poder leer el contenido completo o
la identidad opcional si no posee permisos adicionales. Los agregados reputacionales pueden estar
visibles para ciertos usuarios sin habilitar drill-down a texto o PII.

Las capabilities públicas de submit son un mecanismo separado del RBAC autenticado interno. Los logs,
exports y herramientas de soporte deben respetar la misma segmentación de permisos que las APIs
primarias, evitando canales laterales de acceso a PII o contenido sensible.
