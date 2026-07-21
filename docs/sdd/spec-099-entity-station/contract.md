# Contrato — SPEC-099 Station

Station configura un centro de preparación en Branch: code/nombre únicos, capabilities,
routing rules versionadas, status y display order. No almacena cola mutable dentro del
agregado. Inactivar requiere reroute/no commands activos. Reglas ambiguas fallan al publicar
configuración. Tests cubren routing determinista, overlapping rules, scope, lifecycle y
auditoría.
