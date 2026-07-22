# Especificación — SPEC-164 External Reviews API

List/detail versionado con provenance, attribution y freshness; contenido sujeto a permisos/ToS.
Commands `acknowledge`, `assign`, `resolve`, `reopen` gestionan caso local y nunca mutan contenido
remoto salvo capability de provider separada y explícita.

Edición crea versión; delete remoto muestra tombstone. Provider outage devuelve datos stale con
marca o unavailable, no contenido presentado como actual.
