-- The API is the only supported data boundary and connects to PostgREST with
-- a server-side service-role credential. Tables introduced after the initial
-- service-role grant migration must be explicitly granted as well; otherwise
-- a database rebuilt from migrations cannot start the durable runtime.

grant select, insert, update, delete on
  public.workforce_employments,
  public.workforce_work_shifts,
  public.workforce_shift_assignments,
  public.workforce_time_entries,
  public.workforce_time_adjustments,
  public.workforce_break_logs,
  public.workforce_break_adjustments,
  public.workforce_labor_policy_versions,
  public.workforce_time_export_jobs,
  public.subscription_catalog_items,
  public.subscription_catalog_packages
to service_role;
