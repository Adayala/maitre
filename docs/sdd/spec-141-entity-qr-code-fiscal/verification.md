# Verificación — SPEC-141

## Criterios

### CAD-141-01 — La generación queda restringida a Invoice AUTHORIZED y fuentes normativas registradas

- [ ] sólo Invoice AUTHORIZED con normativa registrada puede generar QR fiscal.

### CAD-141-02 — Canonical payload y hash producen bytes idénticos para el mismo input

- [ ] mismo Invoice/version produce payload/hash/bytes idénticos.

### CAD-141-03 — Campos, encoding, URL y límites provienen sólo del registry normativo

- [ ] campos, encoding, URL y límites provienen sólo del registry normativo.

### CAD-141-04 — CAE y datos fiscales se incluyen sólo según formato, nunca secretos

- [ ] CAE y datos fiscales necesarios se incluyen sin exponer secretos.

### CAD-141-05 — Cambios oficiales crean nuevas versiones sin mutar historia

- [ ] nuevas normas crean nuevas versiones sin mutar historia.

### CAD-141-06 — La aprobación exige evidencia de encoding, determinismo y validación oficial

- [ ] fixtures cubren encoding, decimales, CAE, tamaño y determinismo.
