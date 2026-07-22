# Contrato de entidad — SPEC-190 Alert

Alerta definida por métrica, condición, ventana, severidad, cooldown, destinatarios y estado.
Cada activación conserva inputs y versión de regla; deduplicación evita tormentas y acknowledge
no altera evidencia. Tests cubren umbrales, datos faltantes, cooldown, recuperación,
escalamiento, timezone y aislamiento.
