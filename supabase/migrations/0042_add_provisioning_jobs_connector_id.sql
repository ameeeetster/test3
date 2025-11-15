-- 0042_add_provisioning_jobs_connector_id.sql
-- Ensures provisioning_jobs has the connector_id column expected by the app

begin;

alter table public.provisioning_jobs
  add column if not exists connector_id uuid;

alter table public.provisioning_jobs
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.provisioning_jobs
  add column if not exists target_system text;

-- Ensure organization_id is nullable (for dev/migration flexibility)
alter table public.provisioning_jobs
  alter column organization_id drop not null;

commit;


