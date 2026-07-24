# Objetivo — SPEC-140

Definir FiscalCertificate como metadata + secret reference por CUIT/service/environment con
rotación, expiración y separación estricta del material criptográfico.

## Criterios de aceptación

### CAD-140-01 — Identidad por CUIT/service/environment, fingerprint e issuer queda definida sin ambigüedad

identidad por CUIT/service/environment, fingerprint, issuer y vigencia quedan definidos sin
ambigüedad.

### CAD-140-02 — Material criptográfico y tickets quedan fuera de DB, Git, logs y respuestas

private key, cert material, CMS y tickets quedan explícitamente fuera de DB, Git, logs y
respuestas.

### CAD-140-03 — Secret adapter aplica least privilege, audit, backup y rotation trazables

secret adapter aplica least privilege, audit, backup y rotation model trazables.

### CAD-140-04 — Homologation y production permanecen estrictamente separadas

homologation y production permanecen separadas en identidades, proyectos y referencias
secretas.

### CAD-140-05 — Expiración o revocación bloquean nuevas solicitudes; rotación soporta overlap

expiración/revocación bloquea nuevas solicitudes, mientras la lectura histórica se
preserva; rotación soporta overlap y rollback controlados.

### CAD-140-06 — La aprobación exige evidencia de expiración, rotación y revocación

La aprobación exige fixtures de expiración, overlap de rotación, ambiente, revocación, skew
y aislamiento.
