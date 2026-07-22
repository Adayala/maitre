# Especificación — SPEC-196 Alerts API

CRUD/publish de AlertRule; preview histórico sin notifications; activation list y commands
`acknowledge`, `resolve`, `dismiss`, `snooze`, `reopen` con `If-Match` e idempotencia.

Resolve/dismiss exigen reason; reopen sólo para nueva evidence/manual review. Notification failure
no cambia activation y sigue retry/DLQ. Stale/contradictory inputs bloquean automation. Runbook y
owner son obligatorios antes de publish.
