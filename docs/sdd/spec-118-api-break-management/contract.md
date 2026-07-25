# Contrato API — SPEC-118 Break Management

Ejecutar start/end de pausas y solicitar o aprobar correcciones sobre la jornada activa. Los
comandos son idempotentes, validan una única pausa abierta y aplican la política vigente sin
ocultar incumplimientos. El acceso propio se separa del acceso supervisor. Tests cubren
reintentos offline, clock-out con pausa, duración mínima, concurrencia, ajustes, RBAC,
auditoría y aislamiento entre tenants.

La separación de acceso implica dos representaciones: self-access consulta únicamente la propia
jornada/pausas y recibe ajustes redactados; supervisor access requiere permiso sensible y scope
válido para obtener vistas completas por sucursal, jornada o pausa.
