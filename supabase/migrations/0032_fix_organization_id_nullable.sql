-- Fix ALL optional columns to be nullable in access_requests
-- Migration: 0032_fix_all_nullable_columns.sql

-- Remove NOT NULL constraints from ALL optional columns
alter table public.access_requests 
  alter column organization_id drop not null,
  alter column requester_id drop not null,
  alter column for_user_id drop not null,
  alter column resource_id drop not null,
  alter column priority drop not null,
  alter column business_justification drop not null,
  alter column duration_type drop not null,
  alter column duration_days drop not null,
  alter column risk_level drop not null,
  alter column risk_score drop not null,
  alter column sla_due_date drop not null,
  alter column approved_at drop not null,
  alter column rejected_at drop not null,
  alter column completed_at drop not null,
  alter column cancelled_at drop not null,
  alter column correlation_id drop not null,
  alter column created_by drop not null,
  alter column updated_by drop not null;

-- Add helpful comments
comment on table public.access_requests is 'Access requests table - all optional fields are nullable for flexibility';
comment on column public.access_requests.organization_id is 'Organization ID - nullable, populated from user session when available';
comment on column public.access_requests.for_user_id is 'User ID for whom the request is made - nullable, defaults to requester_id if not specified';
comment on column public.access_requests.resource_id is 'Resource UUID - nullable, used for linking to specific resources';

