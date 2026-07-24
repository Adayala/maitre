# Reglas — SPEC-187

- DataRegistry es autoridad de schema, producers y retention.
- IDs de señales son inmutables.
- Ingest valida firma, schema, rate, clock y dedupe.
- Eventos inválidos se cuarentenan.
- Cliente público no emite hechos de negocio autoritativos.
