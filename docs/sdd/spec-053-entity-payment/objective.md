# Objetivo — SPEC-053

## Propósito

Payment registra un intento de cobro contra una revisión concreta de Check y conserva su
resultado reconciliable sin almacenar credenciales ni datos sensibles del instrumento.

## Resultado esperado

### CAD-053-01 — Payment conserva identidad de cobro y contexto reconciliable completos

Cada Payment identifica Check/revisión, tenant, Branch, amount, currency, tip separado,
method e identidad idempotente coherentes.

### CAD-053-02 — El lifecycle de cobro distingue estados operativos sin regresiones arbitrarias

El ciclo distingue pendiente, autorizado, conciliación ambigua, capturado, fallido y
void sin regresiones arbitrarias.

### CAD-053-03 — Los límites monetarios de captura y refund quedan explícitos

Capturas netas de Refund no exceden balance más propina autorizada.

### CAD-053-04 — La integración con proveedor converge por identidad y revisión

Operaciones y callbacks del proveedor se deduplican y eventos desordenados convergen por
identidad y revisión.

### CAD-053-05 — Los métodos de pago no retienen secretos y coordinan efectos colaterales exactos

CASH genera exactamente un CashMovement; ningún método almacena PAN, CVV, credenciales ni
payloads sensibles.

### CAD-053-06 — La aprobación exige evidencia de conciliación, redacción y aislamiento

La aprobación exige fixtures de retry, timeout ambiguo, captura parcial, refund,
conciliación, redacción y aislamiento.
