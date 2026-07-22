-- Moving tables into public doesn't automatically grant PostgREST roles
-- access; Supabase requires explicit GRANTs per table. The Fastify backend
-- authenticates as service_role (via the secret key) and is expected to
-- bypass RLS entirely, so it gets full DML; anon/authenticated get nothing
-- here — no table is meant to be reachable directly by a browser client in
-- I0 (SPEC-210 topology: browser -> Maitre API -> Postgres, never direct).

grant usage on schema public to service_role;

grant select, insert, update, delete on
  public.organization_tenants,
  public.organization_brands,
  public.organization_fiscal_entities,
  public.organization_branches,
  public.organization_salons,
  public.organization_tables,
  public.identity_users,
  public.identity_memberships,
  public.identity_membership_roles,
  public.identity_membership_branches,
  public.platform_outbox
to service_role;
