# Identity Creation - Database Persistence Fix

## Summary
Fixed identity creation to persist to the Supabase database, ensuring identities survive server restarts and are visible across sessions.

## Changes Made

### 1. Created Edge Function for User Creation
**File:** `supabase/functions/create-user/index.ts`

- Creates auth users via Supabase Admin API
- Creates profile entries in `profiles` table
- Creates organization memberships in `user_orgs` table
- Handles existing users gracefully (upserts)
- Auto-confirms email for admin-created users
- Proper error handling and validation

### 2. Enhanced IdentityService
**File:** `src/services/identityService.ts`

**Added:**
- `CreateIdentityInput` interface for type safety
- `create()` method that:
  - Validates authentication
  - Gets current user's organization
  - Calls the `create-user` edge function
  - Returns created identity with proper error handling
  - Comprehensive logging

### 3. Updated EnhancedIdentitiesPage
**File:** `src/pages/EnhancedIdentitiesPage.tsx`

**Changes:**
- Added `identities` state to store database-loaded identities
- Added `reloadIdentities()` function to fetch from database
- Updated `handleCreateUser()` to:
  - Validate form data (email, password, name)
  - Call `IdentityService.create()` instead of mock
  - Reload identities after successful creation
  - Show proper success/error messages
- Load identities from database on mount
- Use database identities instead of mock data

## How It Works

1. **User fills out create user form** with:
   - First name, last name
   - Email
   - Password (min 8 characters)
   - Optional: department, job title, phone, etc.

2. **Form validation** checks:
   - Required fields (name, email, password)
   - Password length (min 8 chars)
   - Password confirmation match

3. **IdentityService.create()** is called:
   - Gets current user's session
   - Gets current user's organization
   - Calls `create-user` edge function

4. **Edge function**:
   - Creates auth user (or uses existing)
   - Creates/updates profile
   - Creates/updates organization membership
   - Returns created user data

5. **Page reloads identities** from database to show new user

## Database Tables Used

- `auth.users` - Supabase auth users (created via admin API)
- `profiles` - User profile information (email, full_name, mfa_enabled)
- `user_orgs` - Organization memberships (user_id, org_id, role)

## Persistence Guarantees

✅ **Identities persist to database** - Created users are stored in Supabase  
✅ **Survive server restarts** - Data is in database, not memory  
✅ **Visible across sessions** - All users see the same identities  
✅ **Proper error handling** - Clear error messages for failures  
✅ **Validation** - Form validation before submission  

## Testing

To test identity creation:

1. Navigate to Identities page
2. Click "Create User" button
3. Fill out the form:
   - First Name: "Test"
   - Last Name: "User"
   - Email: "test.user@company.com"
   - Password: "password123"
   - Confirm Password: "password123"
4. Click "Create User"
5. Verify:
   - Success toast appears
   - User appears in identities list
   - Refresh page - user still appears
   - Restart server - user still appears
   - Check Supabase dashboard - user exists in `profiles` and `user_orgs` tables

## Edge Function Deployment

**Note:** The edge function needs to be deployed to Supabase for it to work:

```bash
# Deploy the edge function
supabase functions deploy create-user
```

Or use the Supabase dashboard to deploy the function.

## Future Enhancements

- Add department, job title, phone to database schema
- Store additional metadata in profiles or separate table
- Add role assignments during creation
- Add bulk user import
- Add user update functionality
- Add user deletion/deactivation

