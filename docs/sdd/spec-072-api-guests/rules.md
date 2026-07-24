# Reglas — SPEC-072

- Guest es tenant-scoped y no equivale a User.
- Contacto/consentimiento se gobierna por field/purpose.
- Merge conserva canonical/aliases/ledger y usa política más protectora.
- Anonymize no borra snapshots legales ni restaura PII en unmerge.
- Tenant/actor derivan del contexto; IDs fuera de scope responden `404`.
- PII read, PII write, merge, export y anonymize son permissions distintas.
- Contacto de lookup sólo se acepta en body protegido y nunca en URL/query/logs.
- `409` expresa identidad/merge conflict, `412` revisión y `422` privacy/retention policy.
