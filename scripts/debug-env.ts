import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from multiple locations
const rootEnvPath = path.join(process.cwd(), '.env.local');
const publicEnvPath = path.join(process.cwd(), 'public', '.env.local');

let envLoaded = dotenv.config({ path: rootEnvPath });
if (envLoaded.error) {
  envLoaded = dotenv.config({ path: publicEnvPath });
}

console.log('=== Environment Variables Debug ===\n');

// Show all environment variables that contain SUPABASE, SERVICE, or ROLE
const relevantVars = Object.keys(process.env)
  .filter(k => 
    k.toUpperCase().includes('SUPABASE') || 
    k.toUpperCase().includes('SERVICE') || 
    k.toUpperCase().includes('ROLE')
  )
  .sort();

console.log('Relevant environment variables found:');
relevantVars.forEach(key => {
  const value = process.env[key];
  if (value) {
    // Show first 50 chars and last 10 chars for keys, full for short values
    const displayValue = value.length > 60 
      ? `${value.substring(0, 50)}...${value.substring(value.length - 10)}`
      : value;
    console.log(`  ${key} = ${displayValue}`);
  } else {
    console.log(`  ${key} = (undefined)`);
  }
});

console.log('\n=== Checking for Service Role Key ===');
const possibleKeys = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SERVICE_KEY',
  'SUPABASE_KEY',
  'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SERVICE_ROLE',
  'SERVICE_ROLE_KEY',
  'SERVICE_ROLE',
];

possibleKeys.forEach(key => {
  const value = process.env[key];
  console.log(`  ${key}: ${value ? '✓ FOUND' : '✗ NOT FOUND'}`);
});

console.log('\n=== URL Check ===');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (url) {
  console.log('  NEXT_PUBLIC_SUPABASE_URL found');
  console.log('  Length:', url.length);
  console.log('  Starts with http://:', url.startsWith('http://'));
  console.log('  Starts with https://:', url.startsWith('https://'));
  console.log('  First 30 chars:', url.substring(0, 30));
  console.log('  Last 20 chars:', url.substring(Math.max(0, url.length - 20)));
} else {
  console.log('  NEXT_PUBLIC_SUPABASE_URL: NOT FOUND');
}




