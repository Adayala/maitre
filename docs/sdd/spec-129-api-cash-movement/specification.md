# Especificación — SPEC-129 Cash Movements API

Create/list y command `compensate`. Create exige session OPEN, type allowlisted, amount positivo,
currency coincidente, idempotency key y source reference cuando corresponda. Tenant/register/actor
se derivan del contexto.

No existen update/delete. Límites y tipos manuales se validan mediante LimitsPolicy; ausencia de
policy deniega operaciones riesgosas. Compensate crea movimiento inverso enlazado, con reason y
aprobación según threshold. Integraciones de Payment usan una identidad de source única.

El servidor deriva `tenantId`, `brandId`, `branchId`, `cashRegisterId`, `cashSessionId` y `actor`
desde el contexto autorizado o de la referencia de sesión. El cliente nunca envía esos scopes como
autoridad principal. Detail fuera de scope usa `404`; collections filtran antes de paginar.

`create` sólo acepta tipos permitidos por policy y estado de sesión compatible. La currency debe
coincidir con la de la sesión; el amount es decimal positivo y la semántica económica vive en el
tipo/direction resultante. Operaciones manuales de alto riesgo dependen de `LimitsPolicy`; si falta
policy, la API falla cerrado en lugar de estimar tolerancias.

`compensate` no deshace físicamente el movimiento original: crea un movimiento inverso enlazado con
reason, actor y approval cuando corresponde. Para integraciones con Payment, `sourceReference` e
identidad de origen son la base de deduplicación económica.
