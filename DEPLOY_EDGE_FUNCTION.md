# How to Deploy the Edge Function

There are two ways to deploy the `create-user` edge function to Supabase:

## Method 1: Using Supabase CLI (Recommended)

### Prerequisites
1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```
   Or download from: https://github.com/supabase/cli/releases

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project (if not already linked):
   ```bash
   supabase link --project-ref your-project-ref
   ```
   You can find your project ref in your Supabase dashboard URL: `https://app.supabase.com/project/your-project-ref`

### Deploy the Function
```bash
# Deploy the create-user function
supabase functions deploy create-user

# Or deploy all functions at once
supabase functions deploy
```

### Verify Deployment
After deployment, you should see output like:
```
Deploying function create-user...
Function create-user deployed successfully
```

## Method 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the left sidebar
3. Click **Create a new function** or find `create-user` if it exists
4. If creating new:
   - Function name: `create-user`
   - Copy the contents of `supabase/functions/create-user/index.ts`
   - Paste into the editor
5. Click **Deploy** or **Save**

## Method 3: Using Supabase CLI with Local Development

If you're running Supabase locally:

```bash
# Start local Supabase (if not running)
supabase start

# Deploy to local instance
supabase functions deploy create-user --no-verify-jwt

# Or serve locally for testing
supabase functions serve create-user
```

## Environment Variables

The edge function needs these environment variables (automatically provided by Supabase):
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (found in Settings > API)

These are automatically injected by Supabase when the function runs, so you don't need to set them manually.

## Testing the Deployment

After deployment, test it by creating a user through your application's "Create User" form. The function should:
1. Create the auth user
2. Create/update the profile with all form fields
3. Create organization membership
4. Return the created user data

## Troubleshooting

### Function not found error
- Make sure the function name matches exactly: `create-user`
- Verify the function is deployed in your Supabase dashboard

### Authentication errors
- Check that your Supabase client is properly configured with the correct URL and anon key
- Verify the user is authenticated before calling the function

### RLS policy errors
- The edge function uses service role, so it bypasses RLS
- If you see RLS errors, make sure the function is using `SUPABASE_SERVICE_ROLE_KEY`

### View Logs
```bash
# View function logs
supabase functions logs create-user

# Or view in dashboard: Edge Functions > create-user > Logs
```

## Quick Deploy Command

For quick deployment, run this from your project root:

```bash
supabase functions deploy create-user --no-verify-jwt
```

The `--no-verify-jwt` flag is useful during development but should be removed for production.

