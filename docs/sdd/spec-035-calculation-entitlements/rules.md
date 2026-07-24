# Rules — SPEC-035

- Mismos inputs canónicos + asOf producen mismo output lógico.
- Catálogo define tipo/agregación/precedence por code.
- Config/tipo/scope desconocido falla cerrado.
- Override requiere authority/reason/expiry y sólo actúa según policy del code.
- Auditoría registra hashes/source refs/revision/outcome, no payloads sensibles completos.
- Reemplazo de proyección es atómico; cache stale no amplía capacidad.
- El cálculo no produce Quota ni consulta consumo.
