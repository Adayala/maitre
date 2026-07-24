# Especificación — SPEC-196 Alerts API

CRUD/publish de AlertRule; preview histórico sin notifications; activation list y commands
`acknowledge`, `resolve`, `dismiss`, `snooze`, `reopen` con `If-Match` e idempotencia.

Resolve/dismiss exigen reason; reopen sólo para nueva evidence/manual review. Notification failure
no cambia activation y sigue retry/DLQ. Stale/contradictory inputs bloquean automation. Runbook y
owner son obligatorios antes de publish.

`POST /alert-rules` y `PATCH /alert-rules/{ruleId}` gestionan drafts; `POST
/alert-rules/{ruleId}:preview|publish` validan y congelan la regla; `GET /alerts` lista activaciones;
`POST /alerts/{alertId}:acknowledge|resolve|dismiss|snooze|reopen` gobierna el lifecycle. `preview`
usa evidencia histórica o dataset de prueba sin emitir notificaciones ni side effects.

La automatización dependiente de alertas debe chequear explicitamente el estado de señal y el outcome
de policy. Una activation en `UNKNOWN` o basada en inputs contradictorios/stale no puede disparar
acciones automáticas aunque exista una regla publicada.
