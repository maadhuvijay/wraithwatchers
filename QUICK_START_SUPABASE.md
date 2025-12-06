# Quick Start: Upload CSV to Supabase

This is a quick reference guide to upload your ghost sightings CSV to Supabase.

## Prerequisites

- Supabase account ([sign up here](https://supabase.com))
- Node.js installed
- Dependencies installed (`npm install`)

## Quick Setup (5 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Supabase Project
- Go to [app.supabase.com](https://app.supabase.com)
- Create a new project
- Wait for it to finish setting up

### 3. Get Your Credentials
- In Supabase dashboard: **Settings** → **API**
- Copy these values:
  - Project URL
  - `service_role` key (keep this secret!)
  - `anon` key

### 4. Set Environment Variables
Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 5. Run Database Migration
- In Supabase dashboard: **SQL Editor** → **New Query**
- Copy contents of `supabase/migrations/001_create_ghost_sightings_table.sql`
- Paste and click **Run**

### 6. Upload CSV Data
```bash
npm run upload-csv
```

That's it! Your data should now be in Supabase.

## Verify Upload

In Supabase dashboard:
- Go to **Table Editor**
- Select `ghost_sightings` table
- You should see all your data

Or run this SQL query:
```sql
SELECT COUNT(*) FROM ghost_sightings;
```

## Troubleshooting

**Missing environment variables?**
- Make sure `.env.local` exists and has all three variables

**Table doesn't exist?**
- Run the SQL migration file first (step 5)

**Upload fails?**
- Check that CSV file exists at `app/data/ghost_sightings_ohio_with_images.csv`
- Verify your credentials are correct
- Check the error message for details

## Full Documentation

For detailed instructions, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

