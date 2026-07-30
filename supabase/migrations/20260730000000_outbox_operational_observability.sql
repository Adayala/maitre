-- SPEC-216 / SPEC-217 / SPEC-222 — aggregate outbox health, trace causality
-- and durable deduplication for MVP journey telemetry.

alter table public.platform_outbox
  add column if not exists traceparent text,
  add column if not exists published_at timestamptz,
  add column if not exists last_attempt_at timestamptz,
  add column if not exists telemetry_claimed_at timestamptz,
  add column if not exists telemetry_observed_at timestamptz;

alter table public.platform_outbox
  add constraint platform_outbox_traceparent_format
  check (
    traceparent is null
    or traceparent ~ '^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$'
  ) not valid;

create index if not exists platform_outbox_journey_observation_idx
  on public.platform_outbox (telemetry_observed_at, occurred_at)
  where event_name in (
    'floor.visit.opened.v1',
    'ordering.order.submitted.v1',
    'kitchen.command.received.v1',
    'kitchen.command.in-progress.v1',
    'kitchen.command.ready.v1',
    'ordering.order.delivered.v1',
    'floor.check.opened.v1',
    'payment.captured.v1',
    'floor.visit.closed.v1'
  );

create or replace function public.outbox_operational_snapshot(
  p_tenant_id uuid default null,
  p_now timestamptz default now()
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with scoped as (
    select *
    from public.platform_outbox
    where p_tenant_id is null or tenant_id = p_tenant_id
  )
  select jsonb_build_object(
    'counts', jsonb_build_object(
      'PENDING', count(*) filter (where status = 'PENDING'),
      'PROCESSING', count(*) filter (where status = 'PROCESSING'),
      'PUBLISHED', count(*) filter (where status = 'PUBLISHED'),
      'FAILED', count(*) filter (where status = 'FAILED')
    ),
    'oldestPendingAgeMs', coalesce(
      extract(epoch from (p_now - min(created_at) filter (where status = 'PENDING'))) * 1000,
      0
    ),
    'publishedLast5m', count(*) filter (
      where status = 'PUBLISHED' and published_at >= p_now - interval '5 minutes'
    ),
    'retryCount', coalesce(sum(greatest(attempts - 1, 0)), 0),
    'failedCount', count(*) filter (where status = 'FAILED'),
    'expiredLeaseCount', count(*) filter (
      where status = 'PROCESSING' and lease_expires_at < p_now
    )
  )
  from scoped;
$$;

revoke all on function public.outbox_operational_snapshot(uuid, timestamptz)
  from public, anon, authenticated;
grant execute on function public.outbox_operational_snapshot(uuid, timestamptz)
  to service_role;

create or replace function public.claim_journey_telemetry_event(
  p_event_id uuid,
  p_now timestamptz,
  p_lease_seconds integer
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  claimed_count integer;
begin
  update public.platform_outbox
  set telemetry_claimed_at = p_now
  where event_id = p_event_id
    and telemetry_observed_at is null
    and (
      telemetry_claimed_at is null
      or telemetry_claimed_at < p_now - make_interval(secs => greatest(p_lease_seconds, 1))
    );
  get diagnostics claimed_count = row_count;
  return claimed_count = 1;
end;
$$;

revoke all on function public.claim_journey_telemetry_event(uuid, timestamptz, integer)
  from public, anon, authenticated;
grant execute on function public.claim_journey_telemetry_event(uuid, timestamptz, integer)
  to service_role;
