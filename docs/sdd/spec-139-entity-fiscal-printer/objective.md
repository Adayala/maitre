# Objetivo — SPEC-139

Definir FiscalPrinter como adapter/capability opcional por Branch sin autoridad sobre Invoice,
numeración ni autorización fiscal.

## Criterios de aceptación

### CAD-139-01 — Identidad, scope, provider y capabilities del dispositivo quedan definidos con claridad

identidad, scope, provider/model/capabilities y estado del dispositivo quedan definidos con
claridad.

### CAD-139-02 — Secretos, SDK state y credenciales quedan fuera del dominio

secretos, SDK state y credenciales quedan explícitamente fuera del dominio.

### CAD-139-03 — Health snapshot y config versioning soportan operación degradada auditable

health snapshot y config versioning permiten operación degradada auditable.

### CAD-139-04 — El dispositivo no adquiere autoridad sobre Invoice ni autorización fiscal

el dispositivo no es autoridad de Invoice, numeración ni autorización ARCA/WSFE.

### CAD-139-05 — Offline o retiro con trabajos pendientes sigue un flujo explicable

retiro/offline con trabajos pendientes produce jobs explicables sin romper la
representación digital mínima cuando la norma lo permita.

### CAD-139-06 — La aprobación exige evidencia de stale health, retiro y rotación

La aprobación exige fixtures de unicidad, health stale, retiro, rotación de configuración,
autorización y aislamiento.
