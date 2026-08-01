-- Operational plazas: groups of physical tables for one service period,
-- optionally assigned to an active waiter employment.
create unique index if not floor_service_periods_tenant_id_id_idx
  on public.floor_service_periods (tenant_id, id);
create unique index if not organization_tables_tenant_id_id_idx
  on public.organization_tables (tenant_id, id);
create unique index if not workforce_employments_tenant_id_id_idx
  on public.workforce_employments (tenant_id, id);

create table public.floor_plazas (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organization_tenants(id) on delete cascade,
  branch_id uuid not null,
  salon_id uuid not null,
  service_period_id uuid not null,
  name text not null check (char_length(trim(name)) between 2 and 80),
  waiter_employment_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, service_period_id, name),
  unique (tenant_id, id),
  foreign key (tenant_id, branch_id)
    references public.organization_branches(tenant_id, id) on delete restrict,
  foreign key (tenant_id, salon_id)
    references public.organization_salons(tenant_id, id) on delete restrict,
  foreign key (tenant_id, service_period_id)
    references public.floor_service_periods(tenant_id, id) on delete cascade,
  foreign key (tenant_id, waiter_employment_id)
    references public.workforce_employments(tenant_id, id) on delete restrict
);

create table public.floor_plaza_tables (
  tenant_id uuid not null references public.organization_tenants(id) on delete cascade,
  plaza_id uuid not null,
  service_period_id uuid not null,
  table_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (tenant_id, plaza_id, table_id),
  foreign key (tenant_id, plaza_id)
    references public.floor_plazas(tenant_id, id) on delete cascade,
  foreign key (tenant_id, service_period_id)
    references public.floor_service_periods(tenant_id, id) on delete cascade,
  foreign key (tenant_id, table_id)
    references public.organization_tables(tenant_id, id) on delete restrict,
  -- Database backstop for the domain invariant: one table belongs to at most
  -- one plaza in the same service period.
  unique (tenant_id, service_period_id, table_id)
);

create index floor_plazas_salon_idx
  on public.floor_plazas (tenant_id, salon_id, service_period_id);

alter table public.floor_plazas enable row level security;
alter table public.floor_plaza_tables enable row level security;

create policy tenant_isolation on public.floor_plazas
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid)
  with check (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
create policy tenant_isolation on public.floor_plaza_tables
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid)
  with check (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

grant select, insert, update, delete on
  public.floor_plazas,
  public.floor_plaza_tables
to service_role;
