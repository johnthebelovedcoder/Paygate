// src/utils/supabase.utils.ts - Frontend Supabase client
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ftmpmceqmdfzygozmbtx.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

// Validate configuration
if (!supabaseUrl) {
  console.warn('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseKey) {
  console.warn('Missing VITE_SUPABASE_KEY environment variable');
}

// Create Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseKey, {
  // Optional: Configure additional options
  auth: {
    // Automatically refreshes the session if expired
    autoRefreshToken: true,
    // Persist session to storage
    persistSession: true,
    // Detect session from URL
    detectSessionInUrl: true,
  },
  // Global fetch options
  global: {
    // Headers to be sent with every request
    headers: {
      'X-Client-Info': 'paygate-frontend/1.0',
    },
  },
});

// Export configuration for reuse
export const SUPABASE_CONFIG = {
  url: supabaseUrl,
  key: supabaseKey,
};

export default supabase;
