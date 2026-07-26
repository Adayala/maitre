# Contrato API — SPEC-093 Special Requests

Registrar solicitudes especiales tipadas y texto opcional sobre una reserva, visita u orden,
con lifecycle `PENDING -> ACCEPTED | REJECTED | FULFILLED`. El texto se normaliza y sanitiza de
forma mínima, no reemplaza el modelado de alérgenos y requiere confirmación operativa antes de
mostrarse como aceptado/cumplido. I0 no materializa consentimiento, visibilidad por rol,
retención de PII ni redacción automática. Tests cubren normalización/longitud, transiciones
inválidas, review permission y aislamiento entre tenants.
