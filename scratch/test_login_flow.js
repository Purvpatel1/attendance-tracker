import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach((line) => {
  const [key, val] = line.split('=');
  if (key && val) env[key.trim()] = val.trim();
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function testExistingLogin() {
  console.log('Testing sign in with existing user or inspecting schema/auth state...');
  
  // Let's check if we can query profiles or if RLS blocks reading profiles when unauthenticated vs authenticated
  const { data: publicProfiles, error: publicErr } = await supabase.from('profiles').select('*');
  console.log('Unauthenticated profiles query:', publicProfiles, 'Error:', publicErr);
}

testExistingLogin();
