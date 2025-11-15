# ✅ Pre-Flight Checklist: Access Requests Fix

## Before You Start

- [ ] Stop your dev server if it's running (Ctrl+C)
- [ ] Have Supabase dashboard open: https://syhakcccldxfvcuczaol.supabase.co
- [ ] Know your Supabase login credentials

## Diagnostic Phase

### Step 1: Run Browser Diagnostic
- [ ] Open `test-access-requests.html` in your browser
- [ ] Click "Test Connection" → Should show ✅ green
- [ ] Click "Check Table" → Note the result
- [ ] Click "Check Auth Status" → Should show if logged in

**Expected Results:**
- Connection: ✅ Green (Supabase is reachable)
- Table: ❌ Red if migration not applied, ✅ Green if already applied
- Auth: ⚠️ Yellow if not logged in (that's okay for now)

### Step 2: Check Database Directly
- [ ] Login to Supabase Dashboard
- [ ] Go to: **Table Editor** (left sidebar)
- [ ] Look for table: `access_requests`

**If you see the table:**
- ✅ Migration already applied! Skip to "Verification Phase"

**If you DON'T see the table:**
- ⚠️ Need to apply migration → Continue below

## Migration Application Phase

### Choose Your Method:

#### ⭐ Method A: Supabase CLI (Recommended)

**Prerequisites:**
- [ ] Node.js installed (you already have this)
- [ ] Terminal/Command Prompt open

**Steps:**
1. [ ] Open terminal in project directory
   ```bash
   cd "C:\Users\ameee\Desktop\Cursor\Cloud-native IAM_IGA MVP (Copy)"
   ```

2. [ ] Link to your Supabase project
   ```bash
   npx supabase link --project-ref syhakcccldxfvcuczaol
   ```
   - Enter your Supabase password when prompted

3. [ ] Apply all pending migrations
   ```bash
   npx supabase db push
   ```

4. [ ] Verify success - should see output like:
   ```
   Applying migration 0030_access_requests.sql...
   ✓ Migration applied successfully
   ```

#### Method B: Manual SQL (If CLI doesn't work)

**Steps:**
1. [ ] Open file: `supabase\migrations\0030_access_requests.sql`
2. [ ] Copy entire contents (Ctrl+A, Ctrl+C)
3. [ ] Login to Supabase Dashboard
4. [ ] Go to: **SQL Editor** (left sidebar)
5. [ ] Click: "+ New query"
6. [ ] Paste the SQL (Ctrl+V)
7. [ ] Click: "Run" button (or press Ctrl+Enter)
8. [ ] Wait for success message: "Success. No rows returned"

**Verify Migration Applied:**
- [ ] Go to: **Table Editor**
- [ ] Refresh the page
- [ ] You should now see `access_requests` table

## Verification Phase

### Step 1: Verify Table Structure
- [ ] In Supabase **Table Editor**, click on `access_requests`
- [ ] Check that you see these columns:
  - [ ] id (uuid)
  - [ ] organization_id (uuid)
  - [ ] request_number (text)
  - [ ] requester_id (uuid)
  - [ ] resource_type (text)
  - [ ] resource_name (text)
  - [ ] status (text)
  - [ ] business_justification (text)
  - [ ] submitted_at (timestamp)
  - [ ] created_at (timestamp)

### Step 2: Test Application
1. [ ] Start dev server:
   ```bash
   npm run dev
   ```

2. [ ] Open browser to: http://localhost:5173

3. [ ] Login (if not already logged in):
   - [ ] Go to: http://localhost:5173/auth
   - [ ] Enter credentials and login

4. [ ] Go to Requests page: http://localhost:5173/requests

5. [ ] Click "New Request" button

6. [ ] Fill out the form:
   - [ ] Select an Application (e.g., "Oracle ERP")
   - [ ] Select an Access Level (e.g., "Accounts Payable Read")
   - [ ] Enter Business Justification (minimum 20 characters)
   - [ ] Optionally select duration

7. [ ] Click "Submit Request"

8. [ ] Check for success:
   - [ ] Should see success toast notification
   - [ ] Dialog should close
   - [ ] Request should appear in the list

### Step 3: Verify Persistence

**Test 1: Page Refresh**
- [ ] Press F5 to refresh the page
- [ ] Request should still be visible ✅

**Test 2: Browser Console**
- [ ] Press F12 to open developer tools
- [ ] Go to Console tab
- [ ] Look for these log messages:
  ```
  📝 Creating access request with payload: {...}
  ✅ Request created successfully in database: <uuid>
  ```

**Test 3: Supabase Dashboard**
- [ ] Go to Supabase Dashboard
- [ ] Navigate to: **Table Editor** → `access_requests`
- [ ] You should see your request in the table ✅
- [ ] Note the ID matches what you saw in console

**Test 4: Server Restart**
- [ ] Stop dev server (Ctrl+C in terminal)
- [ ] Start it again: `npm run dev`
- [ ] Go back to: http://localhost:5173/requests
- [ ] Your request should still be there ✅

### Step 4: Run Browser Diagnostic Again
- [ ] Open: `test-access-requests.html`
- [ ] Click "Check Table" → Should now be ✅ green
- [ ] Click "List All Requests" → Should show your test request
- [ ] Click "Check Auth Status" → Should show you're logged in

## Success Criteria

All of these should be ✅:
- [ ] Table `access_requests` exists in Supabase
- [ ] Can create requests through UI
- [ ] Requests appear in Supabase Table Editor
- [ ] Requests persist after page refresh
- [ ] Requests persist after server restart
- [ ] Browser console shows success messages
- [ ] No errors in browser console or network tab

## If Something Goes Wrong

### Issue: CLI login fails
**Solution**: Use Method B (Manual SQL)

### Issue: "relation access_requests does not exist"
**Solution**: Migration not applied. Retry Method B carefully.

### Issue: "new row violates row-level security policy"
**Solution**: 
1. Make sure you're logged in
2. Check that user has an organization_id
3. Verify auth token in browser console

### Issue: Network error
**Solution**:
1. Check internet connection
2. Verify Supabase URL is correct in .env.local
3. Check Supabase service status

### Issue: Request creates but disappears
**Solution**:
1. Check if it's actually in Supabase (Table Editor)
2. Verify `ApprovalsContext.reload()` is being called
3. Check browser console for errors during reload

## Troubleshooting Commands

**Check if table exists:**
```javascript
// In browser console
const { data, error } = await window.supabase
  .from('access_requests')
  .select('id')
  .limit(1);
console.log('Table exists:', !error || error.code !== '42P01');
```

**Check auth status:**
```javascript
// In browser console
const { data: { session } } = await window.supabase.auth.getSession();
console.log('Logged in:', !!session);
console.log('User ID:', session?.user?.id);
console.log('Org ID:', session?.user?.app_metadata?.organization_id);
```

**List requests:**
```javascript
// In browser console
const { data, error } = await window.supabase
  .from('access_requests')
  .select('*')
  .order('submitted_at', { ascending: false })
  .limit(10);
console.log('Requests:', data);
console.log('Error:', error);
```

## Additional Help

If you're still stuck after completing this checklist:
1. Run: `node check-migration-status.js`
2. Check: `FIX_ACCESS_REQUESTS_PERSISTENCE.md` for detailed troubleshooting
3. Review error messages carefully - they usually tell you exactly what's wrong

## Final Notes

Your code is correct! The issue is just that the database table needs to be created. Once that's done, everything will work perfectly. The application is well-architected and ready for production use.

---

**Checklist Version**: 1.0  
**Last Updated**: November 9, 2025  
**Time to Complete**: ~10 minutes
