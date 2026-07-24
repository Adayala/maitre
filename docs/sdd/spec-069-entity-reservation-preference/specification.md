# Especificación — SPEC-069 ReservationPreference

Separa `PREFERENCE` best-effort de `REQUIREMENT` operativo. El subject es Guest como default
reutilizable o Reservation como override puntual. Code/value tipados guardan scope,
source, purpose, basis/consent proof, visibility, validity y retention.

Accesibilidad y dietary/allergen data son sensibles: acceso mínimo, logs/events redactados y
retención limitada. Texto libre se sanitiza y no sustituye códigos de seguridad. Al confirmar,
Reservation congela IDs/revisiones y valores operativos mínimos. Preference no satisfecha se
explica; requirement no satisfecho bloquea confirm/seat con policy version y reason.
