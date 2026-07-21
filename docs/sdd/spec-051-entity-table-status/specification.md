# Especificación — SPEC-051

## Derived Status

```
if visit exists and status = OPEN:
  if has_active_orders: OCCUPIED
  elif has_pending_payment: PAYING
else if reservation exists and date = today and status = CONFIRMED:
  RESERVED
else if maintenance_block exists:
  BLOCKED
else if last_visit closed < 15 mins ago:
  CLEANING
else:
  AVAILABLE
```
