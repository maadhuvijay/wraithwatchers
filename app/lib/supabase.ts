import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client (uses anon key)
export function createClientSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Server-side Supabase client (uses service role key - bypasses RLS)
export function createServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  // Check if variables are missing or empty
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseServiceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    throw new Error(`Missing Supabase environment variables: ${missing.join(', ')}. Please configure these in your .env.local file and restart your development server.`);
  }

  // Check for placeholder values
  const isPlaceholderUrl = supabaseUrl.includes('your-project-id') || supabaseUrl.includes('xxxxx');
  const isPlaceholderKey = supabaseServiceRoleKey.includes('your_service_role_key') || supabaseServiceRoleKey.includes('example');
  
  if (isPlaceholderUrl || isPlaceholderKey) {
    const placeholders = [];
    if (isPlaceholderUrl) placeholders.push('NEXT_PUBLIC_SUPABASE_URL');
    if (isPlaceholderKey) placeholders.push('SUPABASE_SERVICE_ROLE_KEY');
    throw new Error(`Supabase environment variables contain placeholder values: ${placeholders.join(', ')}. Please replace them with your actual Supabase credentials from your Supabase dashboard (Settings > API). After updating, restart your development server.`);
  }

  // Validate URL format
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL format. It should start with 'https://' and end with '.supabase.co'. Current value: ${supabaseUrl.substring(0, 50)}...`);
  }

  // Validate key format (JWT tokens start with 'eyJ')
  if (!supabaseServiceRoleKey.startsWith('eyJ')) {
    throw new Error(`Invalid SUPABASE_SERVICE_ROLE_KEY format. It should be a JWT token starting with 'eyJ'. Please check your Supabase dashboard (Settings > API > service_role key).`);
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

