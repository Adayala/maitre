# Contrato de evento — SPEC-120 ShiftEnded

Publicar mediante outbox al completar o cerrar administrativamente un turno. El sobre
versionado incluye eventId, occurredAt, tenantId, branchId, shiftId, outcome y agregados no
personales; no incluye fichadas individuales ni datos salariales. Tests cubren jornadas aún
abiertas, cierre forzado, reintento, duplicados, reordenamiento, compatibilidad, correlación y
aislamiento entre tenants.
