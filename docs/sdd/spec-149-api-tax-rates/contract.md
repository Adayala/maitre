# Contrato API — SPEC-149 Tax Rates

Listar/resolver alícuotas para tenants y administrar el catálogo normativo sólo mediante permisos
de plataforma y revisión fiscal. Tenants gestionan mappings, no crean códigos oficiales. No se
modifica una versión usada; cambios crean vigencia nueva y validan no solapamiento. Tests cubren fronteras
temporales, porcentajes, códigos oficiales, concurrencia, selección determinista, RBAC,
auditoría y aislamiento entre tenants.
