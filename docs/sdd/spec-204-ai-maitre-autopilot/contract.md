# Contrato IA — SPEC-204 Maitre Autopilot

Proponer acciones desde políticas allowlisted; por defecto requiere aprobación humana y toda
ejecución usa comando idempotente, límites, preview, auditoría y rollback/compensación. Nunca
gestiona secretos ni acciones fiscales o laborales irreversibles sin control explícito. Tests
cubren permisos, límites, doble ejecución, fallo parcial, kill switch, injection y aislamiento.
