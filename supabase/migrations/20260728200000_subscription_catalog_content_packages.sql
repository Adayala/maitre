alter table subscription_catalog_items
  add column description text not null default '',
  add column benefits text[] not null default '{}';

create table subscription_catalog_packages (
  code text primary key,
  name text not null,
  tagline text not null,
  description text not null,
  benefits text[] not null default '{}',
  items jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(items) = 'array')
);

alter table subscription_catalog_packages enable row level security;

create policy catalog_packages_read_all on subscription_catalog_packages
  for select using (true);
