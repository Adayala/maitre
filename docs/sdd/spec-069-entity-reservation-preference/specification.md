# Especificación — SPEC-069 ReservationPreference

Separa `PREFERENCE` best-effort de `REQUIREMENT` operativo. Code/value tipados guardan scope,
source, purpose, basis/consent proof, visibility, validity y retention.

Accesibilidad y dietary/allergen data son sensibles: acceso mínimo, logs/events redactados y
retención limitada. Texto libre se sanitiza y no sustituye códigos de seguridad. Preference no
satisfecha se explica; requirement no satisfecho bloquea confirm/seat con reason.
