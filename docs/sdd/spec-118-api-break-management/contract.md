# Contrato API — SPEC-118 Break Management

Ejecutar start/end de pausas y solicitar o aprobar correcciones sobre la jornada activa. Los
comandos son idempotentes, validan una única pausa abierta y aplican la política vigente sin
ocultar incumplimientos. El acceso propio se separa del acceso supervisor. Tests cubren
reintentos offline, clock-out con pausa, duración mínima, concurrencia, ajustes, RBAC,
auditoría y aislamiento entre tenants.
