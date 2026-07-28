create table if not exists public.brand_presentations (
  id uuid primary key,
  tenant_id uuid not null references public.organization_tenants(id),
  brand_id uuid not null references public.organization_brands(id),
  revision integer not null check (revision > 0),
  status text not null check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  schema_version integer not null default 1 check (schema_version > 0),
  presentation jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid,
  published_at timestamptz,
  published_by uuid,
  unique (tenant_id, brand_id, revision)
);

create unique index if not exists brand_presentations_one_draft
  on public.brand_presentations (tenant_id, brand_id) where status = 'DRAFT';
create unique index if not exists brand_presentations_one_published
  on public.brand_presentations (tenant_id, brand_id) where status = 'PUBLISHED';

create table if not exists public.brand_assets (
  id uuid primary key,
  tenant_id uuid not null references public.organization_tenants(id),
  brand_id uuid not null references public.organization_brands(id),
  kind text not null check (kind in ('LOGO','LOGO_COMPACT','LOGO_DARK','FAVICON','HERO','BACKGROUND','PLACEHOLDER','FONT')),
  storage_bucket text not null,
  storage_path text not null,
  public_url text,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  checksum text not null,
  width integer,
  height integer,
  status text not null check (status in ('UPLOADING','PROCESSING','READY','REJECTED','ARCHIVED')),
  created_at timestamptz not null default now(),
  created_by uuid,
  unique (tenant_id, storage_bucket, storage_path)
);

create table if not exists public.branch_presentations (
  id uuid primary key,
  tenant_id uuid not null references public.organization_tenants(id),
  brand_id uuid not null references public.organization_brands(id),
  branch_id uuid not null references public.organization_branches(id),
  revision integer not null check (revision > 0),
  status text not null check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  overrides jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid,
  published_at timestamptz,
  published_by uuid,
  unique (tenant_id, branch_id, revision)
);

alter table public.brand_presentations enable row level security;
alter table public.brand_assets enable row level security;
alter table public.branch_presentations enable row level security;

create policy service_role_only on public.brand_presentations using (false);
create policy service_role_only on public.brand_assets using (false);
create policy service_role_only on public.branch_presentations using (false);

grant all on public.brand_presentations to service_role;
grant all on public.brand_assets to service_role;
grant all on public.branch_presentations to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-assets',
  'brand-assets',
  true,
  5242880,
  array['image/png','image/jpeg','image/webp','image/svg+xml','image/x-icon','font/woff2']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
