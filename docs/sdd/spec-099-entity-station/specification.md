# Especificación — SPEC-099 Station

Station configura un centro de producción por Branch: code único, capabilities, estado y
RoutingPolicy publicada/versionada. No almacena una cola mutable.

Routing evalúa reglas por prioridad explícita y specificity; empate ambiguo impide publicar la
policy. Cada Command congela `routingPolicyVersion`, station y reason. Inactivar Station exige cero
Commands no terminales o una transferencia atómica hacia destino compatible, con auditoría.
