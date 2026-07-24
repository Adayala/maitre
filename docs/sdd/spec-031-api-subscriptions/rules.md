# Reglas — SPEC-031

- Provisioning cross-tenant requiere capability temporal/de plataforma y auditoría.
- Cambios con alcance tenant requieren permisos de SPEC-036; OWNER nominal no reemplaza capability.
- Status/items/período cumplen ciclo de vida, catálogo, alcance y concurrencia.
- Reducción bajo consumo no se activa silenciosamente: entra remediation.
- Mutación y solicitud de recomputación/outbox son atómicas.
- No existe charge, refund, proration ni billing side effect en este contrato.
