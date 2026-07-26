# Especificación — SPEC-067 Guest Identity & Privacy

Guest con alcance tenant no equivale a User. I0 actual modela un perfil simple con
`displayName`, `email`, `phone`, `locale`, `consentGiven`, `notes`, `status` y revisión.

No existen canonical/alias IDs, merge/unmerge, ledger per-field de consentimiento, treatment basis,
capturedAt/source, visibility ni retention por atributo. La operación materializada de privacidad es
`anonymize`, síncrona, que elimina PII almacenada (`email`, `phone`, `locale`, `notes`), cambia
`displayName` a un placeholder, revoca `consentGiven` y marca status `ANONYMIZED`.

Las referencias históricas por `guestId` se conservan; anonymize no elimina reservations ni otros
registros que apunten al Guest. Duplicate profiles pueden existir en I0: no hay deduplicación ni
resolución de canonicals.
