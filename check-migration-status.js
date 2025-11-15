#!/usr/bin/env node

/**
 * Quick Migration Applicator
 * This script helps apply the access_requests migration to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://syhakcccldxfvcuczaol.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aGFrY2NjbGR4ZnZjdWN6YW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDQ4NzIsImV4cCI6MjA3NjA4MDg3Mn0.6OrFNSpbZws2xRZkAWOjjaHoIP1pjPkP_oSupIkXrqQ';

console.log('\n🔧 Access Requests Migration Helper\n');
console.log('Supabase URL:', supabaseUrl);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableExists() {
  console.log('\n📋 Step 1: Checking if access_requests table exists...');
  
  try {
    const { data, error } = await supabase
      .from('access_requests')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Table does NOT exist');
        return false;
      }
      throw error;
    }
    
    console.log('✅ Table already exists!');
    return true;
  } catch (error) {
    console.error('❌ Error checking table:', error.message);
    return false;
  }
}

async function countRequests() {
  console.log('\n📊 Step 2: Counting existing requests...');
  
  try {
    const { data, error, count } = await supabase
      .from('access_requests')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    console.log(`✅ Found ${count || 0} requests in database`);
    return count || 0;
  } catch (error) {
    console.error('❌ Error counting requests:', error.message);
    return 0;
  }
}

async function listRecentRequests() {
  console.log('\n📝 Step 3: Listing recent requests...');
  
  try {
    const { data, error } = await supabase
      .from('access_requests')
      .select('id, request_number, status, resource_name, submitted_at')
      .order('submitted_at', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    
    if (data.length === 0) {
      console.log('⚠️  No requests found');
    } else {
      console.log(`✅ Recent ${data.length} requests:`);
      data.forEach(req => {
        console.log(`   - ${req.request_number}: ${req.resource_name} (${req.status})`);
      });
    }
  } catch (error) {
    console.error('❌ Error listing requests:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting diagnostic...\n');
  
  const tableExists = await checkTableExists();
  
  if (!tableExists) {
    console.log('\n⚠️  MIGRATION REQUIRED!');
    console.log('\nThe access_requests table does not exist in your Supabase database.');
    console.log('You need to apply the migration. Here are your options:\n');
    console.log('Option 1: Using Supabase CLI (Recommended)');
    console.log('  1. Run: npx supabase link --project-ref syhakcccldxfvcuczaol');
    console.log('  2. Run: npx supabase db push\n');
    console.log('Option 2: Manual SQL Execution');
    console.log('  1. Open Supabase Dashboard → SQL Editor');
    console.log('  2. Copy content from: supabase/migrations/0030_access_requests.sql');
    console.log('  3. Paste and execute in SQL Editor\n');
    console.log('For detailed instructions, see: FIX_ACCESS_REQUESTS_PERSISTENCE.md\n');
    process.exit(1);
  }
  
  await countRequests();
  await listRecentRequests();
  
  console.log('\n✅ Diagnostic complete!');
  console.log('\nYour access_requests table is properly set up.');
  console.log('If requests are not persisting, check:');
  console.log('  1. You are logged in when creating requests');
  console.log('  2. Check browser console for errors (F12)');
  console.log('  3. Verify RLS policies allow your user to insert\n');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
