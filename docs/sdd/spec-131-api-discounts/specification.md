# Especificación — SPEC-131 Discounts API

CRUD de DRAFT, publish/version/deactivate, evaluate y command `apply`. Sólo roles de policy pueden
publicar; operadores aplican versiones ya publicadas. Evaluate es explicable y no reserva uso.

Apply revalida Check/Order revision, eligibility, stacking, caps y usage dentro de una transacción,
calcula server-side y crea DiscountApplication + actualización de Check + outbox. Override requiere
permiso separado, reason y approval threshold. Importes del cliente se rechazan.

El surface incluye create/list/detail/update sólo sobre borradores, más comandos explícitos
`publish`, `version`, `deactivate`, `evaluate` y `apply`. No existe edición destructiva de una
versión publicada; cualquier cambio material genera nueva versión o desactivación controlada.

`evaluate` devuelve desglose explicable de elegibilidad, exclusiones, stacking, caps y límites sin
reservar uso ni mutar estado. `apply` revalida `Order` o `Check` revision, usage limits, vigencia,
timezone, caps y stacking dentro de una sola transacción, creando `DiscountApplication`,
actualizando el total dependiente y publicando outbox consistente.

Si el actor usa override, la API exige permission separada, reason y approval threshold según
policy. Importes, bases elegibles o montos netos aportados por el cliente se ignoran o rechazan;
el cálculo vive íntegramente del lado del servidor.
