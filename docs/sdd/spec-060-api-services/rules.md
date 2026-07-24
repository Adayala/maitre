# Reglas — SPEC-060

- Business date usa timezone IANA de Branch.
- Overlap sigue ServicePeriodPolicy; default lo prohíbe.
- CLOSING bloquea nuevas Visits y reporta blockers.
- Timeout no falsifica CLOSED; force-close exige manager/reason.
- Tenant y actor derivan del contexto; Branch de ruta se valida contra el scope autorizado.
- No existe PATCH de status ni DELETE; todas las transiciones usan comandos.
- Create rechaza timezone/businessDate autoritativos enviados por el cliente.
- `404` oculta scope, `409` expresa overlap/conflicto, `412` revisión y `422` transición o
  blockers de cierre.
- Los blockers se limitan por tipo/cantidad y nunca exponen Guest ni datos financieros.
- La transición y el outbox se confirman atómicamente.
