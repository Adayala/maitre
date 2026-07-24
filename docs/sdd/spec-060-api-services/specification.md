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

Create recibe type, name y ventana planificada local. BusinessDate/timezone efectivos se
derivan de Branch y ServicePeriodPolicyVersion. List admite businessDate, status y type
allowlisted con cursor/límite estable. Comandos requieren `Idempotency-Key` e `If-Match`.

Open valida ServicePeriodPolicy/overlap. Begin-close bloquea nuevas Visits. Close devuelve
blockers tipados y acotados (Visits, Checks, Payments, CashSessions), sin PII ni referencias
fuera de scope. Timeout mantiene CLOSING y escala; force-close requiere reason y confirmación
explícita, registra findings y no falsifica cierres dependientes.
