# Verificación — SPEC-225

## Criterios

### CAD-225-01 — El lifecycle documental distingue claramente draft, ready, verified, deprecated y superseded

- [ ] DRAFT no puede declararse implementable por tooling/checklist;
- [ ] READY exige metadata, owner, aceptación y blockers P0 resueltos;
- [ ] VERIFIED exige tests/release evidence;
- [ ] DEPRECATED/SUPERSEDED enlaza alternativa y fechas;
- [ ] cambio incompatible vuelve a review.

### CAD-225-02 — IDs, links, dependencias e índices se validan como un sistema documental único

- [ ] ID/slug duplicado falla validación;
- [ ] ID retirado no puede reutilizarse;
- [ ] archivo/link/dependency inexistente falla;
- [ ] ciclo inválido se reporta con ruta comprensible;
- [ ] INDEX/START_HERE no divergen del registro.

### CAD-225-03 — Los cambios compatibles e incompatibles siguen flujos distintos y trazables

- [ ] cambio editorial evita review funcional innecesaria;
- [ ] cambio compatible notifica consumidores afectados;
- [ ] cambio breaking incluye migración/deprecación/versionado;
- [ ] emergencia conserva regresión y follow-up.

### CAD-225-04 — Specs, ADRs, código, tests y releases se mantienen sincronizados en el mismo cambio

- [ ] PR de implementación enlaza spec READY y criterios;
- [ ] tests/evidencia se relacionan con aceptación;
- [ ] release lista specs/revisiones incluidas;
- [ ] conflicto conocido bloquea merge afectado.

### CAD-225-05 — El validador documental y su baseline histórica son deterministas, versionados y sin dependencia de red

- [ ] catálogo regenerado es byte-for-byte estable y no contiene metadata manual;
- [ ] findings tienen código, ubicación y orden deterministas;
- [ ] una excepción histórica nueva falla; resolver una reduce la línea base;
- [ ] CI no reescribe documentos ni cambia estados;
- [ ] la validación de PR no depende de red.

### CAD-225-06 — Las decisiones arquitectónicas mantienen autoridad, sucesión y evidencia verificables

- [ ] ADR enlaza specs y successor cuando cambia;
- [ ] índice ADR coincide con ID, estado y archivo autoritativo;
- [ ] ADR ACCEPTED posee deciders y revisión aceptada verificable;
- [ ] specs históricas permanecen consultables sin aparecer como vigentes.
