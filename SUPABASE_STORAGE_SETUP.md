# 🗂️ Supabase Storage Setup for Kairos Pass

This guide will help you set up the storage bucket in Supabase for storing user photos in the Kairos Pass app.

## 📋 Prerequisites

- Supabase account with project: `eujuwksmqfotanvpsdwc`
- Access to Supabase dashboard
- Your project URL: `https://eujuwksmqfotanvpsdwc.supabase.co`

## 🚀 Step-by-Step Setup

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project: `eujuwksmqfotanvpsdwc`

### Step 2: Create Storage Bucket

1. **Navigate to Storage**:
   - Click "Storage" in the left sidebar
   - Click "Create a new bucket"

2. **Configure Bucket**:
   - **Bucket name**: `kairos-photos`
   - **Public bucket**: ✅ Check this box
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/*`

3. **Create the bucket**

### Step 3: Storage Security Setup

You have two options for security:

#### Option A: Disable RLS (Recommended for public events)

1. **Go to Storage > Policies**:
   - Click on your `kairos-photos` bucket
   - Go to the "Settings" tab
   - **Disable Row Level Security (RLS)**: ✅ Check this box

This allows anyone to upload photos, which is appropriate for a public event app.

#### Option B: Configure RLS Policies (If you want more control)

1. **Go to Storage > Policies**:
   - Click on your `kairos-photos` bucket
   - Go to the "Policies" tab

2. **Create Upload Policy**:
   ```sql
   -- Allow public uploads to the kairos-photos bucket
   CREATE POLICY "Allow public uploads" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'kairos-photos');
   ```

3. **Create Read Policy**:
   ```sql
   -- Allow public read access to photos
   CREATE POLICY "Allow public read access" ON storage.objects
   FOR SELECT USING (bucket_id = 'kairos-photos');
   ```

4. **Create Update Policy**:
   ```sql
   -- Allow public updates to photos
   CREATE POLICY "Allow public updates" ON storage.objects
   FOR UPDATE USING (bucket_id = 'kairos-photos');
   ```

### Step 4: Test the Setup

Run the test script to verify everything is working:

```bash
node test-storage.js
```

Expected output:
```
Testing Supabase storage bucket...
Available buckets: [..., 'kairos-photos', ...]
✅ kairos-photos bucket exists!
Files in bucket: []
```

## 🔧 Configuration Details

### Environment Variables

Your `.env` file should contain:
```env
NEXT_PUBLIC_SUPABASE_URL=https://eujuwksmqfotanvpsdwc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1anV3a3NtcWZvdGFudnBzZHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDU0NDMsImV4cCI6MjA2OTk4MTQ0M30.uscrCU1eUPS61GdKPYqudVlJdY4LjjPzG9sij25o77Q
```

### API Route Configuration

The upload API route (`app/api/upload-photo/route.ts`) is already configured to use:
- Bucket name: `kairos-photos`
- File naming: `${passId}-${timestamp}.${fileExtension}`
- Content type: `image/jpeg`

## 📁 File Structure

```
kairos-photos/
├── pass-selfies/
│   ├── KAIROS-1234-1703123456789.jpg
│   ├── KAIROS-5678-1703123456790.png
│   └── ...
```

## 🔒 Security Considerations

1. **Public Read Access**: Photos are publicly readable for social media sharing
2. **Public Uploads**: Anyone can upload photos (appropriate for public events)
3. **File Size Limits**: 5MB limit prevents abuse
4. **Image Types Only**: Only image files are allowed

## 🐛 Troubleshooting

### Common Issues:

1. **Bucket not found**:
   - Verify bucket name is exactly `kairos-photos`
   - Check bucket is created in the correct project

2. **Upload permissions denied**:
   - If using RLS, verify policies are created correctly
   - Consider disabling RLS for public event apps
   - Check that policies include the correct bucket_id

3. **File size too large**:
   - Increase file size limit in bucket settings
   - Ensure client-side compression is working

### Testing Commands:

```bash
# Test storage connection
node test-storage.js

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 📱 Usage in App

The storage bucket is used in:
- `components/pass-viewer.tsx` - Photo upload functionality
- `app/api/upload-photo/route.ts` - Server-side upload handling

Photos are automatically:
1. Compressed in the browser
2. Uploaded to Supabase storage
3. Displayed immediately on the pass
4. Included in the final downloadable pass

## 🎯 Next Steps

After setting up the bucket:
1. Test the photo upload feature in your app
2. Verify photos are being stored correctly
3. Check that the download functionality includes photos
4. Test social media sharing with photos

---

**Need help?** Check the Supabase documentation or create an issue in your project repository. 