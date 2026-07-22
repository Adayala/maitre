# Contrato API — SPEC-148 Invoice Templates

Crear, previsualizar, versionar, publicar y desactivar plantillas de comprobante. Preview usa
fixtures sintéticos y no datos productivos; publish valida variables permitidas, contenido
fiscal obligatorio, sanitización y accesibilidad mínima. If-Match protege edición. Tests
cubren XSS, variables desconocidas, concurrencia, fallback, localización, RBAC, auditoría y
aislamiento entre tenants.
