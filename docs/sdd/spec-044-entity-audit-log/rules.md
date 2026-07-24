# Rules — SPEC-044

- Record append-only; corrección agrega otro record.
- Acciones sensibles y denegaciones definidas por policy se auditan; “todo CRUD” no es criterio.
- Actor/contexto se resuelven server-side.
- Diff/signals se sanitizan por schema y data classification.
- Sequence/hash chain por partición detecta gaps/tampering.
- Failure mode depende de criticidad y nunca degrada silenciosamente.
- Retention/legal hold/privacy disposition usan policy versionada.
