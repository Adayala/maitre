# Especificación — SPEC-067 Guest Identity & Privacy

Guest tenant-scoped tiene canonical ID y aliases; no equivale a User. Cada field sensible conserva
purpose, treatment basis/consent version, capturedAt/source, visibility y retention.

Merge bloquea ambos canonicals, crea alias/ledger y resuelve por campo sin inventar consentimiento:
la restricción más protectora prevalece. Referencias históricas resuelven canonical sin reescribir
snapshots. Unmerge sólo usa datos aún retenidos; no restaura PII borrada ni consentimiento revocado.
Export/anonymize quedan auditados.
