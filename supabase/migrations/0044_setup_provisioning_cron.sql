-- 0044_setup_provisioning_cron.sql
-- Sets up automatic provisioning job processing via pg_cron

begin;

-- Enable pg_cron extension if not already enabled
create extension if not exists pg_cron;

-- Grant usage to postgres user
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- Remove existing job if it exists (idempotent)
select cron.unschedule('process-provisioning-jobs');

-- Schedule the provisioning orchestrator to run every 2 minutes
-- This will invoke the edge function to process pending jobs
select cron.schedule(
  'process-provisioning-jobs',           -- job name
  '*/2 * * * *',                         -- every 2 minutes (cron expression)
  $$
    select
      net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/provisioning-orchestrator',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key')
        ),
        body := jsonb_build_object(
          'maxJobs', 10
        )
      ) as request_id;
  $$
);

commit;

