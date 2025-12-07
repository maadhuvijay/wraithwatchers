# Upload Data to Supabase

This script uploads the ghost sightings CSV data to your Supabase database.

## Prerequisites

1. Make sure you have a `.env.local` file in the project root with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Ensure your Supabase database has the `ghost_sightings` table created with the schema provided.

## Running the Script

Run the following command from the project root:

```bash
npm run upload-data
```

Or directly with tsx:

```bash
tsx scripts/upload-to-supabase.ts
```

## What the Script Does

1. Reads the CSV file from `public/data/ghost_sightings_ohio_with_images.csv`
2. Parses the CSV data and converts dates from MM/DD/YYYY to YYYY-MM-DD format
3. Uploads the data to Supabase in batches of 1000 rows
4. Provides a summary of uploaded rows and any errors

## Notes

- The script uses the service role key to bypass Row Level Security (RLS)
- Data is uploaded in batches to handle large datasets efficiently
- The script will skip rows with invalid dates or coordinates
- If you run the script multiple times, it will create duplicate entries (consider clearing the table first if needed)

