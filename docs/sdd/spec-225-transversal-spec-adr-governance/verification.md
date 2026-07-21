# Verificación — SPEC-225

## Lifecycle

- [ ] DRAFT no puede declararse implementable por tooling/checklist.
- [ ] READY exige metadata, owner, aceptación y blockers P0 resueltos.
- [ ] VERIFIED exige tests/release evidence.
- [ ] DEPRECATED/SUPERSEDED enlaza alternativa y fechas.
- [ ] Cambio incompatible vuelve a review.

## Registry y estructura

- [ ] ID/slug duplicado falla validación.
- [ ] ID retirado no puede reutilizarse.
- [ ] Archivo/link/dependency inexistente falla.
- [ ] Ciclo inválido se reporta con ruta comprensible.
- [ ] INDEX/START_HERE no divergen del registro.
- [ ] Catálogo regenerado es byte-for-byte estable y no contiene metadata manual.
- [ ] Findings tienen código, ubicación y orden deterministas.
- [ ] Una excepción histórica nueva falla; resolver una reduce la línea base.
- [ ] CI no reescribe documentos ni cambia estados.
- [ ] La validación de PR no depende de red.

## Trazabilidad

- [ ] PR de implementación enlaza spec READY y criterios.
- [ ] Tests/evidencia se relacionan con aceptación.
- [ ] Release lista specs/revisiones incluidas.
- [ ] ADR enlaza specs y successor cuando cambia.
- [ ] Índice ADR coincide con ID, estado y archivo autoritativo.
- [ ] ADR ACCEPTED posee deciders y revisión aceptada verificable.
- [ ] Conflicto conocido bloquea merge afectado.

## Gobernanza

- [ ] Cambio editorial evita review funcional innecesaria.
- [ ] Cambio compatible notifica consumidores afectados.
- [ ] Cambio breaking incluye migración/deprecación/versionado.
- [ ] Emergencia conserva regresión y follow-up.
- [ ] Specs históricas permanecen consultables sin aparecer como vigentes.
