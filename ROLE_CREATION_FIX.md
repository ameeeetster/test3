# Role Creation Fix

## Problem
Role creation was failing with errors:
- Edge Function returning 400/404 errors
- RPC function `handle_create_role` not found
- Schema inconsistencies between migrations

## Solution

### 1. Database Migration
A new migration file `0028_fix_role_creation.sql` has been created that:
- Handles schema inconsistencies (with or without `slug` column in `roles` table)
- Creates a robust RPC function `handle_create_role` that works with different schema versions
- Provides better error handling and audit logging

### 2. Code Updates
- **rbacService.ts**: Improved error messages and handling
- **NewRolePage.tsx**: Better error display to users

### 3. How to Apply the Fix

#### Option A: If Using Supabase Cloud
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/0028_fix_role_creation.sql`
4. Run the migration

#### Option B: If Using Local Supabase CLI
1. Stop the dev server (if running)
2. Run migrations:
```bash
supabase migration up
```
Or if using the built-in migration tool:
```bash
supabase db reset
```

### 4. Verify the Fix
1. Start the development server:
```bash
npm run dev
```

2. Navigate to "Create New Role" page
3. Fill in the role details
4. Select permissions
5. Create the role

The role should be created successfully without errors.

## Technical Details

### Schema Inconsistency
The issue was caused by having two different `roles` table definitions:
- Old schema (in `0001_auth_baseline.sql`): included `slug` column
- New schema (in `0019_rbac_schema.sql`): does not include `slug` column

The new migration detects which schema is in use and adapts accordingly.

### Error Handling Improvements
- More specific error messages for common failure scenarios
- Graceful fallback for audit logging
- Better user-facing error messages

## Testing
1. Create a role with various permissions
2. Verify the role appears in the roles list
3. Check audit logs for ROLE_CREATED events
4. Verify permissions are correctly associated with the role

## Rollback
If you need to rollback this change:
```sql
drop function if exists public.handle_create_role(text, text, text[]);
```
Then restore the previous version of `0027_final_create_role_rpc.sql`.

