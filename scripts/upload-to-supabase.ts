import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

// Load environment variables from .env.local
import * as dotenv from 'dotenv';

// Try to load .env.local from multiple possible locations
const rootEnvPath = path.join(process.cwd(), '.env.local');
const publicEnvPath = path.join(process.cwd(), 'public', '.env.local');

let envLoaded = dotenv.config({ path: rootEnvPath });
if (envLoaded.error) {
  // Try public folder as fallback
  envLoaded = dotenv.config({ path: publicEnvPath });
}

if (envLoaded.error && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn(`Warning: Could not load .env.local from ${rootEnvPath} or ${publicEnvPath}`);
  console.warn('Make sure .env.local exists in the project root with:');
  console.warn('  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.warn('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key\n');
}

interface CSVRow {
  'Date of Sighting': string;
  'Latitude of Sighting': string;
  'Longitude of Sighting': string;
  'Nearest Approximate City': string;
  'US State': string;
  'Notes about the sighting': string;
  'Time of Day': string;
  'Tag of Apparition': string;
  'Image Link': string;
}

interface DatabaseRow {
  sighting_date: string; // ISO date string
  latitude: number;
  longitude: number;
  nearest_city: string | null;
  us_state: string | null;
  notes: string | null;
  time_of_day: string | null;
  tag_of_apparition: string | null;
  image_link: string | null;
}

// Convert MM/DD/YYYY to YYYY-MM-DD
function convertDate(dateStr: string): string | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  const month = parts[0].padStart(2, '0');
  const day = parts[1].padStart(2, '0');
  const year = parts[2];
  
  return `${year}-${month}-${day}`;
}

// Parse CSV and convert to database format
function parseCSVData(csvPath: string): DatabaseRow[] {
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  const parsed = Papa.parse<CSVRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  const rows: DatabaseRow[] = [];

  for (const row of parsed.data) {
    const date = convertDate(row['Date of Sighting']);
    if (!date) {
      console.warn(`Skipping row with invalid date: ${row['Date of Sighting']}`);
      continue;
    }

    const latitude = parseFloat(row['Latitude of Sighting']);
    const longitude = parseFloat(row['Longitude of Sighting']);

    if (isNaN(latitude) || isNaN(longitude)) {
      console.warn(`Skipping row with invalid coordinates: ${row['Latitude of Sighting']}, ${row['Longitude of Sighting']}`);
      continue;
    }

    rows.push({
      sighting_date: date,
      latitude,
      longitude,
      nearest_city: row['Nearest Approximate City']?.trim() || null,
      us_state: row['US State']?.trim() || null,
      notes: row['Notes about the sighting']?.trim() || null,
      time_of_day: row['Time of Day']?.trim() || null,
      tag_of_apparition: row['Tag of Apparition']?.trim() || null,
      image_link: row['Image Link']?.trim() || null,
    });
  }

  return rows;
}

// Helper to clean env var values (remove quotes and trim)
function cleanEnvVar(value: string | undefined): string | undefined {
  if (!value) return undefined;
  // Remove surrounding quotes (single or double) and trim whitespace
  let cleaned = value.trim();
  // Remove quotes from start and end only
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
}

async function uploadToSupabase() {
  // Get Supabase credentials from environment and clean them
  const supabaseUrlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseUrl = cleanEnvVar(supabaseUrlRaw);
  
  // Check for service role key with multiple possible variable names
  const supabaseServiceRoleKeyToUse = cleanEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY) || 
                                      cleanEnvVar(process.env.SUPABASE_SERVICE_KEY) ||
                                      cleanEnvVar(process.env.SUPABASE_KEY) ||
                                      cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) ||
                                      cleanEnvVar(process.env.SUPABASE_SERVICE_ROLE) ||
                                      cleanEnvVar(process.env.SERVICE_ROLE_KEY);
  
  // Fallback to anon key if service role key not available (may not work with RLS)
  const anonKey = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
                  cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
                  cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);
  
  const keyToUse = supabaseServiceRoleKeyToUse || anonKey;
  const usingServiceRole = !!supabaseServiceRoleKeyToUse;

  // Debug: Show what environment variables are available
  console.log('Environment variables found:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Found' : '✗ Missing');
  console.log('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKeyToUse ? '✓ Found' : '✗ Missing');
  if (!supabaseServiceRoleKeyToUse && anonKey) {
    console.log('  Using anon key as fallback (may fail if RLS is enabled)');
  }
  
  // Show all Supabase-related env vars for debugging
  const allSupabaseVars = Object.keys(process.env)
    .filter(k => k.includes('SUPABASE') || k.includes('SERVICE'))
    .reduce((acc, key) => {
      const value = process.env[key];
      acc[key] = value ? (value.length > 30 ? `${value.substring(0, 30)}...` : value) : 'undefined';
      return acc;
    }, {} as Record<string, string>);
  console.log('\nAll Supabase-related environment variables found:');
  Object.keys(allSupabaseVars).forEach(key => {
    console.log(`  ${key}: ${allSupabaseVars[key]}`);
  });
  console.log('');

  // Validate and fix URL format
  let finalSupabaseUrl = supabaseUrl;
  if (supabaseUrl) {
    // Remove any trailing slashes
    finalSupabaseUrl = supabaseUrl.replace(/\/+$/, '');
    
    // Debug: Show URL info (first 60 chars for debugging)
    console.log('URL Debug Info:');
    console.log('  Raw URL (first 60 chars):', supabaseUrlRaw?.substring(0, 60) || 'undefined');
    console.log('  Cleaned URL (first 60 chars):', finalSupabaseUrl?.substring(0, 60) || 'undefined');
    
    // If URL doesn't start with http:// or https://, try to add https://
    if (!finalSupabaseUrl.startsWith('http://') && !finalSupabaseUrl.startsWith('https://')) {
      console.warn('  URL does not start with http:// or https://, attempting to add https://...');
      finalSupabaseUrl = `https://${finalSupabaseUrl}`;
      console.log('  Fixed URL (first 60 chars):', finalSupabaseUrl?.substring(0, 60));
    }
    
    // Final validation
    if (!finalSupabaseUrl.startsWith('http://') && !finalSupabaseUrl.startsWith('https://')) {
      console.error('Invalid Supabase URL format. URL must start with http:// or https://');
      throw new Error('Invalid Supabase URL format');
    }
    console.log('');
  }

  if (!finalSupabaseUrl || !keyToUse) {
    const supabaseVars = Object.keys(process.env).filter(k => k.includes('SUPABASE'));
    console.error('Available Supabase env vars:', supabaseVars);
    console.error('');
    console.error('To get your Service Role Key:');
    console.error('  1. Go to your Supabase project dashboard');
    console.error('  2. Navigate to Settings > API');
    console.error('  3. Copy the "service_role" key (NOT the anon key)');
    console.error('  4. Add it to your .env.local file as:');
    console.error('     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
    console.error('');
    console.error('Note: Make sure there are NO quotes around the values in .env.local');
    throw new Error(
      'Missing Supabase credentials. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.'
    );
  }
  
  if (!usingServiceRole) {
    console.warn('⚠ WARNING: Using anon key instead of service role key.');
    console.warn('  This may fail if Row Level Security (RLS) is enabled on your table.');
    console.warn('  For bulk uploads, the service role key is recommended.\n');
  }

  // Create Supabase client (service role key bypasses RLS, anon key respects RLS)
  const supabase = createClient(finalSupabaseUrl, keyToUse, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Read and parse CSV
  const csvPath = path.join(process.cwd(), 'public', 'data', 'ghost_sightings_ohio_with_images.csv');
  console.log(`Reading CSV from: ${csvPath}`);
  
  const rows = parseCSVData(csvPath);
  console.log(`Parsed ${rows.length} rows from CSV`);

  // Upload in batches of 1000 (Supabase has limits)
  const batchSize = 1000;
  let uploaded = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(rows.length / batchSize);

    console.log(`Uploading batch ${batchNum}/${totalBatches} (${batch.length} rows)...`);

    const { data, error } = await supabase
      .from('ghost_sightings')
      .insert(batch)
      .select();

    if (error) {
      console.error(`Error uploading batch ${batchNum}:`, error);
      errors += batch.length;
    } else {
      uploaded += batch.length;
      console.log(`✓ Successfully uploaded batch ${batchNum} (${batch.length} rows)`);
    }
  }

  console.log('\n=== Upload Summary ===');
  console.log(`Total rows parsed: ${rows.length}`);
  console.log(`Successfully uploaded: ${uploaded}`);
  console.log(`Errors: ${errors}`);

  if (errors === 0) {
    console.log('\n✓ All data uploaded successfully!');
  } else {
    console.log(`\n⚠ Some rows failed to upload. Please check the errors above.`);
  }
}

// Run the upload
uploadToSupabase()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nFatal error:', error);
    process.exit(1);
  });

