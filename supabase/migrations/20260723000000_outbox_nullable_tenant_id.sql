-- SPEC-025 §Payload — UserAuthenticated has "tenant context opcional
-- validado": it fires from GET /v1/me/context, before any tenant is
-- selected, so the outbox must support tenant-agnostic/platform-level
-- events, not just tenant-scoped ones (SPEC-217 §2 lists aggregateType
-- "User", not a tenant-scoped aggregate, for this event).

alter table platform_outbox alter column tenant_id drop not null;
