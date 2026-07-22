# Contrato de entidad — SPEC-111 WorkShift

WorkShift representa una ventana laboral planificada de una sucursal con inicio, fin, timezone,
rol requerido, capacidad y estado DRAFT/PUBLISHED/IN_PROGRESS/COMPLETED/CANCELLED. Sus
intervalos usan instantes UTC y conservan la zona de negocio; publicar congela la versión
operativa y cambios posteriores quedan auditados. Invariantes cubren rango positivo,
solapamientos permitidos por política, concurrencia y aislamiento tenant/branch. Es distinta de
ServicePeriod y sólo se vincula mediante ID explícito.
