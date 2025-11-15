# ✅ Next Steps After Deploying Edge Function

## Step 1: Run Database Migration (REQUIRED)

You need to add the new columns to the `profiles` table so all form fields can be saved.

### Option A: Using Supabase SQL Editor (Easiest)

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **+ New query**

3. **Copy and Run Migration**
   - Open file: `supabase/migrations/0035_extend_profiles_with_identity_fields.sql`
   - Copy the entire contents (Ctrl+A, Ctrl+C)
   - Paste into SQL Editor (Ctrl+V)
   - Click **Run** button (or press Ctrl+Enter)

4. **Verify Success**
   - You should see: "Success. No rows returned"
   - Go to **Table Editor** → Click on `profiles` table
   - You should see new columns: `first_name`, `last_name`, `phone`, `department`, `job_title`, `status`, `risk_level`, `username`, `account_expiration`, `require_password_change`, `notes`

### Option B: Using Supabase CLI

```bash
# Navigate to project directory
cd "C:\Users\ameee\Desktop\Cursor\Cloud-native IAM_IGA MVP (Copy)"

# Link to your project (if not already linked)
npx supabase link --project-ref your-project-ref

# Apply the migration
npx supabase db push
```

## Step 2: Test Creating a User

1. **Start your dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Open your application**:
   - Go to: http://localhost:5173
   - Navigate to **Identities** page

3. **Create a test user**:
   - Click **"Create User"** button
   - Fill out the form:
     - **First Name**: Test
     - **Last Name**: User
     - **Email**: test.user@company.com
     - **Password**: password123 (min 8 characters)
     - **Confirm Password**: password123
     - **Department**: IT (or any department)
     - **Username**: testuser
     - Fill other fields as desired
   - Click **"Create User"**

4. **Verify Success**:
   - ✅ Should see success toast: "User created successfully!"
   - ✅ User should appear in the identities list
   - ✅ Refresh the page (F5) - user should still be there
   - ✅ Check Supabase Dashboard → Table Editor → `profiles` table
     - You should see the new user with all the form fields populated

## Step 3: Verify Data in Database

1. **In Supabase Dashboard**:
   - Go to **Table Editor**
   - Click on `profiles` table
   - Find your test user by email
   - Verify these columns have data:
     - `first_name`
     - `last_name`
     - `phone` (if you filled it)
     - `department`
     - `job_title` (if you filled it)
     - `status`
     - `risk_level`
     - `username`
     - `notes` (if you filled it)

## Troubleshooting

### If you get "column does not exist" error:
- The migration wasn't applied successfully
- Go back to Step 1 and make sure you ran the SQL migration

### If user creation fails:
- Check browser console (F12) for error messages
- Check Supabase Edge Functions logs:
  - Dashboard → Edge Functions → create-user → Logs tab
- Verify the edge function is deployed:
  - Dashboard → Edge Functions → Should see `create-user` in the list

### If user is created but fields are missing:
- Check that the migration added all columns
- Run this SQL to verify columns exist:
  ```sql
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'profiles' 
  AND column_name IN ('first_name', 'last_name', 'phone', 'department', 'job_title', 'status', 'risk_level', 'username', 'account_expiration', 'require_password_change', 'notes');
  ```

## Success Checklist

- [ ] Migration applied successfully
- [ ] Edge function deployed
- [ ] Can create a user through the form
- [ ] User appears in identities list
- [ ] User persists after page refresh
- [ ] All form fields are saved in database
- [ ] Can see user data in Supabase Table Editor

## You're Done! 🎉

Once all steps are complete, your identity creation form will:
- ✅ Save all form fields to the database
- ✅ Persist data across sessions
- ✅ Work with the edge function
- ✅ Handle organization creation automatically

