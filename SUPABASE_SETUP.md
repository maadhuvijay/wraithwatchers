# Supabase Setup Guide

This guide will help you set up Supabase and upload the ghost sightings CSV data to your database.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed
3. Your project dependencies installed (`npm install`)

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - **Name**: WraithWatchers (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose the closest region to your users
4. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll find:
   - **Project URL**: Copy this value
   - **anon/public key**: Copy this value
   - **service_role key**: Copy this value (⚠️ Keep this secret!)

## Step 3: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. Save the file (it's already in `.gitignore`, so it won't be committed)

## Step 4: Create the Database Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase/migrations/001_create_ghost_sightings_table.sql`
4. Click "Run" to execute the migration
5. You should see "Success. No rows returned"

The migration will:
- Create the `ghost_sightings` table with all required columns
- Add indexes for better query performance
- Set up Row Level Security (RLS) policies
- Create a trigger to automatically update timestamps

## Step 5: Upload CSV Data

1. Make sure you've installed all dependencies:
   ```bash
   npm install
   ```

2. Run the upload script:
   ```bash
   npm run upload-csv
   ```

The script will:
- Read the CSV file from `app/data/ghost_sightings_ohio_with_images.csv`
- Parse and validate all data
- Upload the data in batches of 100 rows
- Show progress and summary statistics

## Step 6: Verify the Upload

1. In your Supabase dashboard, go to **Table Editor**
2. Select the `ghost_sightings` table
3. You should see all your ghost sightings data

You can also run queries in the SQL Editor:
```sql
SELECT COUNT(*) FROM ghost_sightings;
SELECT * FROM ghost_sightings LIMIT 10;
```

## Troubleshooting

### Error: "Missing required environment variables"
- Make sure your `.env.local` file exists and contains all required variables
- Check that the variable names are exactly as shown (case-sensitive)

### Error: "relation 'ghost_sightings' does not exist"
- You need to run the SQL migration first (Step 4)
- Go to SQL Editor in Supabase and run the migration file

### Error: "new row violates row-level security policy"
- The migration sets up RLS policies
- Make sure you ran the complete migration file
- Check that the service role key is being used (for admin operations)

### Upload script fails
- Check that the CSV file exists at `app/data/ghost_sightings_ohio_with_images.csv`
- Verify your Supabase credentials are correct
- Check the error message for specific details

## Database Schema

The `ghost_sightings` table has the following structure:

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Primary key (auto-increment) |
| `date_of_sighting` | DATE | Date of the sighting |
| `latitude` | DOUBLE PRECISION | Latitude coordinate |
| `longitude` | DOUBLE PRECISION | Longitude coordinate |
| `city` | VARCHAR(255) | Nearest city |
| `state` | VARCHAR(100) | US State |
| `notes` | TEXT | Notes about the sighting |
| `time_of_day` | VARCHAR(50) | Time of day (e.g., "Evening", "Night") |
| `tag_of_apparition` | VARCHAR(100) | Type of apparition (e.g., "White Lady", "Orbs") |
| `image_link` | TEXT | URL to the sighting image |
| `created_at` | TIMESTAMP | When the record was created |
| `updated_at` | TIMESTAMP | When the record was last updated |

## Next Steps

After uploading your data, you can:

1. Update your application to read from Supabase instead of CSV
2. Add authentication for user-submitted sightings
3. Implement real-time updates for new sightings
4. Add advanced filtering and search capabilities

For more information, see the [Supabase Documentation](https://supabase.com/docs).

