# Contrato de integración — SPEC-145

## Alcance

Adapter server-side para servicios fiscales ARCA. Primera capacidad: autorización WSAA y
emisión/consulta de comprobantes WSFEv1. Libro IVA Digital se limita a exportación validada
y presentación humana asistida mientras no exista API pública oficial comprobada.

## Puertos

- `FiscalAuthorizationPort`: obtiene/reutiliza ticket de acceso con expiración segura.
- `ElectronicInvoicePort`: último autorizado, solicitud CAE, consulta y constatación.
- `VatBookExportPort`: genera archivos/versiones según diseño oficial vigente.

Dominio/aplicación no dependen de SOAP, SDK propietario, filesystem local ni Vercel.

## Credenciales

Certificado/clave se almacenan en secret manager, cifrados y fuera de Git/DB/logs. Se
referencian por `certificateRef`, ambiente y CUIT autorizado. Rotación, expiración y clock
skew son observables. Homologación y producción usan credenciales/endpoints separados; una
preview nunca accede a autoridad fiscal productiva.

## Emisión

Entrada: fiscal entity/point of sale, tipo/número, concepto, documento receptor, fechas,
currency, totals/taxes y referencia idempotente. Antes de enviar se valida snapshot fiscal,
numeración y ecuaciones. Una solicitud ambigua por timeout se reconcilia consultando ARCA;
nunca se asigna un nuevo número a ciegas.

Salida normalizada: `AUTHORIZED` con CAE/vencimiento, `REJECTED` con códigos sanitizados o
`PENDING_RECONCILIATION`. Request/response SOAP crudos tienen acceso/retención restringidos.

## Idempotencia y concurrencia

Clave lógica: fiscalEntity + pointOfSale + voucherType + internalInvoiceId. Numeración se
serializa/coordina y se reconcilia con último autorizado. Retries usan la misma intención;
duplicados no generan dos comprobantes. Correcciones fiscales se modelan como nota de
crédito/débito, no mutación del comprobante autorizado.

## Libro IVA

Export genera archivos deterministas con versión de layout, período, manifest, conteos,
totales y hash. Valida reconciliación contra comprobantes y no declara presentación exitosa.
La acción humana y acuse quedan registrados separadamente cuando corresponda.

## Errores y observabilidad

Errores se clasifican validation, auth/certificate, transport, ARCA rejection, rate/timeout
y reconciliation. Logs incluyen correlation, CUIT/CAE redactados, operación, latencia y
código; jamás certificado, clave, ticket o payload personal completo. Circuit breaker/retry
no reintenta rechazos deterministas.

## Aceptación

- Fixtures SOAP oficiales/sanitizadas para éxito, rechazo y faults.
- Homologación prueba auth, emisión, consulta, timeout ambiguo y numeración concurrente.
- Totales/impuestos y export IVA se reconcilian byte/dato de forma determinista.
- Secrets no aparecen en browser, Git, logs ni artifacts.
- Adapter puede reemplazarse y ejecutarse fuera de Vercel.
- Producción permanece bloqueada hasta revisión fiscal competente, credenciales y runbook.
