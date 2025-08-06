// Test script for Supabase storage bucket
// Run this with: node test-storage.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://eujuwksmqfotanvpsdwc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1anV3a3NtcWZvdGFudnBzZHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDU0NDMsImV4cCI6MjA2OTk4MTQ0M30.uscrCU1eUPS61GdKPYqudVlJdY4LjjPzG9sij25o77Q'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStorage() {
  try {
    console.log('\n🔍 Fetching list of storage buckets...')
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message)
      return
    }

    console.log('📦 Buckets found:')
    console.table(buckets.map(bucket => ({ Name: bucket.name, CreatedAt: bucket.created_at })))

    const kairosBucket = buckets.find(b => b.name === 'kairos-photos')

    if (!kairosBucket) {
      console.warn('\n⚠️  "kairos-photos" bucket not found. Please create it in your Supabase dashboard.')
      return
    }

    console.log('\n✅ "kairos-photos" bucket exists. Listing files...')

    const { data: files, error: filesError } = await supabase.storage
      .from('kairos-photos')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      })

    if (filesError) {
      console.error('❌ Error listing files:', filesError.message)
    } else {
      console.log(`📂 ${files.length} file(s) found:`)
      if (files.length === 0) {
        console.log('Bucket is currently empty.')
      } else {
        console.table(files.map(file => ({
          Name: file.name,
          Size_kb: (file.metadata.size / 1024).toFixed(2),
          LastModified: file.updated_at
        })))
      }
    }

  } catch (err) {
    console.error('🚨 Unexpected error:', err)
  }
}

testStorage()
