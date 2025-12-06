import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import Papa from 'papaparse';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease create a .env.local file with these variables.');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

interface SightingData {
  date_of_sighting: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  notes: string | null;
  time_of_day: string | null;
  tag_of_apparition: string | null;
  image_link: string | null;
}

// Helper function to parse date (MM/DD/YYYY format)
function parseDate(dateStr: string): string | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return null;
  
  const month = parts[0].padStart(2, '0');
  const day = parts[1].padStart(2, '0');
  const year = parts[2];
  
  // Return in YYYY-MM-DD format
  return `${year}-${month}-${day}`;
}

// Helper function to parse coordinate
function parseCoordinate(coordStr: string): number | null {
  if (!coordStr || coordStr.trim() === '') return null;
  const parsed = parseFloat(coordStr.trim());
  return isNaN(parsed) ? null : parsed;
}

// Convert CSV row to database format
function convertToSighting(row: CSVRow): SightingData | null {
  const date = parseDate(row['Date of Sighting']);
  const latitude = parseCoordinate(row['Latitude of Sighting']);
  const longitude = parseCoordinate(row['Longitude of Sighting']);
  
  if (!date || latitude === null || longitude === null) {
    console.warn(`⚠️  Skipping invalid row: Date=${row['Date of Sighting']}, Lat=${row['Latitude of Sighting']}, Lng=${row['Longitude of Sighting']}`);
    return null;
  }
  
  return {
    date_of_sighting: date,
    latitude,
    longitude,
    city: row['Nearest Approximate City']?.trim() || '',
    state: row['US State']?.trim() || '',
    notes: row['Notes about the sighting']?.trim() || null,
    time_of_day: row['Time of Day']?.trim() || null,
    tag_of_apparition: row['Tag of Apparition']?.trim() || null,
    image_link: row['Image Link']?.trim() || null,
  };
}

async function uploadCSVToSupabase() {
  console.log('🚀 Starting CSV upload to Supabase...\n');
  
  // Read CSV file
  const csvPath = join(process.cwd(), 'app/data/ghost_sightings_ohio_with_images.csv');
  console.log(`📂 Reading CSV file: ${csvPath}`);
  
  let csvContent: string;
  try {
    csvContent = readFileSync(csvPath, 'utf-8');
  } catch (error) {
    console.error(`❌ Error reading CSV file: ${error}`);
    process.exit(1);
  }
  
  // Parse CSV
  console.log('📊 Parsing CSV data...');
  const parsed = Papa.parse<CSVRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });
  
  if (parsed.errors.length > 0) {
    console.warn(`⚠️  CSV parsing warnings:`, parsed.errors);
  }
  
  console.log(`✅ Parsed ${parsed.data.length} rows\n`);
  
  // Convert and validate data
  console.log('🔄 Converting data format...');
  const sightings: SightingData[] = [];
  let skippedCount = 0;
  
  for (const row of parsed.data) {
    const sighting = convertToSighting(row);
    if (sighting) {
      sightings.push(sighting);
    } else {
      skippedCount++;
    }
  }
  
  console.log(`✅ Converted ${sightings.length} valid sightings`);
  if (skippedCount > 0) {
    console.log(`⚠️  Skipped ${skippedCount} invalid rows\n`);
  } else {
    console.log();
  }
  
  // Check if table exists and has data
  console.log('🔍 Checking existing data...');
  const { count: existingCount } = await supabase
    .from('ghost_sightings')
    .select('*', { count: 'exact', head: true });
  
  if (existingCount !== null && existingCount > 0) {
    console.log(`⚠️  Table already contains ${existingCount} rows.`);
    console.log('   This script will add new rows. Duplicates may be created if run multiple times.\n');
  } else {
    console.log('✅ Table is empty, ready for upload\n');
  }
  
  // Upload in batches
  const batchSize = 100;
  let uploadedCount = 0;
  let errorCount = 0;
  
  console.log(`📤 Uploading data in batches of ${batchSize}...\n`);
  
  for (let i = 0; i < sightings.length; i += batchSize) {
    const batch = sightings.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(sightings.length / batchSize);
    
    console.log(`   Uploading batch ${batchNumber}/${totalBatches} (${batch.length} rows)...`);
    
    const { data, error } = await supabase
      .from('ghost_sightings')
      .insert(batch)
      .select();
    
    if (error) {
      console.error(`   ❌ Error uploading batch ${batchNumber}:`, error.message);
      errorCount += batch.length;
    } else {
      uploadedCount += data?.length || 0;
      console.log(`   ✅ Successfully uploaded ${data?.length || 0} rows`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Upload Summary:');
  console.log('='.repeat(50));
  console.log(`✅ Successfully uploaded: ${uploadedCount} rows`);
  if (errorCount > 0) {
    console.log(`❌ Failed to upload: ${errorCount} rows`);
  }
  if (skippedCount > 0) {
    console.log(`⚠️  Skipped (invalid data): ${skippedCount} rows`);
  }
  console.log('='.repeat(50) + '\n');
  
  // Verify upload
  console.log('🔍 Verifying upload...');
  const { count: finalCount } = await supabase
    .from('ghost_sightings')
    .select('*', { count: 'exact', head: true });
  
  console.log(`✅ Total rows in database: ${finalCount}\n`);
  
  console.log('🎉 Upload complete!');
}

// Run the upload
uploadCSVToSupabase().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

