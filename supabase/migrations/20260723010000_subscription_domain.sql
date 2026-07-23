-- Subscription domain (SPEC-027..030): subscriptions, subscription_items,
-- entitlements, quotas. Tables live in public with a subscription_ prefix,
-- same convention as organization_*/identity_* (see the earlier migration
-- that moved everything out of custom schemas after the Data API "exposed
-- schemas" toggle proved unreliable).

create table subscription_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  plan_code text not null,
  status text not null check (status in ('TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED')),
  billing_cycle text not null check (billing_cycle in ('MONTHLY', 'ANNUALLY')),
  start_date timestamptz not null,
  renewal_date timestamptz not null,
  cancellation_date timestamptz,
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  auto_renew boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id)
);

create table subscription_items (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references subscription_subscriptions (id),
  service_id text not null,
  status text not null check (status in ('ACTIVE', 'INACTIVE')),
  quantity integer not null default 1,
  unit_price numeric(12, 2) not null default 0,
  activated_at timestamptz not null,
  deactivated_at timestamptz,
  unique (subscription_id, service_id)
);

create table subscription_entitlements (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references subscription_subscriptions (id),
  resource text not null check (resource in ('branches', 'users', 'orders', 'api_calls', 'storage')),
  soft_limit bigint,
  hard_limit bigint not null,
  override_reason text,
  expires_at timestamptz,
  unique (subscription_id, resource)
);

create table subscription_quotas (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references subscription_subscriptions (id),
  resource text not null,
  used bigint not null default 0,
  entitlement_id uuid not null references subscription_entitlements (id),
  last_updated_at timestamptz not null default now(),
  unique (subscription_id, resource)
);

alter table subscription_subscriptions enable row level security;
alter table subscription_items enable row level security;
alter table subscription_entitlements enable row level security;
alter table subscription_quotas enable row level security;

create policy tenant_isolation on subscription_subscriptions
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

create policy tenant_isolation on subscription_items
  using (
    subscription_id in (
      select id from subscription_subscriptions
      where tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid
    )
  );

create policy tenant_isolation on subscription_entitlements
  using (
    subscription_id in (
      select id from subscription_subscriptions
      where tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid
    )
  );

create policy tenant_isolation on subscription_quotas
  using (
    subscription_id in (
      select id from subscription_subscriptions
      where tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid
    )
  );

grant select, insert, update, delete on
  subscription_subscriptions,
  subscription_items,
  subscription_entitlements,
  subscription_quotas
to service_role;
