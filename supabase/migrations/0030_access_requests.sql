-- Access Requests persistence
create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  request_number text not null,
  requester_id uuid,
  for_user_id uuid,
  resource_type text not null,
  resource_id uuid,
  resource_name text not null,
  status text not null default 'PENDING',
  priority text,
  business_justification text,
  duration_type text,
  duration_days int,
  risk_level text,
  risk_score numeric,
  sod_conflicts_count int not null default 0,
  sla_due_date timestamp with time zone,
  sla_breached boolean not null default false,
  submitted_at timestamp with time zone not null default now(),
  approved_at timestamp with time zone,
  rejected_at timestamp with time zone,
  completed_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  correlation_id uuid,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  created_by uuid,
  updated_by uuid
);

-- Helpful index for list queries
create index if not exists idx_access_requests_status_submitted_at
  on public.access_requests (status, submitted_at desc);

-- Row Level Security
alter table public.access_requests enable row level security;

-- Development policy: allow all authenticated to read/insert
-- TODO: tighten with organization scoping and role checks
create policy if not exists access_requests_select_all
  on public.access_requests for select
  to authenticated using (true);

create policy if not exists access_requests_insert_all
  on public.access_requests for insert
  to authenticated with check (true);

-- Trigger to maintain updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_access_requests_updated_at on public.access_requests;
create trigger trg_access_requests_updated_at
before update on public.access_requests
for each row execute function public.set_updated_at();
