#!/usr/bin/env node

/**
 * Fix Supabase Storage RLS Issue
 * 
 * This script helps you fix the "row-level security policy" error
 * when uploading photos to Supabase storage.
 */

const { createClient } = require('@supabase/supabase-js');

// Your Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eujuwksmqfotanvpsdwc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1anV3a3NtcWZvdGFudnBzZHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDU0NDMsImV4cCI6MjA2OTk4MTQ0M30.uscrCU1eUPS61GdKPYqudVlJdY4LjjPzG9sij25o77Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorageAccess() {
  console.log('🔧 Testing Supabase storage access...\n');

  try {
    // Test 1: List buckets
    console.log('1. Checking available buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message);
      return false;
    }

    const bucketNames = buckets.map(bucket => bucket.name);
    console.log('✅ Available buckets:', bucketNames);

    // Test 2: Check if kairos-photos bucket exists
    const kairosPhotosBucket = buckets.find(bucket => bucket.name === 'kairos-photos');
    if (!kairosPhotosBucket) {
      console.log('❌ kairos-photos bucket not found!');
      console.log('\n📋 To create the bucket:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to Storage');
      console.log('3. Click "Create a new bucket"');
      console.log('4. Name it "kairos-photos"');
      console.log('5. Check "Public bucket"');
      console.log('6. Set file size limit to 5MB');
      console.log('7. Set allowed MIME types to image/*');
      return false;
    }

    console.log('✅ kairos-photos bucket exists!');

    // Test 3: Try to upload a test file
    console.log('\n2. Testing upload permissions...');
    const testBuffer = Buffer.from('test image data');
    
    const { error: uploadError } = await supabase.storage
      .from('kairos-photos')
      .upload('test-upload.txt', testBuffer, {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message);
      
      if (uploadError.message.includes('row-level security policy')) {
        console.log('\n🔧 FIX REQUIRED: Row Level Security (RLS) is blocking uploads');
        console.log('\n📋 To fix this, you have two options:');
        console.log('\nOption A: Disable RLS (Recommended for public events)');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to Storage > kairos-photos');
        console.log('3. Go to the "Settings" tab');
        console.log('4. Check "Disable Row Level Security (RLS)"');
        console.log('5. Save the changes');
        
        console.log('\nOption B: Create RLS policies');
        console.log('1. Go to Storage > kairos-photos > Policies');
        console.log('2. Create these policies:');
        console.log(`
-- Allow public uploads
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'kairos-photos');

-- Allow public read access
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'kairos-photos');

-- Allow public updates
CREATE POLICY "Allow public updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'kairos-photos');
        `);
        
        return false;
      }
      
      return false;
    }

    console.log('✅ Upload test successful!');

    // Test 4: Clean up test file
    console.log('\n3. Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('kairos-photos')
      .remove(['test-upload.txt']);

    if (deleteError) {
      console.log('⚠️  Warning: Could not delete test file:', deleteError.message);
    } else {
      console.log('✅ Test file cleaned up');
    }

    console.log('\n🎉 Storage is working correctly!');
    console.log('You can now upload photos in your app.');
    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Kairos Pass Storage Fix Tool\n');
  
  const success = await testStorageAccess();
  
  if (!success) {
    console.log('\n❌ Storage setup needs to be fixed.');
    console.log('Follow the instructions above to resolve the issue.');
    process.exit(1);
  }
  
  console.log('\n✅ All tests passed! Your storage is ready to use.');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testStorageAccess }; 