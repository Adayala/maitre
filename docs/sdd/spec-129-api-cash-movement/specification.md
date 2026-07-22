# Especificación — SPEC-129 Cash Movements API

Create/list y command `compensate`. Create exige session OPEN, type allowlisted, amount positivo,
currency coincidente, idempotency key y source reference cuando corresponda. Tenant/register/actor
se derivan del contexto.

No existen update/delete. Límites y tipos manuales se validan mediante LimitsPolicy; ausencia de
policy deniega operaciones riesgosas. Compensate crea movimiento inverso enlazado, con reason y
aprobación según threshold. Integraciones de Payment usan una identidad de source única.
