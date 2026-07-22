# Especificación — SPEC-184 POS Connector

OwnershipMatrix obligatoria por catálogo/order/payment/closure y por field. Sólo un lado es authority
salvo MERGED con merge function determinista; echo suppression usa origin/revision. Delete mapea a
archive/tombstone según capability.

External IDs son únicos por installation/resource y nunca se reutilizan. Backfill, replay y events
fuera de orden convergen por version/checkpoint. Conflictos quedan explicit CONFLICT y requieren
policy/review; no last-write-wins implícito. Provider requiere spike PASS.
