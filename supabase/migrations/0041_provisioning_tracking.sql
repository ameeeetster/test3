-- 0041_provisioning_tracking.sql
-- Adds provisioning tracking fields and jobs table for access requests

begin;

-- Add provisioning tracking columns to access_requests
alter table public.access_requests
  add column if not exists provisioning_status text not null default 'not_started'
    check (provisioning_status in ('not_started', 'pending', 'in_progress', 'succeeded', 'failed', 'skipped'));

alter table public.access_requests
  add column if not exists provisioning_started_at timestamptz;

alter table public.access_requests
  add column if not exists provisioning_completed_at timestamptz;

alter table public.access_requests
  add column if not exists provisioning_error text;

alter table public.access_requests
  add column if not exists provisioning_metadata jsonb not null default '{}'::jsonb;

comment on column public.access_requests.provisioning_status is 'Lifecycle state of downstream provisioning';
comment on column public.access_requests.provisioning_started_at is 'Timestamp when provisioning began';
comment on column public.access_requests.provisioning_completed_at is 'Timestamp when provisioning finished';
comment on column public.access_requests.provisioning_error is 'Most recent provisioning failure details';
comment on column public.access_requests.provisioning_metadata is 'Connector-specific provisioning payload';

-- Backfill provisioning_status for existing rows
update public.access_requests
set provisioning_status = case
  when status = 'APPROVED' and completed_at is not null then 'succeeded'
  when status = 'APPROVED' then 'pending'
  when status = 'REJECTED' then 'skipped'
  else 'not_started'
end
where provisioning_status = 'not_started';

-- Provisioning jobs table
create table if not exists public.provisioning_jobs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid,
  organization_id uuid,
  target_system text,
  connector_id uuid,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'succeeded', 'failed', 'skipped')),
  attempts int not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.provisioning_jobs
  add column if not exists request_id uuid;

alter table public.provisioning_jobs
  alter column request_id set not null;

alter table public.provisioning_jobs
  drop constraint if exists provisioning_jobs_request_fk;

alter table public.provisioning_jobs
  add constraint provisioning_jobs_request_fk
  foreign key (request_id)
  references public.access_requests(id)
  on delete cascade;

comment on table public.provisioning_jobs is 'Tracks downstream provisioning executions for each access request';

create index if not exists idx_provisioning_jobs_request on public.provisioning_jobs (request_id);
create index if not exists idx_provisioning_jobs_status on public.provisioning_jobs (status);

-- Trigger to maintain updated_at
drop trigger if exists trg_provisioning_jobs_updated_at on public.provisioning_jobs;
create trigger trg_provisioning_jobs_updated_at
before update on public.provisioning_jobs
for each row execute function public.set_updated_at();

-- RLS
alter table public.provisioning_jobs enable row level security;

drop policy if exists provisioning_jobs_select_org on public.provisioning_jobs;
create policy provisioning_jobs_select_org
  on public.provisioning_jobs for select
  to authenticated
  using (
    organization_id is not distinct from public.current_org_id()
    or organization_id is null
  );

drop policy if exists provisioning_jobs_insert_org on public.provisioning_jobs;
create policy provisioning_jobs_insert_org
  on public.provisioning_jobs for insert
  to authenticated
  with check (
    organization_id is not distinct from public.current_org_id()
    or organization_id is null
  );

drop policy if exists provisioning_jobs_update_org on public.provisioning_jobs;
create policy provisioning_jobs_update_org
  on public.provisioning_jobs for update
  to authenticated
  using (
    organization_id is not distinct from public.current_org_id()
    or organization_id is null
  )
  with check (
    organization_id is not distinct from public.current_org_id()
    or organization_id is null
  );

comment on policy provisioning_jobs_select_org on public.provisioning_jobs is 'Organization-scoped read access';
comment on policy provisioning_jobs_insert_org on public.provisioning_jobs is 'Organization-scoped write access';
comment on policy provisioning_jobs_update_org on public.provisioning_jobs is 'Organization-scoped update access';

commit;

