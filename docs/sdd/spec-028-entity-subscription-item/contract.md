# Contrato — SPEC-028 SubscriptionItem

SubscriptionItem habilita un `serviceCode` dentro de una Subscription y define scope y
cantidad contratada. Campos: `id`, `subscriptionId`, `serviceCode`, `status`, `quantity`,
`branchScopes`, vigencia, config validada y auditoría.

Service code es estable/versionado; cantidad es positiva y scopes pertenecen al tenant.
No se duplican items activos con mismo service/scope. Config desconocida falla cerrado.
Modificar/remover un item recalcula entitlements y respeta coexistencia/migración; nunca
borra uso histórico. Tests cubren duplicados, scopes cross-tenant, fechas y configuración.
