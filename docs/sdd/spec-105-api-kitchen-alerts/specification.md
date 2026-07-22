# Especificación — SPEC-105 Kitchen Alerts API

List/filter y commands `acknowledge`, `resolve`, `escalate`; creación automática pertenece al
evaluador de reglas. Commands usan `If-Match` e idempotency key y conservan actor/reason.

Fingerprint + evidence window deduplican activaciones. Resolver exige causa/resolution code; una
nueva condición crea activation nueva. Carreras convergen por revisión y una resolución no se
revierte por acknowledge tardío. La API no cambia Command como efecto implícito.
