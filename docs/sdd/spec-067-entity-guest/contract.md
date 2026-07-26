# Contrato — SPEC-067 Guest

Guest es perfil opcional del comensal dentro de Tenant; no equivale a User autenticado. I0
materializa campos simples: `displayName`, contactos opcionales, `locale` opcional,
`consentGiven`, `notes`, status y timestamps. No existe merge/unmerge ni deduplicación automática.
Lookup se hace por contacto exacto y requiere permiso PII. `anonymize` es síncrono y elimina PII
persistida sin borrar la identidad referencial del Guest. Tests cubren create/update, lookup,
anonymize y aislamiento tenant/permisos.
