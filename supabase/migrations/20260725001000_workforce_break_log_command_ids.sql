alter table workforce_break_logs
  add column if not exists opened_command_id uuid null,
  add column if not exists closed_command_id uuid null;
