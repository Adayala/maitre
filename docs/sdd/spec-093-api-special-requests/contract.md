# Contrato API — SPEC-093 Special Requests

Registrar solicitudes especiales tipadas y texto opcional sobre una reserva, visita u orden,
con consentimiento y visibilidad limitada por rol. El texto se normaliza y sanitiza, no
reemplaza el modelado de alérgenos y requiere confirmación operativa antes de mostrarse como
aceptado. Tests cubren contenido malicioso, longitud, cambios concurrentes, rechazo,
auditoría, retención de PII y aislamiento entre tenants.
