# Especificación — SPEC-089 Order Modifications API

Comandos tipados `add-item`, `change-quantity`, `cancel-quantity` y `replace-modifiers` crean un
OrderAdjustment `PENDING`. Una saga coordina Order, KitchenTicket y Check:

1. valida revisión, catálogo, permiso y estado productivo;
2. reserva/aplica el delta en Order;
3. entrega command idempotente a Kitchen y actualiza Check;
4. termina `APPLIED` o `REJECTED`; una falla parcial queda `COMPENSATION_REQUIRED`.

Items READY/DELIVERED o pagos iniciados requieren permiso de excepción y compensación explícita.
Nunca se reescribe el snapshot original. Cada estado conserva actor, motivo, delta y correlación.
