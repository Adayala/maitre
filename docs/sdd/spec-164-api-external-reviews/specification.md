# Especificación — SPEC-164 External Reviews API

List/detail versionado con provenance, attribution y freshness; contenido sujeto a permisos/ToS.
Commands `acknowledge`, `assign`, `resolve`, `reopen` gestionan caso local y nunca mutan contenido
remoto salvo capability de provider separada y explícita.

Edición crea versión; delete remoto muestra tombstone. Provider outage devuelve datos stale con
marca o unavailable, no contenido presentado como actual.

`GET /external-reviews` lista snapshots por scope/plataforma; `GET /external-reviews/{reviewId}`
devuelve detalle con provenance y freshness; `POST /external-reviews/{reviewId}:acknowledge|assign|
resolve|reopen` gestionan el caso operativo local. Errores distinguen scope, lifecycle y freshness
incompatible sin ocultar la diferencia entre “sin dato” y “dato stale”.

La API puede exponer `providerStatus` o metadatos de sincronización, pero no debe sugerir que un
snapshot stale es la representación vigente del sitio externo. Si existe una capability futura para
responder o accionar en plataforma remota, debe vivir en endpoints separados y auditados.
