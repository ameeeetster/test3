-- Invitations table for org-scoped invite-based onboarding
-- Idempotent: uses CREATE IF NOT EXISTS and guards

-- Create invitations table
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  email citext not null,
  role_id uuid null references public.roles(id) on delete set null,
  token uuid not null unique default gen_random_uuid(),
  expires_at timestamptz not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  accepted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes for performance
create index if not exists idx_invitations_org_email on public.invitations(org_id, email);
create index if not exists idx_invitations_token on public.invitations(token);
create index if not exists idx_invitations_expires_at on public.invitations(expires_at);

-- Enable RLS
alter table public.invitations enable row level security;

-- Helper function to check if user is org admin
create or replace function public.is_org_admin(user_id uuid, org_id uuid)
returns boolean language sql stable as $$
  select exists(
    select 1 from public.user_orgs uo
    where uo.user_id = user_id and uo.org_id = org_id and uo.role = 'org_admin' and uo.is_active
  )
$$;

-- Helper function to get current org ID from JWT
create or replace function public.current_org_id()
returns uuid language sql stable as $$
  select nullif(public.get_jwt_claim('org_id'), '')::uuid
$$;

-- Helper function to get JWT claim
create or replace function public.get_jwt_claim(claim text)
returns text language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> claim, '')
$$;

-- RLS Policies for invitations

-- Policy: Users can only see invitations for their org if they are org admin
drop policy if exists invitations_select_org_admin on public.invitations;
create policy invitations_select_org_admin on public.invitations
for select using (
  public.is_org_admin(auth.uid(), org_id) and org_id = public.current_org_id()
);

-- Policy: Users can only create invitations for their org if they are org admin
drop policy if exists invitations_insert_org_admin on public.invitations;
create policy invitations_insert_org_admin on public.invitations
for insert with check (
  public.is_org_admin(auth.uid(), org_id) and org_id = public.current_org_id()
);

-- Policy: Users can only update invitations for their org if they are org admin
drop policy if exists invitations_update_org_admin on public.invitations;
create policy invitations_update_org_admin on public.invitations
for update using (
  public.is_org_admin(auth.uid(), org_id) and org_id = public.current_org_id()
);

-- Policy: Users can only delete invitations for their org if they are org admin
drop policy if exists invitations_delete_org_admin on public.invitations;
create policy invitations_delete_org_admin on public.invitations
for delete using (
  public.is_org_admin(auth.uid(), org_id) and org_id = public.current_org_id()
);

-- Grant permissions to authenticated users
grant select, insert, update, delete on public.invitations to authenticated;

-- Function to clean up expired invitations (can be called periodically)
create or replace function public.cleanup_expired_invitations()
returns int language plpgsql security definer as $$
declare
  deleted_count int;
begin
  delete from public.invitations 
  where expires_at < now() and accepted_at is null;
  
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- Grant execute permission
grant execute on function public.cleanup_expired_invitations() to authenticated;
