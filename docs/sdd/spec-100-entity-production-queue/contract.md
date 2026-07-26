# Contrato — SPEC-100 ProductionQueue

ProductionQueue es proyección ordenada de Commands por Station, no lista editable. Orden
determinista combina `priority`, `receivedAt` e `id`. I0 expone sólo `stationId`, `commands` y
`asOf`; no incluye revision/cursor/freshness. Repriorizar es comando autorizado/auditado, no PATCH
de posiciones. La queue se reconstruye desde Commands no terminales de la station. Tests cubren
ties, reprioritization y aislamiento por tenant/station.
