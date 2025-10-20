# Supabase UI Connection - Setup Complete! 🎉

## ✅ What We've Set Up

Your IAM/IGA UI is now connected to Supabase! Here's what was configured:

### 1. **Package Installed**
- ✅ `@supabase/supabase-js` - Supabase JavaScript client

### 2. **Files Created**

```
├── .env.local                                    # Environment variables (contains your Supabase credentials)
├── src/
│   ├── lib/
│   │   └── supabase.ts                          # Supabase client configuration
│   ├── types/
│   │   └── database.ts                          # TypeScript types for database schema
│   ├── services/
│   │   └── supabase.service.ts                  # Helper functions for database operations
│   ├── hooks/
│   │   └── useSupabase.ts                       # React hook for data fetching
│   └── components/
│       └── SupabaseConnectionTest.tsx           # Test component to verify connection
```

### 3. **Configuration**
- ✅ Environment variables loaded from `.env.local`
- ✅ Supabase client initialized with TypeScript types
- ✅ Service functions for common database operations
- ✅ React hook for easy data fetching in components
- ✅ Test route added to verify connection

---

## 🧪 Test the Connection

### **Step 1: Restart Your Dev Server**

**IMPORTANT:** You must restart the dev server for environment variables to load!

1. **Stop** the currently running dev server (press `Ctrl+C` in terminal)
2. **Start** it again:

```bash
npm run dev
```

Wait for the server to start (usually at `http://localhost:5173`)

---

### **Step 2: Navigate to Test Page**

Once the dev server is running, open your browser and go to:

```
http://localhost:5173/test-connection
```

---

### **Step 3: Check the Results**

You should see one of two outcomes:

#### ✅ **SUCCESS** - Connection Working
```
✅ Connection successful!

Database Statistics:
- Total Users: 0
- Applications: 0
- Pending Requests: 0
- Pending JML: 0

✅ Environment variables loaded correctly
✅ Supabase client initialized
✅ Database connection established
✅ Tables are accessible
```

**If you see this:** 🎉 **Congratulations! Your UI is connected to Supabase!**

---

#### ❌ **ERROR** - Connection Failed

If you see an error, common issues and fixes:

##### **Error: "Missing VITE_SUPABASE_URL environment variable"**
- **Fix:** Make sure `.env.local` file exists in project root
- **Fix:** Restart the dev server after creating/updating `.env.local`

##### **Error: "Failed to perform authorization check"**
- **Fix:** RLS might be re-enabled. Run the disable RLS script again:
  ```sql
  DO $$
  DECLARE
    tbl RECORD;
  BEGIN
    FOR tbl IN 
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    LOOP
      EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', tbl.tablename);
    END LOOP;
  END $$;
  ```

##### **Error: "fetch failed" or network error**
- **Fix:** Check your VITE_SUPABASE_URL is correct (no trailing slash)
- **Fix:** Verify your Supabase project is running
- **Fix:** Check your internet connection

##### **Error: "Invalid API key"**
- **Fix:** Verify VITE_SUPABASE_ANON_KEY is correct
- **Fix:** Make sure you copied the **anon public** key, not service_role

---

## 📚 How to Use Supabase in Your Components

Now that everything is connected, here's how to use it in your application:

### **Option 1: Using the Custom Hook (Recommended)**

```tsx
import { useSupabase } from '../hooks/useSupabase';
import { getUsers } from '../services/supabase.service';

function UsersPage() {
  const { data: users, isLoading, error, refetch } = useSupabase(() => getUsers());

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Users ({users?.length || 0})</h1>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {users?.map(user => (
          <li key={user.id}>{user.display_name || user.email}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

### **Option 2: Using Service Functions Directly**

```tsx
import { useEffect, useState } from 'react';
import { getApplications } from '../services/supabase.service';

function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const data = await getApplications();
        setApps(data);
      } catch (error) {
        console.error('Error fetching apps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Applications ({apps.length})</h1>
      {apps.map(app => (
        <div key={app.id}>{app.name}</div>
      ))}
    </div>
  );
}
```

---

### **Option 3: Direct Supabase Client Usage**

```tsx
import { supabase } from '../lib/supabase';

async function createUser(userData) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: userData.email,
      display_name: userData.name,
      status: 'active',
      employment_status: 'ACTIVE',
      mfa_enabled: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

---

## 📖 Available Service Functions

The `supabase.service.ts` file provides these ready-to-use functions:

### **Organizations**
- `getOrganizations()` - Get all active organizations
- `getOrganizationById(id)` - Get specific organization

### **Users**
- `getUsers(filters?)` - Get users with optional filters
- `getUserById(id)` - Get specific user
- `createUser(user)` - Create new user
- `updateUser(id, updates)` - Update user

### **Applications**
- `getApplications(organizationId?)` - Get applications
- `getApplicationById(id)` - Get specific application

### **Roles**
- `getRoles(organizationId?)` - Get roles
- `getRoleById(id)` - Get specific role

### **Entitlements**
- `getEntitlements(applicationId?)` - Get entitlements
- `getEntitlementById(id)` - Get specific entitlement

### **User Roles**
- `getUserRoles(userId)` - Get user's assigned roles
- `assignRoleToUser(userId, roleId, grantedBy?)` - Assign role
- `removeRoleFromUser(userId, roleId)` - Remove role

### **Access Requests**
- `getAccessRequests(filters?)` - Get access requests

### **JML Requests**
- `getJmlRequests(filters?)` - Get JML requests

### **Certifications**
- `getCertificationCampaigns(organizationId?)` - Get campaigns

### **Audit**
- `getAuditEvents(filters?)` - Get audit events

### **Dashboard**
- `getDashboardStats(organizationId?)` - Get dashboard statistics

---

## 🎨 Example: Update HomePage with Real Data

Replace mock data in `src/pages/HomePage.tsx`:

```tsx
import { useSupabase } from '../hooks/useSupabase';
import { getDashboardStats } from '../services/supabase.service';

export function HomePage() {
  const { data: stats, isLoading } = useSupabase(() => getDashboardStats());

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="p-6">
      <h1>IAM/IGA Dashboard</h1>
      
      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
        />
        <StatCard 
          title="Applications" 
          value={stats?.totalApplications || 0} 
        />
        <StatCard 
          title="Pending Requests" 
          value={stats?.pendingAccessRequests || 0} 
        />
        <StatCard 
          title="Pending JML" 
          value={stats?.pendingJmlRequests || 0} 
        />
      </div>
    </div>
  );
}
```

---

## 🗄️ Seed Data for Testing

Your database is currently empty. Add some test data:

### **1. Create Organization (SQL in Supabase)**

```sql
INSERT INTO public.organizations (name, slug, description, is_active)
VALUES 
  ('Acme Corporation', 'acme-corp', 'Main organization', true)
RETURNING id;
```

Copy the returned `id` and use it below.

---

### **2. Create Test User**

```sql
INSERT INTO public.users (
  organization_id,
  email,
  username,
  display_name,
  first_name,
  last_name,
  employment_status,
  status,
  mfa_enabled
)
VALUES (
  'YOUR-ORG-ID-HERE',  -- Replace with org ID from step 1
  'admin@acme.com',
  'admin',
  'Admin User',
  'Admin',
  'User',
  'ACTIVE',
  'active',
  false
)
RETURNING id;
```

---

### **3. Create Test Application**

```sql
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
VALUES (
  'YOUR-ORG-ID-HERE',  -- Replace with org ID
  'Salesforce',
  'salesforce',
  'CRM Application',
  'saas',
  'Sales',
  true,
  true,
  true
);
```

---

### **4. Refresh Test Page**

Navigate back to `http://localhost:5173/test-connection` and click **Test Connection**.

You should now see:
- Total Users: 1
- Applications: 1

---

## 🚀 Next Steps

### 1. **Replace Mock Data in Existing Pages**

Gradually update your existing pages to use real Supabase data instead of mock data:

- Update `HomePage` with real dashboard stats
- Update `IdentitiesPage` to fetch from `users` table
- Update `AccessPage` to fetch from `applications`, `roles`, `entitlements` tables
- Update `ApprovalsPage` to fetch from `access_requests` table
- Update `JmlPage` to fetch from `jml_requests` table

### 2. **Implement CRUD Operations**

Add create, update, delete functionality:

```tsx
// Example: Create new user
import { createUser } from '../services/supabase.service';

async function handleCreateUser(formData) {
  try {
    const newUser = await createUser({
      email: formData.email,
      display_name: formData.name,
      status: 'active',
      employment_status: 'ACTIVE',
    });
    
    toast.success('User created successfully!');
    // Refresh user list
  } catch (error) {
    toast.error('Failed to create user');
  }
}
```

### 3. **Add Real-time Subscriptions (Optional)**

Supabase supports real-time updates:

```tsx
useEffect(() => {
  const subscription = supabase
    .channel('users-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'users'
    }, (payload) => {
      console.log('User changed:', payload);
      // Refresh user list
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 4. **Implement Authentication**

Add Supabase Auth for user login:

```tsx
import { supabase } from '../lib/supabase';

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}
```

### 5. **Remove Test Route (After Verification)**

Once you've verified the connection works, remove the test route from `src/App.tsx`:

```tsx
// Remove this line:
<Route path="/test-connection" element={<SupabaseConnectionTest />} />
```

---

## 📝 Summary

✅ **Installed:** `@supabase/supabase-js`  
✅ **Created:** Environment variables (`.env.local`)  
✅ **Created:** Supabase client (`src/lib/supabase.ts`)  
✅ **Created:** Database types (`src/types/database.ts`)  
✅ **Created:** Service functions (`src/services/supabase.service.ts`)  
✅ **Created:** React hook (`src/hooks/useSupabase.ts`)  
✅ **Created:** Test component (`src/components/SupabaseConnectionTest.tsx`)  
✅ **Added:** Test route to verify connection  

---

## 🆘 Need Help?

### **Common Issues:**

1. **"Network error"** → Check Supabase URL and internet connection
2. **"Invalid API key"** → Verify anon key in `.env.local`
3. **"Authorization error"** → Disable RLS on all tables
4. **"Module not found"** → Restart dev server after installing packages
5. **"Empty data"** → Add seed data to database

### **Debug Checklist:**

- [ ] `.env.local` exists in project root
- [ ] Environment variables have correct values
- [ ] Dev server restarted after .env changes
- [ ] RLS disabled on all tables
- [ ] Supabase project is running
- [ ] Network connection working
- [ ] Browser console shows no errors

---

## 🎉 Congratulations!

Your IAM/IGA UI is now connected to Supabase and ready for development!

**Test URL:** http://localhost:5173/test-connection

Happy coding! 🚀

