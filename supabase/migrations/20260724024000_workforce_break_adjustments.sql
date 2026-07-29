create table if not exists workforce_break_adjustments (
  id uuid primary key,
  tenant_id uuid not null references public.organization_tenants(id) on delete cascade,
  break_log_id uuid not null references workforce_break_logs(id) on delete cascade,
  before_opened_at timestamptz null,
  before_closed_at timestamptz null,
  requested_opened_at timestamptz null,
  requested_closed_at timestamptz null,
  after_opened_at timestamptz null,
  after_closed_at timestamptz null,
  reason text not null,
  evidence text null,
  requester_id text not null,
  approver_id text null,
  status text not null check (status in ('REQUESTED', 'APPROVED', 'REJECTED')),
  effective_at timestamptz null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);
