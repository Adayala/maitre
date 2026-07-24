# Verificación — SPEC-140

## Criterios

### CAD-140-01 — Identidad por CUIT/service/environment, fingerprint e issuer queda definida sin ambigüedad

- [ ] identidad, fingerprint, issuer y vigencia quedan trazables por ambiente/servicio.

### CAD-140-02 — Material criptográfico y tickets quedan fuera de DB, Git, logs y respuestas

- [ ] material criptográfico permanece fuera de dominio, logs y artefactos.

### CAD-140-03 — Secret adapter aplica least privilege, audit, backup y rotation trazables

- [ ] secret adapter soporta least privilege, audit, backup y rotation.

### CAD-140-04 — Homologation y production permanecen estrictamente separadas

- [ ] homologation y production quedan estrictamente separadas.

### CAD-140-05 — Expiración o revocación bloquean nuevas solicitudes; rotación soporta overlap

- [ ] expiración/revocación bloquea nuevas solicitudes y rotación admite overlap/rollback.

### CAD-140-06 — La aprobación exige evidencia de expiración, rotación y revocación

- [ ] fixtures cubren expiración, revocación, skew y cross-environment.
