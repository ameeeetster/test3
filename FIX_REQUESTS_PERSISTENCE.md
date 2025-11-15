# Access Requests Not Persisting - SOLUTION

## Problem Diagnosis

You're experiencing two issues:
1. **Requests not being stored in Supabase tables**
2. **Data gets deleted when server restarts**

## Root Causes Identified

### 1. **Development Auth Bypass Mode**
Your `ApprovalsContext.tsx` has a development bypass that stores requests in **localStorage** instead of the database when:
- `VITE_DEV_AUTH_BYPASS=true` is set
- User is not authenticated

```typescript
const devBypass = (import.meta.env.VITE_DEV_AUTH_BYPASS === 'true') && !session;
```

This explains why data disappears on server restart - it's only in browser localStorage!

### 2. **Missing Authentication Context**
The code requires authentication but may not be properly checking user session during request creation.

### 3. **RLS Policies May Be Too Permissive**
The migration `0030_access_requests.sql` has placeholder policies:
```sql
-- TODO: tighten with organization scoping and role checks
```

## SOLUTION - Step-by-Step Fix

### Step 1: Update Environment Variables

Create/update your `.env.local` file:

```env
VITE_SUPABASE_URL=https://syhakcccldxfvcuczaol.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aGFrY2NjbGR4ZnZjdWN6YW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDQ4NzIsImV4cCI6MjA3NjA4MDg3Mn0.6OrFNSpbZws2xRZkAWOjjaHoIP1pjPkP_oSupIkXrqQ

# IMPORTANT: Remove or set to false to force database persistence
# VITE_DEV_AUTH_BYPASS=false
```

**Remove the `VITE_DEV_AUTH_BYPASS` line or set it to `false`**

### Step 2: Fix ApprovalsContext to Always Use Database

Update `src/contexts/ApprovalsContext.tsx`:

```typescript
const submitAccessRequest: ApprovalsContextValue['submitAccessRequest'] = useCallback(async (req) => {
  // ALWAYS require authentication - no bypass
  const res = await supabase.auth.getSession();
  const session = res.data.session;
  const sessionError = res.error;
  
  if (sessionError || !session) {
    const error = new Error('You must be authenticated to create requests. Please sign in.');
    console.error('Authentication required:', sessionError || 'No session');
    throw error;
  }

  const durationDays = computeDurationDaysFromDate(req.duration);

  // ALWAYS save directly to Supabase - NO BYPASS
  const created = await RequestsService.create({
    resource_type: req.item.type,
    resource_name: req.item.name,
    business_justification: req.businessJustification,
    risk_level: req.risk,
    sod_conflicts_count: req.sodConflicts ?? 0,
    duration_days: durationDays,
  });

  const mapped: ApprovalRequest = {
    id: created.id,
    requester: req.requester,
    item: req.item,
    status: 'Pending',
    risk: req.risk,
    age: '0d',
    slaRemaining: '3d',
    submittedAt: created.submitted_at,
    businessJustification: req.businessJustification,
    duration: req.duration,
    sodConflicts: req.sodConflicts ?? 0,
    peerCoverage: req.peerCoverage,
    lastUsed: req.lastUsed,
    usageData: req.usageData,
    impactItems: req.impactItems,
  };

  setRequests(prev => {
    const next = [mapped, ...prev.filter(p => p.id !== mapped.id)];
    saveCache(next); // Cache is backup only
    return next;
  });

  return mapped;
}, []);
```

### Step 3: Improve RLS Policies for Production

Update the database migration to add proper org-scoped policies:

Create a new migration file: `supabase/migrations/0031_fix_access_requests_rls.sql`

```sql
-- Fix Access Requests RLS Policies with Organization Scoping

-- Drop old permissive policies
drop policy if exists access_requests_select_all on public.access_requests;
drop policy if exists access_requests_insert_all on public.access_requests;

-- Helper function to get current user's organization
create or replace function public.current_org_id()
returns uuid
language sql
stable
as $$
  select (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid;
$$;

-- SELECT: Users can see requests in their organization
create policy access_requests_select_org
  on public.access_requests for select
  to authenticated 
  using (
    organization_id = current_org_id()
    or organization_id is null -- allow null for now during dev
  );

-- INSERT: Users can create requests in their organization
create policy access_requests_insert_org
  on public.access_requests for insert
  to authenticated 
  with check (
    organization_id = current_org_id()
    or organization_id is null -- allow null for now during dev
  );

-- UPDATE: Users can update requests in their organization
create policy access_requests_update_org
  on public.access_requests for update
  to authenticated 
  using (
    organization_id = current_org_id()
    or organization_id is null
  )
  with check (
    organization_id = current_org_id()
    or organization_id is null
  );

-- DELETE: Only admins can delete (optional)
create policy access_requests_delete_admin
  on public.access_requests for delete
  to authenticated 
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
```

### Step 4: Enhance RequestsService to Auto-Set Organization

Update `src/services/requestsService.ts` to automatically include organization_id and requester_id:

```typescript
import { supabase } from '../lib/supabase';

export interface CreateAccessRequestInput {
  organization_id?: string | null;
  requester_id?: string | null;
  for_user_id?: string | null;
  resource_type: string;
  resource_id?: string | null;
  resource_name: string;
  priority?: string | null;
  business_justification?: string | null;
  duration_type?: string | null;
  duration_days?: number | null;
  risk_level?: string | null;
  risk_score?: number | null;
  sod_conflicts_count?: number | null;
}

export interface AccessRequestRow {
  id: string;
  request_number: string;
  status: string;
  submitted_at: string;
  resource_name: string;
  resource_type: string;
  business_justification: string | null;
  organization_id?: string | null;
  requester_id?: string | null;
}

export class RequestsService {
  static async create(input: CreateAccessRequestInput) {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required to create requests');
    }

    // Auto-populate organization_id and requester_id from session
    const userId = session.user.id;
    const orgId = session.user.app_metadata?.organization_id || null;

    const requestNumber = `REQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    
    const payload = {
      ...input,
      organization_id: input.organization_id || orgId,
      requester_id: input.requester_id || userId,
      request_number: requestNumber,
      status: 'PENDING',
    };

    console.log('Creating access request with payload:', payload);

    const { data, error } = await supabase
      .from('access_requests')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Failed to create request: ${error.message}`);
    }

    console.log('✅ Request created successfully:', data);
    return data as AccessRequestRow;
  }

  static async listPending() {
    const { data, error } = await supabase
      .from('access_requests')
      .select('*')
      .eq('status', 'PENDING')
      .order('submitted_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
    
    return (data ?? []) as AccessRequestRow[];
  }

  static async listAll(limit: number = 100) {
    const { data, error } = await supabase
      .from('access_requests')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching all requests:', error);
      throw error;
    }
    
    return (data ?? []) as AccessRequestRow[];
  }

  static async updateStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    const updateData: any = { status };
    
    // Set timestamp based on status
    if (status === 'APPROVED') {
      updateData.approved_at = new Date().toISOString();
      updateData.completed_at = new Date().toISOString();
    } else if (status === 'REJECTED') {
      updateData.rejected_at = new Date().toISOString();
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('access_requests')
      .update(updateData)
      .eq('id', id)
      .select('id, status')
      .single();
    
    if (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
    
    return data as { id: string; status: string };
  }
}
```

### Step 5: Verify Database Table Exists

Run this SQL in your Supabase SQL Editor to verify:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'access_requests'
);

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'access_requests'
ORDER BY ordinal_position;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'access_requests';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'access_requests';
```

### Step 6: Testing the Fix

1. **Clear localStorage** (to remove old cached data):
```javascript
// Run in browser console
localStorage.removeItem('approvals-requests-cache-v1');
```

2. **Restart your dev server**:
```bash
npm run dev
```

3. **Test request creation**:
   - Login to the application
   - Go to Requests page
   - Click "New Request"
   - Fill out the form
   - Submit

4. **Verify in Supabase**:
   - Go to Supabase Dashboard
   - Navigate to Table Editor
   - Select `access_requests` table
   - You should see your new request

### Step 7: Debug Checklist

If still not working, check these:

✅ **Authentication Status**
```typescript
// Add to your component
const checkAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Session:', session);
  console.log('User ID:', session?.user.id);
  console.log('Org ID:', session?.user.app_metadata?.organization_id);
};
```

✅ **Network Tab**
- Open browser DevTools → Network tab
- Look for POST request to `/rest/v1/access_requests`
- Check request payload
- Check response (should be 201 Created)

✅ **Console Logs**
- Check for error messages
- Look for "Request created successfully" log
- Check for RLS policy violations

✅ **Supabase Logs**
- Go to Supabase Dashboard → Logs
- Check for any errors or policy violations

## Common Issues & Solutions

### Issue 1: "new row violates row-level security policy"
**Solution**: The organization_id in JWT doesn't match. Check:
```sql
-- Run in Supabase SQL Editor
select auth.uid(), auth.jwt();
```

### Issue 2: "null value in column 'organization_id'"
**Solution**: User's JWT doesn't have organization_id in app_metadata. Update user:
```sql
update auth.users 
set raw_app_meta_data = 
  jsonb_set(
    coalesce(raw_app_meta_data, '{}'::jsonb),
    '{organization_id}',
    '"YOUR-ORG-UUID"'::jsonb
  )
where id = 'USER-UUID';
```

### Issue 3: Requests appear but disappear on refresh
**Solution**: This means they're in localStorage only. Follow Step 1-2 above.

### Issue 4: "relation 'access_requests' does not exist"
**Solution**: Run the migration:
```bash
# If using Supabase CLI
supabase db push

# Or manually in SQL Editor - copy contents of:
# supabase/migrations/0030_access_requests.sql
```

## Quick Implementation Guide

### File 1: Fix ApprovalsContext.tsx
