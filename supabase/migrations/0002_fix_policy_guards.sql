-- Ensure required extensions exist
create extension if not exists pgcrypto;

-- Guarded policy creation to avoid errors when columns or tables differ
do $$ begin
  -- user_orgs policies (require org_id)
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_orgs' and column_name = 'org_id'
  ) then
    begin
      execute 'create policy if not exists user_orgs_select_org on public.user_orgs for select using (org_id = public.current_org_id())';
    exception when others then null; end;
    begin
      execute 'create policy if not exists user_orgs_modify_admin on public.user_orgs for all using (public.is_org_admin(auth.uid(), public.current_org_id()) and org_id = public.current_org_id())';
    exception when others then null; end;
  end if;

  -- roles policies (require org_id)
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'roles' and column_name = 'org_id'
  ) then
    begin
      execute 'create policy if not exists roles_select_org on public.roles for select using (org_id = public.current_org_id())';
    exception when others then null; end;
    begin
      execute 'create policy if not exists roles_modify_admin on public.roles for all using (public.is_org_admin(auth.uid(), public.current_org_id()) and org_id = public.current_org_id())';
    exception when others then null; end;
  end if;

  -- invitations policies (require org_id)
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'invitations' and column_name = 'org_id'
  ) then
    begin
      execute 'create policy if not exists invitations_select_org on public.invitations for select using (org_id = public.current_org_id())';
    exception when others then null; end;
    begin
      execute 'create policy if not exists invitations_modify_admin on public.invitations for all using (public.is_org_admin(auth.uid(), public.current_org_id()) and org_id = public.current_org_id())';
    exception when others then null; end;
  end if;

  -- audit_logs (has nullable org_id)
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_logs' and column_name = 'org_id'
  ) then
    begin
      execute 'create policy if not exists audit_logs_select_org on public.audit_logs for select using (org_id is null or org_id = public.current_org_id())';
    exception when others then null; end;
    begin
      execute 'create policy if not exists audit_logs_insert_any on public.audit_logs for insert with check (true)';
    exception when others then null; end;
  end if;
end $$;


