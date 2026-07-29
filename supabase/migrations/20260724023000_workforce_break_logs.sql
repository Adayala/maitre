create table if not exists workforce_break_logs (
  id uuid primary key,
  tenant_id uuid not null references public.organization_tenants(id) on delete cascade,
  time_entry_id uuid not null references workforce_time_entries(id) on delete cascade,
  break_type text not null check (break_type in ('MEAL', 'REST', 'OTHER')),
  paid_classification text not null check (paid_classification in ('PAID', 'UNPAID')),
  labor_policy_version text not null,
  status text not null check (status in ('OPEN', 'CLOSED')),
  opened_at timestamptz not null,
  closed_at timestamptz null,
  timezone text not null,
  source text not null check (source in ('DEVICE', 'MANUAL', 'IMPORT')),
  device_id text not null,
  device_sequence integer not null,
  finding_reason_code text null,
  revision integer not null default 0,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create unique index if not exists uq_break_logs_open_per_time_entry
  on workforce_break_logs (tenant_id, time_entry_id)
  where status = 'OPEN';
