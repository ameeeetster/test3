# 🔧 Fix: Access Requests Not Persisting to Database

## Problem Diagnosis

You're experiencing an issue where:
1. ✅ Requests can be created in the UI
2. ❌ Requests are NOT being saved to Supabase database
3. ❌ Requests disappear on server restart

## Root Causes Identified

### 1. **Migration Not Applied**
The `0030_access_requests.sql` migration file exists but may not have been applied to your Supabase database.

### 2. **Code Already Correct**
Your application code is actually CORRECT:
- ✅ `RequestsService.create()` calls `supabase.from('access_requests').insert()`
- ✅ Authentication is properly checked
- ✅ Data structure matches the table schema

## Solution Steps

### Step 1: Verify Database Connection
First, verify your Supabase connection is working:

```bash
npm run dev
```

Then visit: http://localhost:5173/test-connection

### Step 2: Check if Table Exists
Run the diagnostic SQL script I created:

1. Open Supabase Dashboard: https://syhakcccldxfvcuczaol.supabase.co
2. Go to **SQL Editor**
3. Copy and run: `diagnostic_access_requests.sql`

### Step 3: Apply Migration (If Table Doesn't Exist)

#### Option A: Using Supabase CLI (Recommended)

```bash
# Navigate to your project directory
cd "C:\Users\ameee\Desktop\Cursor\Cloud-native IAM_IGA MVP (Copy)"

# Login to Supabase (if not already)
npx supabase login

# Link to your project
npx supabase link --project-ref syhakcccldxfvcuczaol

# Apply all pending migrations
npx supabase db push
```

#### Option B: Manual SQL Execution

If Supabase CLI doesn't work, manually run the migration:

1. Open: `supabase/migrations/0030_access_requests.sql`
2. Copy the entire content
3. Go to Supabase Dashboard → SQL Editor
4. Paste and run the SQL

### Step 4: Verify Table Creation

After applying the migration, run this quick check:

```sql
-- Check table exists and has correct structure
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'access_requests';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'access_requests';
```

### Step 5: Test Request Creation

1. **Ensure you're logged in** to the application
2. Navigate to: http://localhost:5173/requests
3. Click "New Request"
4. Fill out the form:
   - Application: Select any app
   - Access Level: Select any level
   - Justification: Enter at least 20 characters
5. Click "Submit Request"
6. Check browser console for logs (F12 → Console)

### Step 6: Verify Data Persistence

Run this query in Supabase SQL Editor:

```sql
SELECT * FROM public.access_requests 
ORDER BY submitted_at DESC 
LIMIT 10;
```

You should see your newly created requests!

## Why This Is Happening

The issue is **NOT** with your code. Your application is correctly configured to:
- ✅ Authenticate users before creating requests
- ✅ Insert data directly into Supabase
- ✅ Use the correct table and column names
- ✅ Handle errors properly

The problem is that the database table doesn't exist yet or the migration wasn't applied.

## Expected Console Logs

When successfully creating a request, you should see:

```
📝 Creating access request with payload: {...}
✅ Request created successfully in database: <uuid>
```

If the table doesn't exist, you'll see:

```
❌ Supabase insert error: {
  code: '42P01',
  message: 'relation "public.access_requests" does not exist'
}
```

## Troubleshooting

### Issue: "relation access_requests does not exist"
**Solution**: Apply the migration (Step 3)

### Issue: "new row violates row-level security policy"
**Solution**: Ensure you're logged in. The RLS policies require authentication.

### Issue: "null value in column organization_id violates not-null constraint"
**Solution**: This shouldn't happen as the column is nullable, but ensure your user has an organization_id in their JWT token.

### Issue: Requests still disappear on restart
**Verify**:
1. Check that data exists in Supabase Dashboard → Table Editor → access_requests
2. Ensure you're not using "Incognito" mode or clearing localStorage
3. Check that `ApprovalsContext.reload()` is being called on mount

## Code Changes (If Needed)

Your code is already correct! No changes needed to these files:
- ✅ `src/components/NewRequestDialog.tsx` - Correctly calls submitAccessRequest
- ✅ `src/contexts/ApprovalsContext.tsx` - Correctly calls RequestsService.create
- ✅ `src/services/requestsService.ts` - Correctly inserts to Supabase

## Testing After Fix

1. Create a new request
2. Refresh the page (F5) → Request should still be there
3. Stop dev server (Ctrl+C)
4. Start dev server again (`npm run dev`)
5. Navigate to /requests → Request should still be there
6. Check Supabase Dashboard → Request should be in access_requests table

## Additional Verification

### Check User Session
Run this in browser console (F12):

```javascript
const session = await window.supabase.auth.getSession();
console.log('User ID:', session.data.session?.user.id);
console.log('Org ID:', session.data.session?.user.app_metadata?.organization_id);
```

### Check Recent Requests
Run this in browser console:

```javascript
const { data, error } = await window.supabase
  .from('access_requests')
  .select('*')
  .order('submitted_at', { ascending: false })
  .limit(5);
console.log('Recent Requests:', data);
console.log('Error (if any):', error);
```

## Summary

**The Fix**: Apply the `0030_access_requests.sql` migration to your Supabase database.

**The Code**: Already correct and doesn't need changes.

**Expected Result**: Requests will persist in the database and survive server restarts.

Let me know the results after running the diagnostic SQL script!
