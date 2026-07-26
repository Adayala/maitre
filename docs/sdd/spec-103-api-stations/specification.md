# Especificación — SPEC-103 Stations API

CRUD acotado de configuración y commands `activate`, `deactivate`. `code` es único por Branch. El
I0 actual no implementa `If-Match` ni `publish-routing`.

`deactivate` exige que no existan Commands no terminales asignados a la Station. El I0 actual no
implementa plan de transferencia atómica: simplemente rechaza la desactivación mientras exista
trabajo activo. No hay borrado duro ni archivado separado.

El surface incluye create/list/detail/update de configuración, más comandos explícitos
`activate` y `deactivate`. No existe borrado duro para Stations con historia operativa.

Las lecturas respetan scope `tenantId/brandId/branchId`; detail fuera de scope usa `404` y las
colecciones filtran antes de paginar. Los writes I0 no usan `If-Match` ni revisión esperada para
proteger lost updates. `code` debe ser único dentro de la Branch.

La RoutingPolicy versionada queda diferida: hoy el routing real se simplifica a station explícita o
primer Station activo de la Branch según el módulo kitchen. `deactivate` valida únicamente ausencia
de Commands no terminales bajo ownership de la Station.
