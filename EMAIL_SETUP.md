# Email Setup Guide for Kairos Pass

## Overview
This guide will help you set up email functionality to send HTML passes to users via email using Resend.

## Step 1: Sign up for Resend
1. Go to [https://resend.com](https://resend.com)
2. Create a free account (3,000 emails/month free)
3. Verify your email address

## Step 2: Get API Key
1. In your Resend dashboard, go to "API Keys"
2. Click "Create API Key"
3. Give it a name (e.g., "Kairos Pass Emails")
4. Copy the API key

## Step 3: Verify Domain (Optional but Recommended)
1. In Resend dashboard, go to "Domains"
2. Add your domain (e.g., `yourdomain.com`)
3. Follow the DNS verification steps
4. Once verified, you can send from `noreply@yourdomain.com`

## Step 4: Environment Variables
Create a `.env.local` file in your project root with:

```bash
# Resend API Key
RESEND_API_KEY=your_actual_api_key_here

# Your app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# From email (use your verified domain)
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## Step 5: Update Email Configuration
In `app/api/send-pass-email/route.ts`, update the `from` field:

```typescript
from: 'Kairos Pass <noreply@yourdomain.com>', // Update with your verified domain
```

## Step 6: Test the Email
1. Start your development server
2. Go to a pass page
3. Click "Send Pass to Email"
4. Check your email inbox

## Features
- ✅ HTML email with embedded pass design
- ✅ Responsive email template
- ✅ Fallback link to online pass
- ✅ Professional styling
- ✅ Loading states and error handling

## Troubleshooting
- **Email not sending**: Check your API key and domain verification
- **Pass not rendering**: Ensure the pass HTML is being generated correctly
- **Spam folder**: Check if emails are going to spam initially

## Cost
- **Free tier**: 3,000 emails/month
- **Paid plans**: Start at $20/month for 50,000 emails
- **Pay-as-you-go**: $0.80 per 1,000 emails

## Security Notes
- Never commit your API key to version control
- Use environment variables for sensitive data
- Consider rate limiting for production use 