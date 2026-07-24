# Especificación — SPEC-099 Station

Station configura un centro de producción por Branch: code único, capabilities, estado y
RoutingPolicy publicada/versionada. No almacena una cola mutable.

Routing evalúa reglas por prioridad explícita y specificity; empate ambiguo impide publicar la
policy. Cada Command congela `routingPolicyVersion`, station y reason. Inactivar Station exige cero
Commands no terminales o una transferencia atómica hacia destino compatible, con auditoría.

Station pertenece a una única `branchId` y conserva `stationId`, `code`, `displayName`,
`capabilities`, `status`, `displayOrder` y versiones publicadas de `RoutingPolicy`. No contiene
cola mutable de trabajo, métricas transitorias ni alertas abiertas: esos datos se obtienen desde
proyecciones o señales derivadas.

La RoutingPolicy se publica por revisión inmutable. Cada regla define criterios allowlisted,
prioridad explícita y nivel de especificidad. La resolución elige una única Station compatible; si
dos reglas empatan sin desempate normativo, la policy es inválida y no puede publicarse.

Cuando un Command queda ruteado, se congelan `stationId`, `routingPolicyRevisionId` y `routingReason`
para que futuras ediciones de configuración no reescriban historia. Un reroute posterior requiere
operación explícita y auditada, no relectura implícita de la policy vigente.
