#!/usr/bin/env node

/**
 * Test Pass Database Lookup
 * 
 * This script tests if a specific pass exists in the database
 */

const { createClient } = require('@supabase/supabase-js');

// Your Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eujuwksmqfotanvpsdwc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1anV3a3NtcWZvdGFudnBzZHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDU0NDMsImV4cCI6MjA2OTk4MTQ0M30.uscrCU1eUPS61GdKPYqudVlJdY4LjjPzG9sij25o77Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPassLookup() {
  console.log('🔍 Testing pass lookup for KAIROS-3807...\n');

  try {
    // Test 1: Check if the table exists and has data
    console.log('1. Checking kairos_passes table...');
    const { data: allPasses, error: tableError } = await supabase
      .from('kairos_passes')
      .select('*')
      .limit(5);

    if (tableError) {
      console.error('❌ Error accessing table:', tableError.message);
      return false;
    }

    console.log('✅ Table exists and accessible');
    console.log(`📊 Found ${allPasses.length} passes in table`);
    
    if (allPasses.length > 0) {
      console.log('📋 Sample passes:');
      allPasses.forEach((pass, index) => {
        console.log(`  ${index + 1}. ${pass.pass_id} - ${pass.first_name} ${pass.last_name}`);
      });
    }

    // Test 2: Look for specific pass
    console.log('\n2. Looking for KAIROS-3807...');
    const { data: specificPass, error: lookupError } = await supabase
      .from('kairos_passes')
      .select('*')
      .eq('pass_id', 'KAIROS-3807')
      .single();

    if (lookupError) {
      console.error('❌ Error looking up KAIROS-3807:', lookupError.message);
      
      if (lookupError.code === 'PGRST116') {
        console.log('\n🔍 Pass not found. Let\'s check for similar passes...');
        
        // Check for passes that start with KAIROS-38
        const { data: similarPasses, error: similarError } = await supabase
          .from('kairos_passes')
          .select('pass_id, first_name, last_name')
          .ilike('pass_id', 'KAIROS-38%');

        if (similarError) {
          console.error('❌ Error checking similar passes:', similarError.message);
        } else if (similarPasses.length > 0) {
          console.log('📋 Found similar passes:');
          similarPasses.forEach((pass, index) => {
            console.log(`  ${index + 1}. ${pass.pass_id} - ${pass.first_name} ${pass.last_name}`);
          });
        } else {
          console.log('❌ No passes found starting with KAIROS-38');
        }
      }
      
      return false;
    }

    console.log('✅ Found KAIROS-3807!');
    console.log('📋 Pass details:');
    console.log(`  Name: ${specificPass.first_name} ${specificPass.last_name}`);
    console.log(`  Email: ${specificPass.email}`);
    console.log(`  Phone: ${specificPass.phone_number}`);
    console.log(`  Theme: ${specificPass.theme}`);
    console.log(`  Created: ${specificPass.created_at}`);

    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Kairos Pass Database Test\n');
  
  const success = await testPassLookup();
  
  if (success) {
    console.log('\n✅ Pass lookup test successful!');
    console.log('The pass should be accessible via the API.');
  } else {
    console.log('\n❌ Pass lookup test failed.');
    console.log('Check the database and API configuration.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testPassLookup }; 