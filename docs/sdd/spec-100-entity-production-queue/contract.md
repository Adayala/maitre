# Contrato — SPEC-100 ProductionQueue

ProductionQueue es proyección ordenada de Commands por Station, no lista editable. Orden
determinista combina priority reason, promised time, receivedAt e id. Incluye revision/asOf
y freshness. Repriorizar es comando autorizado/auditado, no PATCH de posiciones. Eventos
duplicados/desordenados convergen; rebuild desde fuentes es posible. Tests cubren ties,
stale views, reprioritization, cancellation y tenant/branch isolation.
