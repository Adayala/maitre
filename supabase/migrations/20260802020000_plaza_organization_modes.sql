alter table public.floor_plazas
  add column mode text not null default 'VARIABLE'
    check (mode in ('FIXED', 'VARIABLE')),
  add column source_plaza_id uuid null;

alter table public.floor_plazas
  add constraint floor_plazas_source_snapshot_fk
  foreign key (source_plaza_id)
  references public.floor_plazas(id)
  on delete set null;

create index floor_plazas_fixed_carry_forward_idx
  on public.floor_plazas (tenant_id, branch_id, service_period_id)
  where mode = 'FIXED';
