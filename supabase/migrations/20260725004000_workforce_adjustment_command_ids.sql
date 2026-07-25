alter table workforce_time_adjustments
  add column if not exists request_command_id uuid null,
  add column if not exists decision_command_id uuid null;

alter table workforce_break_adjustments
  add column if not exists request_command_id uuid null,
  add column if not exists decision_command_id uuid null;
