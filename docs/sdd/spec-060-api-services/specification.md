# Especificación — SPEC-060 ServicePeriods API

Superficie I0:

- `POST /v1/branches/{branchId}/service-periods`;
- `GET /v1/branches/{branchId}/service-periods`;
- `GET /v1/service-periods/{servicePeriodId}`;
- `POST /v1/service-periods/{servicePeriodId}/open`;
- `POST /v1/service-periods/{servicePeriodId}/begin-close`;
- `POST /v1/service-periods/{servicePeriodId}/close`;
- `POST /v1/service-periods/{servicePeriodId}/force-close`;
- `POST /v1/service-periods/{servicePeriodId}/cancel-planned`.

Create recibe `businessDate`, `type`, `name` y ventana planificada local. El I0 actual no
deriva `businessDate`/timezone desde Branch ni modela `ServicePeriodPolicyVersion`. List hoy
devuelve el set completo por Branch sin filtros ni cursor/límite estable. Comandos todavía no
requieren `Idempotency-Key` ni `If-Match`.

Open valida sólo la regla dura de overlap: no más de un ServicePeriod `OPEN`/`CLOSING` por
Branch. Begin-close mueve `OPEN -> CLOSING`. Close y `force-close` comparten la misma transición
`CLOSING -> CLOSED`; `force-close` existe como endpoint dedicado y requiere `reason`. El I0 actual
no devuelve blockers tipados, no mantiene timeout/escalation y no registra findings separados.
