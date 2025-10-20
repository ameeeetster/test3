# Supabase Database Setup Guide
## Cloud-Native IAM/IGA Platform

This guide provides step-by-step instructions for creating and configuring the complete PostgreSQL database schema for the IAM/IGA platform in Supabase.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Schema Execution Order](#database-schema-execution-order)
4. [Step-by-Step Execution](#step-by-step-execution)
5. [Verification & Testing](#verification--testing)
6. [Row Level Security (RLS) Setup](#row-level-security-rls-setup)
7. [Seed Data (Optional)](#seed-data-optional)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

---

## Prerequisites

Before you begin, ensure you have:

- ✅ A Supabase account (sign up at https://supabase.com)
- ✅ A new or existing Supabase project
- ✅ Database access credentials (automatically provided by Supabase)
- ✅ Basic understanding of SQL and PostgreSQL
- ✅ The complete SQL schema file from the previous artifact

---

## Supabase Project Setup

### 1. Create a New Supabase Project

1. **Log in to Supabase Dashboard**
   - Navigate to https://app.supabase.com
   - Sign in with your account

2. **Create New Project**
   - Click "New Project"
   - Fill in the details:
     - **Name**: `iam-iga-platform` (or your preferred name)
     - **Database Password**: Choose a strong password (save this!)
     - **Region**: Select the region closest to your users
     - **Pricing Plan**: Free tier works for development
   - Click "Create new project"
   - ⏳ Wait 2-5 minutes for provisioning

3. **Access the SQL Editor**
   - Once the project is ready, click on your project
   - Navigate to **SQL Editor** in the left sidebar
   - You'll use this to execute all SQL commands

---

## Database Schema Execution Order

**⚠️ CRITICAL: Execute scripts in this exact order to avoid foreign key constraint errors.**

The schema must be created in dependency order because tables reference each other through foreign keys. Here's the logical execution sequence:

```
Phase 1: Foundation (Helper Functions)
├── 1. Helper function for updated_at trigger

Phase 2: Core Structure (No Dependencies)
├── 2. Organizations
├── 3. Divisions
├── 4. Departments (depends on divisions, but manager FK added later)
└── 5. Locations

Phase 3: Identity & Auth
├── 6. Users (central identity table with auth integration)
├── 7. Add manager FK to departments (circular reference resolved)
└── 8. User platform roles

Phase 4: Grouping
├── 9. Groups
└── 10. User-Groups junction

Phase 5: Connectors & Integrations
├── 11. Connectors (definitions)
└── 12. Integration instances

Phase 6: Applications & Accounts
├── 13. Applications
├── 14. Accounts
└── 15. Account match candidates

Phase 7: Entitlements & Roles
├── 16. Entitlements
├── 17. User-Entitlements (direct grants)
├── 18. Account-Entitlements (provisioned)
├── 19. Roles
├── 20. Role-Entitlements
├── 21. User-Roles
└── 22. Group-Roles

Phase 8: Access Requests & Approvals
├── 23. Access requests
└── 24. Approval steps

Phase 9: JML (Joiner/Mover/Leaver)
├── 25. JML requests
├── 26. JML approvals
└── 27. JML task runs

Phase 10: ISR (Identity System of Record)
├── 28. Identity systems of record
├── 29. ISR attribute mastership
├── 30. ISR validators
├── 31. ISR data quality rules
├── 32. JML trigger rules
├── 33. JML trigger conditions
└── 34. Attribute deltas

Phase 11: Policies & Governance
├── 35. Policies
├── 36. Policy rules
├── 37. Policy conditions
├── 38. Policy actions
├── 39. SoD policies
└── 40. SoD conflicts

Phase 12: Certifications (Access Reviews)
├── 41. Certification campaigns
└── 42. Certification items

Phase 13: Risk Management
├── 43. Risk scores
└── 44. Anomalies

Phase 14: Audit & Observability
└── 45. Audit events

Phase 15: AI & Intelligence
└── 46. AI suggestions

Phase 16: Notifications & Settings
├── 47. Notifications
├── 48. Settings
├── 49. Attribute mappings
└── 50. Provisioning jobs
```

---

## Step-by-Step Execution

### Method 1: Execute as Single Script (Recommended for Initial Setup)

**This is the easiest method for first-time setup.**

1. **Open SQL Editor in Supabase**
   - Navigate to **SQL Editor** → Click "New query"

2. **Copy Complete Schema**
   - Copy the entire SQL schema (all 50 tables + helper function)
   - Paste into the SQL Editor

3. **Execute the Script**
   - Click "Run" (or press `Ctrl+Enter` / `Cmd+Enter`)
   - ⏳ Wait for execution (typically 5-15 seconds)
   - ✅ Check for success message: "Success. No rows returned"

4. **Verify No Errors**
   - If you see any red error messages, note them and refer to [Troubleshooting](#troubleshooting)
   - Common issue: If script fails midway, you may need to execute in smaller batches (see Method 2)

---

### Method 2: Execute in Phases (For Troubleshooting or Large Scripts)

If Method 1 fails or you want more control, execute in phases:

#### **Phase 1: Helper Function**

```sql
-- Copy and execute this first
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

**Verify:** Check for success message.

---

#### **Phase 2: Core Structure Tables**

Create a new query and execute:

```sql
-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  parent_organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT chk_organizations_settings CHECK (jsonb_typeof(settings) = 'object')
);

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_organizations_slug ON public.organizations(slug);
CREATE INDEX idx_organizations_parent ON public.organizations(parent_organization_id);

-- Divisions
CREATE TABLE IF NOT EXISTS public.divisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_divisions_org_slug UNIQUE (organization_id, slug)
);

CREATE TRIGGER trg_divisions_updated_at
  BEFORE UPDATE ON public.divisions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_divisions_org ON public.divisions(organization_id);

-- Departments (without manager FK yet)
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  division_id uuid REFERENCES public.divisions(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  cost_center text,
  manager_id uuid, -- Will be FK to users, added later
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_departments_org_slug UNIQUE (organization_id, slug)
);

CREATE TRIGGER trg_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_departments_org ON public.departments(organization_id);
CREATE INDEX idx_departments_division ON public.departments(division_id);

-- Locations
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  address_line1 text,
  address_line2 text,
  city text,
  state_province text,
  country text,
  postal_code text,
  timezone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_locations_org_slug UNIQUE (organization_id, slug)
);

CREATE TRIGGER trg_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_locations_org ON public.locations(organization_id);
```

**Verify:** Run `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;` to see created tables.

---

#### **Phase 3: Users & Identity**

```sql
-- Users (main identity table)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_id text UNIQUE,
  email text NOT NULL UNIQUE,
  username text UNIQUE,
  display_name text,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  division_id uuid REFERENCES public.divisions(id) ON DELETE SET NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  manager_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  
  employment_type text,
  employment_status text NOT NULL DEFAULT 'ACTIVE',
  start_date date,
  end_date date,
  job_title text,
  
  status text NOT NULL DEFAULT 'active',
  risk_score numeric(5,2) DEFAULT 0.0,
  risk_level text,
  
  last_login_at timestamptz,
  last_activity_at timestamptz,
  password_changed_at timestamptz,
  mfa_enabled boolean NOT NULL DEFAULT false,
  
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  deleted_at timestamptz,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  
  CONSTRAINT chk_users_attributes CHECK (jsonb_typeof(attributes) = 'object')
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Add manager FK to departments (circular reference resolved)
ALTER TABLE public.departments
  ADD CONSTRAINT fk_departments_manager
  FOREIGN KEY (manager_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Indexes for users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_employee_id ON public.users(employee_id);
CREATE INDEX idx_users_auth_user ON public.users(auth_user_id);
CREATE INDEX idx_users_org ON public.users(organization_id);
CREATE INDEX idx_users_dept ON public.users(department_id);
CREATE INDEX idx_users_manager ON public.users(manager_id);
CREATE INDEX idx_users_status ON public.users(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_employment_status ON public.users(employment_status);

-- User platform roles
CREATE TABLE IF NOT EXISTS public.user_platform_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  expires_at timestamptz,
  CONSTRAINT uq_user_platform_roles UNIQUE (user_id, role)
);

CREATE INDEX idx_user_platform_roles_user ON public.user_platform_roles(user_id);
CREATE INDEX idx_user_platform_roles_role ON public.user_platform_roles(role);
```

**Verify:** Run `SELECT COUNT(*) FROM public.users;` (should return 0 for empty table).

---

#### **Phase 4-16: Continue with Remaining Tables**

For each remaining phase, copy the corresponding section from the complete SQL schema and execute it in order.

**💡 Pro Tip:** After executing each phase, verify table creation with:

```sql
SELECT 
  table_name, 
  (SELECT COUNT(*) 
   FROM information_schema.columns 
   WHERE columns.table_name = tables.table_name 
   AND columns.table_schema = 'public') as column_count
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

---

## Verification & Testing

### 1. Verify All Tables Created

Run this query to list all tables:

```sql
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected Result:** You should see **50 tables** (or 51 if you count helper function as schema object):

```
organizations
divisions
departments
locations
users
user_platform_roles
groups
user_groups
connectors
integration_instances
applications
accounts
account_match_candidates
entitlements
user_entitlements
account_entitlements
roles
role_entitlements
user_roles
group_roles
access_requests
approval_steps
jml_requests
jml_approvals
jml_task_runs
identity_systems_of_record
isr_attribute_mastership
isr_validators
isr_data_quality_rules
jml_trigger_rules
jml_trigger_conditions
attribute_deltas
policies
policy_rules
policy_conditions
policy_actions
sod_policies
sod_conflicts
certification_campaigns
certification_items
risk_scores
anomalies
audit_events
ai_suggestions
notifications
settings
attribute_mappings
provisioning_jobs
```

---

### 2. Verify Foreign Key Constraints

```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
```

**Expected Result:** A list of all foreign key relationships (100+ rows).

---

### 3. Verify Indexes

```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Expected Result:** 150+ indexes (including primary keys and custom indexes).

---

### 4. Verify Triggers

```sql
SELECT
  event_object_table AS table_name,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

**Expected Result:** 48 `updated_at` triggers (one per table that needs auto-updating timestamps).

---

### 5. Test Helper Function

```sql
-- Create a test table
CREATE TEMP TABLE test_updated_at (
  id serial PRIMARY KEY,
  name text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add trigger
CREATE TRIGGER test_trigger
  BEFORE UPDATE ON test_updated_at
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Insert and update
INSERT INTO test_updated_at (name) VALUES ('test');
SELECT updated_at FROM test_updated_at; -- Note this timestamp

-- Wait a moment and update
SELECT pg_sleep(2);
UPDATE test_updated_at SET name = 'updated';
SELECT updated_at FROM test_updated_at; -- Should be newer timestamp

-- Cleanup
DROP TABLE test_updated_at;
```

**Expected Result:** The `updated_at` timestamp should change after the UPDATE.

---

## Row Level Security (RLS) Setup

Supabase requires Row Level Security for production use. Here's how to set it up:

### 1. Enable RLS on All Tables

**⚠️ WARNING: Only run this after schema is fully created and tested!**

```sql
-- Enable RLS on all public tables
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl.tablename);
  END LOOP;
END $$;
```

---

### 2. Create Basic RLS Policies

#### **Example: Organization-level Multi-tenancy**

```sql
-- Allow users to read data from their organization only
CREATE POLICY "Users can view their org data"
  ON public.users
  FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id 
      FROM public.users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Allow authenticated users to insert (customize as needed)
CREATE POLICY "Authenticated users can insert"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own record
CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  USING (auth_user_id = auth.uid());
```

#### **Template for Other Tables**

Apply similar policies to all tables with `organization_id`:

```sql
-- Template (replace TABLE_NAME)
CREATE POLICY "Org-scoped read access"
  ON public.TABLE_NAME
  FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id 
      FROM public.users 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Org-scoped insert access"
  ON public.TABLE_NAME
  FOR INSERT
  WITH CHECK (
    organization_id = (
      SELECT organization_id 
      FROM public.users 
      WHERE auth_user_id = auth.uid()
    )
  );
```

**📝 Note:** RLS policies should be customized based on your specific security requirements. The above are basic examples.

---

### 3. Create Service Role Policies (For Backend)

If you have a backend service that needs full access:

```sql
-- Allow service role full access (bypass RLS for backend operations)
CREATE POLICY "Service role full access"
  ON public.users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

Apply this pattern to all tables for backend service access.

---

## Seed Data (Optional)

Insert sample data for testing:

### 1. Create Sample Organization

```sql
-- Insert organization
INSERT INTO public.organizations (name, slug, description, is_active)
VALUES 
  ('Acme Corporation', 'acme-corp', 'Sample organization for testing', true)
RETURNING id;

-- Save the returned ID and use it in subsequent inserts
```

### 2. Create Sample Division, Department, Location

```sql
-- Use the organization ID from step 1
WITH org AS (
  SELECT id FROM public.organizations WHERE slug = 'acme-corp'
)
INSERT INTO public.divisions (organization_id, name, slug, description)
SELECT 
  org.id,
  'Product',
  'product',
  'Product division'
FROM org
RETURNING id;

WITH org AS (
  SELECT id FROM public.organizations WHERE slug = 'acme-corp'
), div AS (
  SELECT id FROM public.divisions WHERE slug = 'product'
)
INSERT INTO public.departments (organization_id, division_id, name, slug, description)
SELECT 
  org.id,
  div.id,
  'Engineering',
  'engineering',
  'Engineering department'
FROM org, div
RETURNING id;

WITH org AS (
  SELECT id FROM public.organizations WHERE slug = 'acme-corp'
)
INSERT INTO public.locations (organization_id, name, slug, city, state_province, country)
SELECT 
  org.id,
  'San Francisco HQ',
  'sf-hq',
  'San Francisco',
  'CA',
  'USA'
FROM org;
```

### 3. Create Sample User

```sql
WITH org AS (
  SELECT id FROM public.organizations WHERE slug = 'acme-corp'
), dept AS (
  SELECT id FROM public.departments WHERE slug = 'engineering'
), loc AS (
  SELECT id FROM public.locations WHERE slug = 'sf-hq'
)
INSERT INTO public.users (
  organization_id,
  department_id,
  location_id,
  email,
  username,
  display_name,
  first_name,
  last_name,
  employment_type,
  employment_status,
  status,
  job_title
)
SELECT 
  org.id,
  dept.id,
  loc.id,
  'admin@acme-corp.com',
  'admin',
  'System Administrator',
  'System',
  'Administrator',
  'PERMANENT',
  'ACTIVE',
  'active',
  'System Administrator'
FROM org, dept, loc
RETURNING id, email;
```

### 4. Grant Platform Admin Role

```sql
INSERT INTO public.user_platform_roles (user_id, role)
SELECT id, 'administrator'
FROM public.users
WHERE email = 'admin@acme-corp.com';
```

### 5. Create Sample Application

```sql
WITH org AS (
  SELECT id FROM public.organizations WHERE slug = 'acme-corp'
)
INSERT INTO public.applications (
  organization_id,
  name,
  slug,
  description,
  app_type,
  category,
  is_active,
  supports_provisioning,
  supports_sso
)
SELECT 
  org.id,
  'Azure Active Directory',
  'azure-ad',
  'Corporate Azure AD tenant',
  'cloud',
  'idp',
  true,
  true,
  true
FROM org;
```

---

## Troubleshooting

### Error: "relation already exists"

**Cause:** You're trying to create a table that already exists.

**Solution:**
```sql
-- Drop the existing table (⚠️ WARNING: This deletes all data!)
DROP TABLE IF EXISTS public.TABLE_NAME CASCADE;

-- Or, if you want to keep data, skip recreation
-- The IF NOT EXISTS clause should prevent this error
```

---

### Error: "foreign key constraint violation"

**Cause:** You're executing tables out of order, or referencing data that doesn't exist.

**Solution:**
1. Drop all tables and start fresh:
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON SCHEMA public TO public;
   ```
2. Re-execute schema in correct order (see [Execution Order](#database-schema-execution-order))

---

### Error: "permission denied for schema public"

**Cause:** User doesn't have permissions on public schema.

**Solution:**
```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

---

### Error: "function gen_random_uuid() does not exist"

**Cause:** `pgcrypto` extension not enabled.

**Solution:**
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

**In Supabase:** This extension is usually enabled by default. If not, enable it via **Database** → **Extensions** in the Supabase dashboard.

---

### Error: "check constraint violated"

**Cause:** JSONB fields have invalid data types (e.g., array instead of object).

**Solution:** Ensure JSONB fields use correct types:
- Use `'{}'::jsonb` for objects
- Use `'[]'::jsonb` for arrays
- Check constraint will prevent wrong types

---

### Slow Execution / Timeout

**Cause:** Large schema or connection issues.

**Solution:**
1. Execute in smaller batches (use Method 2: Phases)
2. Increase connection timeout in Supabase settings
3. Use Supabase CLI for local execution:
   ```bash
   supabase db push
   ```

---

### Can't See Tables in Supabase Dashboard

**Cause:** Tables might be in wrong schema or not yet visible.

**Solution:**
1. Refresh the Supabase dashboard
2. Navigate to **Table Editor** → should see all tables
3. If still missing, verify schema:
   ```sql
   SELECT schemaname, tablename 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

---

## Next Steps

After successful database setup:

### 1. **Set Up Supabase Client in Frontend**

```bash
npm install @supabase/supabase-js
```

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

### 2. **Configure Environment Variables**

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these values from **Supabase Dashboard** → **Settings** → **API**.

---

### 3. **Implement RLS Policies (Production)**

Before going to production, create comprehensive RLS policies for:
- Multi-tenancy (organization-level isolation)
- Role-based access (admin, approver, end-user)
- Data ownership (users can only see their own data)
- Audit trail (read-only audit_events)

See [RLS Setup](#row-level-security-rls-setup) section.

---

### 4. **Create Database Functions (Optional)**

Add custom PostgreSQL functions for complex queries:

```sql
-- Example: Get user's effective entitlements (direct + role-based)
CREATE OR REPLACE FUNCTION public.get_user_entitlements(user_uuid uuid)
RETURNS TABLE (
  entitlement_id uuid,
  entitlement_name text,
  source text
) AS $$
BEGIN
  RETURN QUERY
  -- Direct entitlements
  SELECT 
    e.id,
    e.name,
    'direct' AS source
  FROM public.user_entitlements ue
  JOIN public.entitlements e ON e.id = ue.entitlement_id
  WHERE ue.user_id = user_uuid
  
  UNION
  
  -- Role-based entitlements
  SELECT 
    e.id,
    e.name,
    'role:' || r.name AS source
  FROM public.user_roles ur
  JOIN public.role_entitlements re ON re.role_id = ur.role_id
  JOIN public.entitlements e ON e.id = re.entitlement_id
  JOIN public.roles r ON r.id = ur.role_id
  WHERE ur.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 5. **Set Up Backups**

Supabase provides automatic backups, but for production:

1. **Enable Point-in-Time Recovery (PITR)**
   - **Supabase Dashboard** → **Settings** → **Database**
   - Enable PITR (Pro plan required)

2. **Manual Backups**
   ```bash
   # Using pg_dump
   pg_dump -h db.your-project.supabase.co \
     -U postgres \
     -d postgres \
     -f backup_$(date +%Y%m%d).sql
   ```

---

### 6. **Monitor Database Performance**

1. **Enable Query Analytics**
   - **Supabase Dashboard** → **Reports** → **Database**
   - Monitor slow queries, connection pool usage

2. **Add Custom Indexes** (as needed)
   ```sql
   -- Example: Index for frequently filtered columns
   CREATE INDEX idx_access_requests_status_submitted 
   ON public.access_requests(status, submitted_at DESC);
   ```

---

### 7. **Implement Audit Logging**

Create a trigger to auto-log changes to audit_events:

```sql
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_events (
    organization_id,
    actor_id,
    action,
    subject,
    object_id,
    before_value,
    after_value,
    occurred_at
  )
  VALUES (
    NEW.organization_id,
    NEW.updated_by,
    TG_OP,
    TG_TABLE_NAME,
    NEW.id,
    to_jsonb(OLD),
    to_jsonb(NEW),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to tables you want to audit
CREATE TRIGGER trg_users_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();
```

---

### 8. **Data Migration Strategy**

If you have existing data to migrate:

1. **Export from current system**
2. **Transform to match schema**
3. **Import using COPY or batch inserts**
4. **Verify data integrity**

Example COPY command:
```sql
COPY public.users(employee_id, email, first_name, last_name, organization_id)
FROM '/path/to/users.csv'
DELIMITER ','
CSV HEADER;
```

---

### 9. **API Documentation**

Generate API docs using Supabase's auto-generated API:

- **Supabase Dashboard** → **API Docs**
- Copy generated TypeScript types
- Use in your frontend code

Example:
```typescript
import { Database } from './types/supabase';

// Type-safe queries
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('status', 'active');
```

---

### 10. **Testing Checklist**

Before deploying to production:

- [ ] All tables created successfully
- [ ] All foreign keys working
- [ ] Triggers updating `updated_at` correctly
- [ ] RLS policies tested for each role
- [ ] Sample data inserted and retrieved
- [ ] Frontend can connect and query
- [ ] Authentication flow working
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Performance tested with realistic data volume

---

## Summary

You've successfully set up a production-ready IAM/IGA database schema in Supabase! 🎉

**Key Points:**
✅ 50+ tables covering complete IAM/IGA lifecycle
✅ Multi-tenancy ready with organization_id
✅ Supabase Auth integration via auth_user_id
✅ Audit trail for compliance
✅ Flexible JSONB fields for dynamic attributes
✅ Comprehensive indexes for performance
✅ Foreign key constraints for data integrity

**Next:** Connect your frontend application and start building your IAM/IGA platform!

---

## Support & Resources

- **Supabase Documentation**: https://supabase.com/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Supabase Discord**: https://discord.supabase.com
- **GitHub Issues**: Report schema issues in your repository

---

## Appendix: Complete Table List

```
1.  organizations
2.  divisions
3.  departments
4.  locations
5.  users
6.  user_platform_roles
7.  groups
8.  user_groups
9.  connectors
10. integration_instances
11. applications
12. accounts
13. account_match_candidates
14. entitlements
15. user_entitlements
16. account_entitlements
17. roles
18. role_entitlements
19. user_roles
20. group_roles
21. access_requests
22. approval_steps
23. jml_requests
24. jml_approvals
25. jml_task_runs
26. identity_systems_of_record
27. isr_attribute_mastership
28. isr_validators
29. isr_data_quality_rules
30. jml_trigger_rules
31. jml_trigger_conditions
32. attribute_deltas
33. policies
34. policy_rules
35. policy_conditions
36. policy_actions
37. sod_policies
38. sod_conflicts
39. certification_campaigns
40. certification_items
41. risk_scores
42. anomalies
43. audit_events
44. ai_suggestions
45. notifications
46. settings
47. attribute_mappings
48. provisioning_jobs
```

**Total: 48 tables + 2 supporting structures (helper function + triggers)**

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-15  
**Author:** IAM/IGA Platform Team  
**License:** Internal Use Only

