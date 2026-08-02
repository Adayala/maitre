# Verificación — SPEC-145

## Criterios

### CAD-145-01 — El adapter separa homologación y producción sin contaminación cruzada

- [x] homologación y producción quedan separadas por credenciales y endpoints;
- [ ] el runbook productivo y su aprobación permanecen pendientes.

### CAD-145-02 — La identidad lógica de emisión garantiza idempotencia y reconciliación

- [x] el adapter consulta numeración oficial y reconcilia resultados ambiguos;
- [ ] la coordinación distribuida cross-instance permanece pendiente.

### CAD-145-03 — Resultados oficiales se normalizan con códigos y evidencia auditables

- [x] resultados oficiales se normalizan con códigos y evidencia auditables.

### CAD-145-04 — Secretos, certificados y raw SOAP quedan fuera de browser y APIs no privilegiadas

- [x] los boundaries y tests evitan exponer secretos, certificados y raw SOAP en browser/logs.

### CAD-145-05 — Libro IVA Digital queda acotado a export validado y presentación asistida

- [ ] Libro IVA queda acotado a exportación validada y presentación asistida.

### CAD-145-06 — La aprobación exige evidencia de auth, timeout ambiguo y export IVA

- [x] auth WSAA y `FEDummy` cuentan con evidencia de homologación;
- [ ] la matriz completa de emisión, timeout ambiguo, tablas, export IVA y operación sigue abierta.
