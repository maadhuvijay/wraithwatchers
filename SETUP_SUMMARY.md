# Supabase CSV Upload Setup - Summary

## ✅ What Was Created

I've set up everything you need to upload your `ghost_sightings_ohio_with_images.csv` file to Supabase. Here's what was added to your project:

### 📁 New Files Created

1. **`supabase/migrations/001_create_ghost_sightings_table.sql`**
   - SQL migration file to create the database table
   - Includes all columns matching your CSV structure
   - Sets up indexes for better performance
   - Configures Row Level Security (RLS) policies

2. **`scripts/upload-csv.ts`**
   - TypeScript script to upload CSV data to Supabase
   - Handles data parsing, validation, and batch uploads
   - Provides progress feedback and error handling

3. **`SUPABASE_SETUP.md`**
   - Comprehensive setup guide with step-by-step instructions
   - Troubleshooting section
   - Database schema documentation

4. **`QUICK_START_SUPABASE.md`**
   - Quick reference guide for fast setup
   - Essential steps only

5. **`env.example`**
   - Template for environment variables
   - Copy this to `.env.local` and fill in your Supabase credentials

### 📦 Updated Files

1. **`package.json`**
   - Added `@supabase/supabase-js` dependency
   - Added `tsx` dev dependency (for running TypeScript scripts)
   - Added `upload-csv` npm script

2. **`README.md`**
   - Updated to mention Supabase integration
   - Added links to setup guides

## 🚀 Next Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase
- Create a Supabase account at [supabase.com](https://supabase.com)
- Create a new project
- Get your credentials from Settings → API

### 3. Configure Environment Variables
Copy `env.example` to `.env.local` and fill in your Supabase credentials:
```bash
cp env.example .env.local
```

Then edit `.env.local` with your values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run Database Migration
- In Supabase dashboard: SQL Editor → New Query
- Copy contents of `supabase/migrations/001_create_ghost_sightings_table.sql`
- Paste and click Run

### 5. Upload Your CSV Data
```bash
npm run upload-csv
```

## 📊 What the Upload Script Does

1. ✅ Reads your CSV file from `app/data/ghost_sightings_ohio_with_images.csv`
2. ✅ Parses and validates all data
3. ✅ Converts date format from MM/DD/YYYY to YYYY-MM-DD
4. ✅ Uploads data in batches of 100 rows
5. ✅ Shows progress and summary statistics
6. ✅ Handles errors gracefully

## 🔍 Database Schema

The `ghost_sightings` table will have these columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Auto-incrementing primary key |
| `date_of_sighting` | DATE | Date of the sighting |
| `latitude` | DOUBLE PRECISION | Latitude coordinate |
| `longitude` | DOUBLE PRECISION | Longitude coordinate |
| `city` | VARCHAR(255) | Nearest city |
| `state` | VARCHAR(100) | US State |
| `notes` | TEXT | Notes about the sighting |
| `time_of_day` | VARCHAR(50) | Time of day |
| `tag_of_apparition` | VARCHAR(100) | Type of apparition |
| `image_link` | TEXT | URL to image |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

## 📚 Documentation

- **Quick Start**: See [QUICK_START_SUPABASE.md](./QUICK_START_SUPABASE.md)
- **Full Guide**: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## ⚠️ Important Notes

- The service role key is sensitive - never commit it to version control
- The `.env.local` file is already in `.gitignore`
- The upload script will add new rows - running it multiple times may create duplicates
- Make sure to run the SQL migration before uploading data

## 🎯 Ready to Go!

Once you complete the steps above, your CSV data will be in Supabase and ready to use in your application!

