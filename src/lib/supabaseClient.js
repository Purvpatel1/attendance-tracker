import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'placeholder-key';

export const isSupabaseConfigured = Boolean(
  getEnvVar('VITE_SUPABASE_URL') &&
  getEnvVar('VITE_SUPABASE_ANON_KEY') &&
  getEnvVar('VITE_SUPABASE_URL') !== 'https://placeholder.supabase.co'
);

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase is not yet configured. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
