# Especificación — SPEC-156 Fiscal Compliance

NormativeSourceRegistry guarda organismo, documento/URL, fecha de consulta, effective dates, hash,
reviewer fiscal, approval, supersession, alert y fixtures. QR, tax, layouts, voucher codes y rules
referencian una versión; unsupported/expired bloquea emisión segura.

Validación pre/post issue cubre campos, ecuaciones, numbering, authorization, notes y Libro IVA.
Finding conserva rule/source version y evidencia redactada. Ningún override fabrica autorización.
Producción permanece bloqueada sin revisión competente, homologación y runbook vigente.

El marco de compliance separa hallazgos informativos de bloqueos críticos. Las reglas críticas
detienen emisión, numeración o export cuando la normativa aplicable no puede demostrarse vigente y
aprobada. Las reglas informativas pueden generar alertas o trabajo pendiente sin permitir que un
operador promueva artificialmente un comprobante a estado autorizado.

La operación productiva requiere evidencia vigente de homologación, revisión fiscal competente,
catálogo normativo actualizado y runbook operativo. Cambios de normativa no reescriben historia:
crean nuevas source versions, nuevas fixtures y nuevas reglas/materializaciones hacia adelante.
