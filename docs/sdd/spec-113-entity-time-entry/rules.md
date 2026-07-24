# Rules — SPEC-113

- Sólo una TimeEntry OPEN por Employment/tenant.
- `PENDING_REVIEW` es workflow/flag, no reemplaza OPEN/CLOSED.
- Correcciones son append-only mediante TimeAdjustment.
- Work without shift se gobierna por policy explícita.
- Captured/received timestamps y timezone deben preservarse para auditoría.
