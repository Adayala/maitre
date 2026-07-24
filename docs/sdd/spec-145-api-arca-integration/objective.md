# Objetivo — SPEC-145

Definir el conector fiscal oficial con ARCA como boundary multi-tenant, idempotente y auditable para
autorización electrónica, consulta y reconciliación tributaria sin depender de scraping.

## Criterios de aceptación

### CAD-145-01 — El adapter separa homologación y producción sin contaminación cruzada

el adapter separa homologación y producción por credenciales, endpoints, secretos y
runbooks, sin contaminación cruzada.

### CAD-145-02 — La identidad lógica de emisión garantiza idempotencia y reconciliación

la identidad lógica de emisión queda definida por environment, fiscal entity, point of
sale, voucher type e internal invoice, garantizando idempotencia y reconciliación.

### CAD-145-03 — Resultados oficiales se normalizan con códigos y evidencia auditables

resultados oficiales se normalizan en `AUTHORIZED`, `REJECTED` o
`PENDING_RECONCILIATION`, preservando códigos y evidencia auditables.

### CAD-145-04 — Secretos, certificados y raw SOAP quedan fuera de browser y APIs no privilegiadas

certificados, private keys, TA/tokens y SOAP raw payloads quedan fuera de browser, logs
generales y APIs no privilegiadas.

### CAD-145-05 — Libro IVA Digital queda acotado a export validado y presentación asistida

Libro IVA Digital queda especificado como exportación validada y presentación humana
asistida mientras no exista API pública oficial confirmada.

### CAD-145-06 — La aprobación exige evidencia de auth, timeout ambiguo y export IVA

La aprobación exige fixtures de auth, emisión, timeout ambiguo, consulta, tablas
paramétricas, export IVA y controles de seguridad/operación.
