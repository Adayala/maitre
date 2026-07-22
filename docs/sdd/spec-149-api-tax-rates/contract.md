# Contrato API — SPEC-149 Tax Rates

Listar, crear y versionar alícuotas, y resolver la aplicable para una fecha, jurisdicción y
tratamiento. No se modifica una versión usada por comprobantes; cambios crean vigencia nueva
y validan ausencia de solapamientos. If-Match protege borradores. Tests cubren fronteras
temporales, porcentajes, códigos oficiales, concurrencia, selección determinista, RBAC,
auditoría y aislamiento entre tenants.
