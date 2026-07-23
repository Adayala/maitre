-- Catalog domain (SPEC-037..039): menus, categories, products. Simple
-- CRUD model (ACTIVE/INACTIVE/ARCHIVED, AVAILABLE/UNAVAILABLE/ARCHIVED) —
-- NOT the versioned/snapshot model contract.md describes for Menu. See
-- packages/modules/catalog/src/domain/menu.ts for the reasoning.

create table catalog_menus (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  brand_id uuid not null references organization_brands (id),
  name text not null check (char_length(name) between 1 and 200),
  slug text not null,
  description text,
  status text not null check (status in ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  is_default boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  unique (tenant_id, brand_id, slug)
);

create table catalog_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  brand_id uuid not null references organization_brands (id),
  menu_id uuid not null references catalog_menus (id),
  name text not null check (char_length(name) between 1 and 100),
  slug text not null,
  description text,
  display_order integer not null default 0,
  status text not null check (status in ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table catalog_products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references organization_tenants (id),
  category_id uuid not null references catalog_categories (id),
  name text not null check (char_length(name) between 1 and 100),
  slug text not null,
  description text,
  price_minor_units bigint not null check (price_minor_units >= 0),
  currency char(3) not null,
  image_url text,
  status text not null check (status in ('AVAILABLE', 'UNAVAILABLE', 'ARCHIVED')),
  allergens text[] not null default '{}',
  nutritional_calories numeric,
  nutritional_protein numeric,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

alter table catalog_menus enable row level security;
alter table catalog_categories enable row level security;
alter table catalog_products enable row level security;

create policy tenant_isolation on catalog_menus
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

create policy tenant_isolation on catalog_categories
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

create policy tenant_isolation on catalog_products
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

grant select, insert, update, delete on catalog_menus, catalog_categories, catalog_products
to service_role;
