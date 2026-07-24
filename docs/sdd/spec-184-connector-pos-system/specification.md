# Especificación — SPEC-184 POS Connector

OwnershipMatrix obligatoria por catálogo/order/payment/closure y por field. Sólo un lado es authority
salvo MERGED con merge function determinista; echo suppression usa origin/revision. Delete mapea a
archive/tombstone según capability.

External IDs son únicos por installation/resource y nunca se reutilizan. Backfill, replay y events
fuera de orden convergen por version/checkpoint. Conflictos quedan explicit CONFLICT y requieren
policy/review; no last-write-wins implícito. Provider requiere spike PASS.

El conector POS debe soportar coexistencia con flujos locales sin duplicar órdenes, pagos o cierres
ya conocidos. `MERGED` sólo aplica cuando existe una función versionada y determinista capaz de
combinar fuentes sin ambigüedad; si no, el conflicto queda explícito y bloqueado para revisión.

La convergencia no depende del orden de llegada de eventos. Versionado, checkpoints y external IDs
aseguran que un replay o backfill no regenere entidades ni invalide autoridad previamente establecida.
