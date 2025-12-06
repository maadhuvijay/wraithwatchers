# Form Submission Fix - Summary

## ✅ Problem Fixed

Sightings submitted through the "Post a Sighting" page were not appearing in the sightings list because:
- The form was not saving data anywhere (just navigating to confirmation)
- The main page only loaded data from the static CSV file

## 🔧 Changes Made

### 1. Created API Route (`app/api/sightings/route.ts`)
- **POST endpoint**: Handles form submissions and saves to Supabase
- **GET endpoint**: Fetches all sightings from Supabase
- Includes error handling and validation
- Converts time input to time-of-day category (Morning, Afternoon, Evening, Night)

### 2. Updated Post Sighting Page (`app/post/page.tsx`)
- Now actually submits form data to the API
- Added reverse geocoding to get city/state from coordinates
- Added loading state and error handling
- Shows error messages if submission fails
- Validates that a location is selected on the map

### 3. Updated Main Page (`app/page.tsx`)
- Now fetches sightings from Supabase API first
- Falls back to CSV if API is unavailable
- Automatically includes newly submitted sightings

### 4. Created Supabase Client Helper (`app/lib/supabase.ts`)
- Client-side Supabase client (uses anon key)
- Server-side Supabase client (uses service role key for API routes)

### 5. Updated Utils (`app/lib/utils.ts`)
- Added `dbRowToSighting()` helper function to convert database format

### 6. Updated Database Migration
- Added policy to allow anonymous inserts (for flexibility)

## 🚀 How It Works Now

1. **User fills out form** on "Post a Sighting" page
2. **Selects location** on the map (required)
3. **Submits form** → Data is sent to `/api/sightings` endpoint
4. **API route**:
   - Reverse geocodes coordinates to get city/state
   - Converts time to time-of-day category
   - Saves to Supabase database
5. **Main page** fetches from Supabase and displays all sightings (including new ones)

## 📋 Requirements

To use this feature, you need:

1. **Supabase configured** (see `SUPABASE_SETUP.md`)
   - Database table created (run migration)
   - Environment variables set in `.env.local`

2. **Required environment variables**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## 🧪 Testing

1. Make sure Supabase is set up and migrations are run
2. Fill out the "Post a Sighting" form
3. Select a location on the map
4. Submit the form
5. Check the main page - your new sighting should appear!

## 🔍 Reverse Geocoding

The form uses OpenStreetMap's Nominatim API to automatically determine city and state from the selected coordinates. If this fails, it defaults to:
- City: "Unknown"
- State: "Ohio"

## ⚠️ Notes

- The service role key is used in API routes (server-side only) and bypasses RLS
- Client-side operations use the anon key and respect RLS policies
- The API gracefully handles errors and provides helpful error messages
- If Supabase is unavailable, the main page falls back to CSV data

## 🐛 Troubleshooting

**Form submission fails:**
- Check that Supabase environment variables are set
- Verify the database table exists (run migration)
- Check browser console for error messages

**Sighting doesn't appear:**
- Refresh the main page
- Check that Supabase has the new record (Table Editor)
- Verify API is working (check Network tab in browser dev tools)

**Reverse geocoding not working:**
- This is a free service and may have rate limits
- The form will still work with "Unknown" city
- Check browser console for warnings

