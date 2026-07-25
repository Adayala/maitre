-- Workforce domain (SPEC-111..123 initial base): Employment, WorkShift,
-- ShiftAssignment, TimeEntry and TimeAdjustment.

create table if not exists workforce_employments (
  id uuid primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_ref text not null,
  employee_code text not null,
  relationship_type text not null check (relationship_type in ('EMPLOYEE', 'CONTRACTOR', 'TEMPORARY')),
  eligible_branch_ids uuid[] not null default '{}',
  status text not null check (status in ('ACTIVE', 'INACTIVE', 'TERMINATED')),
  valid_from timestamptz not null,
  valid_until timestamptz null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  unique (tenant_id, employee_code)
);

create table if not exists workforce_work_shifts (
  id uuid primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete restrict,
  timezone text not null,
  business_date date not null,
  starts_at_utc timestamptz not null,
  ends_at_utc timestamptz not null,
  labor_policy_version text not null,
  service_period_id uuid null references public.service_periods(id) on delete set null,
  status text not null check (status in ('DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  revision integer not null default 0,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  published_at timestamptz null,
  started_at timestamptz null,
  completed_at timestamptz null,
  cancelled_at timestamptz null,
  check (starts_at_utc < ends_at_utc)
);

create unique index if not exists uq_work_shifts_branch_active
  on workforce_work_shifts (tenant_id, branch_id)
  where status in ('PUBLISHED', 'IN_PROGRESS');

create table if not exists workforce_shift_assignments (
  id uuid primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete restrict,
  work_shift_id uuid not null references workforce_work_shifts(id) on delete cascade,
  employment_id uuid not null references workforce_employments(id) on delete restrict,
  role_code text not null,
  station_id uuid null,
  status text not null check (status in ('PROPOSED', 'CONFIRMED', 'DECLINED', 'CANCELLED')),
  revision integer not null default 0,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  confirmed_at timestamptz null,
  declined_at timestamptz null,
  cancelled_at timestamptz null,
  unique (work_shift_id, employment_id)
);

create table if not exists workforce_time_entries (
  id uuid primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete restrict,
  employment_id uuid not null references workforce_employments(id) on delete restrict,
  shift_assignment_id uuid null references workforce_shift_assignments(id) on delete set null,
  status text not null check (status in ('OPEN', 'CLOSED')),
  captured_at timestamptz not null,
  effective_captured_at timestamptz null,
  received_at timestamptz not null,
  closed_captured_at timestamptz null,
  effective_closed_captured_at timestamptz null,
  closed_received_at timestamptz null,
  timezone text not null,
  source text not null check (source in ('DEVICE', 'MANUAL', 'IMPORT')),
  device_id text not null,
  device_sequence integer not null,
  clock_skew_ms integer not null,
  pending_review boolean not null default false,
  review_reason text null,
  last_approved_adjustment_id uuid null,
  revision integer not null default 0,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create unique index if not exists uq_time_entries_open_per_employment
  on workforce_time_entries (tenant_id, employment_id)
  where status = 'OPEN';

create table if not exists workforce_time_adjustments (
  id uuid primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  time_entry_id uuid not null references workforce_time_entries(id) on delete cascade,
  before_clock_in_at timestamptz null,
  before_clock_out_at timestamptz null,
  requested_clock_in_at timestamptz null,
  requested_clock_out_at timestamptz null,
  after_clock_in_at timestamptz null,
  after_clock_out_at timestamptz null,
  reason text not null,
  evidence text null,
  requester_id text not null,
  approver_id text null,
  status text not null check (status in ('REQUESTED', 'APPROVED', 'REJECTED')),
  effective_at timestamptz null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);
