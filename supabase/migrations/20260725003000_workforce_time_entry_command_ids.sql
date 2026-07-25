alter table workforce_time_entries
  add column if not exists opened_command_id uuid null,
  add column if not exists closed_command_id uuid null;
