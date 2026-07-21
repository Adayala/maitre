# Reglas — SPEC-225

## Invariantes

1. ID de spec/ADR es único, inmutable y no reutilizable.
2. `DRAFT` e `IN_REVIEW` no autorizan implementación de comportamiento nuevo.
3. Sólo evidencia permite marcar `VERIFIED`.
4. Cambio incompatible reabre revisión y actualiza consumidores/migración.
5. Conflicto documental bloquea el comportamiento afectado hasta decisión explícita.
6. ADR registra por qué; spec registra contrato verificable.
7. Specs/ADRs superseded permanecen en historia y enlazan sucesor.
8. Pregunta P0 abierta bloquea readiness.
9. Owner/aprobación son proporcionales al riesgo, aunque una persona cumpla varios roles.
10. Código no redefine silenciosamente una spec.
11. `sdd:validate` es gate mecánico obligatorio.
12. Urgencia no autoriza scope adicional ni elimina regresión/evidencia.

## Prohibiciones

- Renumerar specs para ordenar el roadmap.
- Reutilizar un ID eliminado.
- Marcar `DONE/VERIFIED` por completar documentos.
- Resolver contradicciones mediante comentarios no versionados.
- Borrar una decisión histórica sin successor/deprecation.
