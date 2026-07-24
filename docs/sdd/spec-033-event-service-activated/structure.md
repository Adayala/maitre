# Structure — SPEC-033

Envelope SPEC-217, aggregate `SubscriptionItem/itemId`, occurredAt, correlation/causation, actor
sanitizado y payload mínimo.

Serialización JSON versionada. SubscriptionItem/outbox son atómicos; consumidores convergen por
source revision.
