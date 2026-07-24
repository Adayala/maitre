# Especificación — SPEC-146 Fiscal Printers API

Register/list/configure-by-secret-reference/activate/test/retire. No recibe ni devuelve secretos.
Test usa capability allowlisted, timeout/límites y nunca emite comprobante real.

Retire exige cero jobs pendientes o migración explícita. Errores del proveedor se normalizan y no cambian
Invoice/numeración. El endpoint sólo existe si la capability está habilitada; ausencia de printer no
bloquea emisión electrónica general.

`POST /fiscal-printers` registra un dispositivo lógico con tenant, fiscal entity, sucursal, modelo,
capabilities y estado inicial; `GET /fiscal-printers` lista inventario y salud redactada; `POST
/fiscal-printers/{printerId}:configure` asocia referencias a secretos y parámetros operativos
allowlisted; `:activate`, `:test` y `:retire` gestionan el lifecycle del recurso.

La API modela printers como integración opcional y local: si una sucursal no posee dispositivo o si el
proveedor está degradado, el flujo de factura electrónica general puede continuar por otros canales
habilitados. Errores usan `404` para scope ajeno, `409` para conflictos de lifecycle/cola pendiente,
`412` para revisión obsoleta y `422` para configuraciones incompatibles con capabilities permitidas.
