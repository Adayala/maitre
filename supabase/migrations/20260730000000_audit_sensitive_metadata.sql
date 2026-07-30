-- SPEC-044/045/219/222 — additive metadata for sensitive mutation evidence.

alter table audit_logs
  add column action_code text,
  add column outcome text check (outcome in ('SUCCEEDED', 'DENIED', 'FAILED')),
  add column branch_id uuid references organization_branches (id),
  add column reason_code text,
  add column request_id text;

create index audit_logs_branch_occurred_idx
  on audit_logs (tenant_id, branch_id, occurred_at desc, id desc);

create index audit_logs_action_outcome_idx
  on audit_logs (tenant_id, action_code, outcome, occurred_at desc);
