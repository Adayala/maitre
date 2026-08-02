-- Dashboard tenant discovery filters active memberships by user before it has
-- selected a tenant. The existing (tenant_id, user_id) uniqueness cannot serve
-- that leading-column access path efficiently as the platform grows.
create index if not exists identity_memberships_active_user_idx
  on public.identity_memberships (user_id)
  where status = 'ACTIVE';
