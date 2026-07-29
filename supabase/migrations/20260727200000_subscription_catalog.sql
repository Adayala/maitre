-- Subscription catalog (granular billing model): the priced, versioned
-- template for what can be contracted. subscription_items keeps the actual
-- contracted rows; this table is the source of truth for price/type/scope
-- that today only lives in docs/foundation/03-service-catalog.md.

create table subscription_catalog_items (
  code text primary key,
  name text not null,
  billing_type text not null check (billing_type in ('SERVICE', 'QUANTITY')),
  billing_scope text not null check (
    billing_scope in ('TENANT', 'BRAND', 'FISCAL_ENTITY', 'BRANCH', 'POS', 'CONNECTOR')
  ),
  unit_price numeric(12, 2) not null default 0,
  currency text not null default 'ARS',
  period text not null default 'MONTHLY' check (period in ('MONTHLY')),
  depends_on text[] not null default '{}',
  is_active boolean not null default true,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table subscription_items
  add column catalog_item_code text references subscription_catalog_items (code),
  add column scope_ref_id uuid;

alter table subscription_items drop constraint subscription_items_subscription_id_service_id_key;
alter table subscription_items
  add constraint subscription_items_scope_unique
  unique nulls not distinct (subscription_id, catalog_item_code, scope_ref_id);

-- Catalog codes and scoped keys replace the legacy fixed resource enum.
alter table subscription_entitlements
  drop constraint subscription_entitlements_resource_check;

alter table subscription_catalog_items enable row level security;

-- Catalog is a shared read-only reference table, readable by any
-- authenticated tenant context (same pattern as other reference data).
create policy catalog_read_all on subscription_catalog_items
  for select using (true);
