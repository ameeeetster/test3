-- 0043_recreate_provisioning_jobs.sql
-- Drops and recreates provisioning_jobs with the correct schema

begin;

-- Drop existing table and all dependencies
drop table if exists public.provisioning_jobs cascade;

-- Recreate with correct schema
create table public.provisioning_jobs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null,
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
  updated_at timestamptz not null default now(),
  
  constraint provisioning_jobs_request_fk
    foreign key (request_id)
    references public.access_requests(id)
    on delete cascade
);

comment on table public.provisioning_jobs is 'Tracks downstream provisioning executions for each access request';

-- Indexes
create index idx_provisioning_jobs_request on public.provisioning_jobs (request_id);
create index idx_provisioning_jobs_status on public.provisioning_jobs (status);
create index idx_provisioning_jobs_org on public.provisioning_jobs (organization_id);

-- Trigger to maintain updated_at
create trigger trg_provisioning_jobs_updated_at
before update on public.provisioning_jobs
for each row execute function public.set_updated_at();

-- RLS
alter table public.provisioning_jobs enable row level security;

create policy provisioning_jobs_select_org
  on public.provisioning_jobs for select
  to authenticated
  using (
    organization_id is not distinct from public.current_org_id()
    or organization_id is null
    or public.current_org_id() is null
  );

create policy provisioning_jobs_insert_org
  on public.provisioning_jobs for insert
  to authenticated
  with check (
    organization_id is not distinct from public.current_org_id()
    or organization_id is null
    or public.current_org_id() is null
  );

create policy provisioning_jobs_update_org
  on public.provisioning_jobs for update
  to authenticated
  using (
    organization_id is not distinct from public.current_org_id()
    or organization_id is null
    or public.current_org_id() is null
  )
  with check (
    organization_id is not distinct from public.current_org_id()
    or organization_id is null
    or public.current_org_id() is null
  );

comment on policy provisioning_jobs_select_org on public.provisioning_jobs is 'Organization-scoped read access';
comment on policy provisioning_jobs_insert_org on public.provisioning_jobs is 'Organization-scoped write access';
comment on policy provisioning_jobs_update_org on public.provisioning_jobs is 'Organization-scoped update access';

commit;

