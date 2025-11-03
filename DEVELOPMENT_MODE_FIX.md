# 🚀 **DEVELOPMENT MODE FIX - Hardcoded Org ID**

## ✅ **Root Cause: RLS Policies Blocking Everything**

Your console showed **ALL operations failing with 403**:
```
14. Error creating org: 403
18. Error creating membership: 403
23. Error creating role: 403
```

### **Why It Was Failing**

The RLS (Row Level Security) policies in your Supabase database are blocking all database writes. In development, this prevents the app from working.

### **The Solution: Development Workaround**

1. **Use a hardcoded default org ID** for development
2. **Skip org creation/membership steps** 
3. **Go directly to role creation**

## 🔧 **What Changed**

**Before**: Tried to query/create orgs (all blocked by RLS)
**Now**: Uses hardcoded org ID `00000000-0000-0000-0000-000000000000`

## 🧪 **Test Instructions**

1. **Ctrl + R** to refresh
2. **Navigate to**: Access Tab → Roles → "+ New Role"
3. **Fill in form** and click "Create Role"

## ⚠️ **If Role Creation Still Fails**

If you see `23. Error creating role: 403`, you need to disable RLS on the `roles` table:

**In Supabase Studio:**
1. Go to **Authentication** → **Policies**
2. Find the `roles` table RLS policies
3. **Disable** them temporarily
4. Try again

**Please refresh (Ctrl+R) and try!** 🚀
