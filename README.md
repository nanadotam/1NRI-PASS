# Kairos Pass - A 1NRI Experience

A modern, aesthetic, and data-collecting pass-generating React app built with Next.js, Shadcn/UI, and Supabase. Perfect for events, social media sharing, and attendee management.

## Features

- ✨ **Beautiful UI**: Modern design with Shadcn/UI components
- 🎨 **Brand Integration**: 1NRI and Kairos logos throughout the app
- 📱 **Mobile-First**: Responsive design optimized for all devices
- 🎫 **Pass Generation**: Custom QR-coded passes with personalized messages
- 📊 **Data Collection**: Form-based attendee registration
- 🔍 **QR Verification**: Pass verification system
- 🌙 **Dark/Light Mode**: Theme support
- 📤 **Social Sharing**: Easy sharing for social media
- 💾 **Supabase Backend**: Real-time database integration

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Shadcn/UI, TailwindCSS
- **Backend**: Supabase (PostgreSQL)
- **QR Codes**: qrcode.react
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
git clone <your-repo>
cd kairos-pass
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

1. Create a new Supabase project
2. In the SQL Editor, run the schema from `database-schema.sql`
3. This creates the `attendees` table with proper RLS policies

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
kairos-pass/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── attendees/        # Attendee management
│   │   └── verify/           # Pass verification
│   ├── admin/                # Admin dashboard
│   ├── pass/                 # Pass display
│   ├── register/             # Registration form
│   ├── scanner/              # QR scanner
│   └── verify/               # Pass verification
├── components/               # React components
│   ├── ui/                   # Shadcn/UI components
│   ├── home-page.tsx         # Landing page
│   ├── registration-form.tsx # Registration form
│   ├── pass-display.tsx      # Pass generation
│   └── verify-page.tsx       # Pass verification
├── contexts/                 # React contexts
├── lib/                      # Utilities
│   └── supabase/            # Supabase clients
└── public/                   # Static assets
    └── images/               # Logos and images
```

## Pages Overview

### 1. Homepage (`/`)
- 1NRI and Kairos branding
- Event introduction
- Call-to-action to register

### 2. Registration (`/register`)
- Data collection form
- Fields: Name, Email, Phone, How they heard about event
- Form validation with Zod

### 3. Pass Display (`/pass`)
- Generated pass with QR code
- Personalized Bible verses and Gen Z messages
- Download and share functionality

### 4. Verification (`/verify/[id]`)
- Public pass verification page
- Displays attendee information
- Confirms pass authenticity

### 5. Admin Dashboard (`/admin`)
- Attendee management
- Statistics and analytics
- CSV export functionality

### 6. QR Scanner (`/scanner`)
- Camera-based QR code scanning
- Entry verification for events
- Real-time status updates

## Customization

### Messages and Verses

Update the messages in `components/pass-display.tsx`:

```typescript
const genZMessages = [
  "You didn't just show up. You aligned. 🔥",
  // Add your custom messages
];

const bibleVerses = [
  "For I know the plans I have for you... - Jeremiah 29:11",
  // Add your verses
];
```

### Styling

- Colors are defined in `tailwind.config.ts`
- Shadcn/UI components can be customized in `components/ui/`
- Global styles in `app/globals.css`

### Logos

Replace the logos in `public/images/`:
- `1NRI Logo - Fixed - Transparent (1).png`
- `kairos_PNG_UHD.png`

## API Endpoints

- `POST /api/attendees` - Create new attendee
- `GET /api/attendees` - Get all attendees
- `GET /api/verify/[id]` - Verify pass by ID

## Database Schema

The app uses a single `attendees` table:

```sql
CREATE TABLE attendees (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  hear_about TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  pass_color TEXT DEFAULT 'green',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app is a standard Next.js application and can be deployed to:
- Netlify
- Railway
- DigitalOcean App Platform
- Any Node.js hosting service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Your License Here]

## Support

For support, please contact [your-email] or create an issue in the repository.

---

Built with ❤️ for the Kairos experience by 1NRI
