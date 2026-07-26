# Contrato — SPEC-069 ReservationPreference

Preference es una señal declarada, no garantía. I0 materializa un record mínimo con tenant,
subject (`GUEST` o `RESERVATION`), `code`, `value` opcional, `kind` (`PREFERENCE` o
`REQUIREMENT`) y `notes` opcional. `PREFERENCE` no bloquea; `REQUIREMENT` conserva semántica
operativa para validaciones de callers posteriores. I0 no introduce priority, consent,
vigencia, redacción automática ni snapshot en Reservation. Tests cubren creación básica y la
distinción `PREFERENCE`/`REQUIREMENT`.
Tests cubren validación, precedence, expiración, redacción y eliminación/export del guest.
