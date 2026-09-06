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

async function testSignIn() {
  console.log('\n--- Attempting supabase.auth.signInWithPassword ---');
  // Try signing in with the user email created earlier if any
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'alex.aiml@college.edu',
    password: 'password123',
  });

  console.log('signIn Error:', error?.message, 'Code:', error?.code);
  console.log('signIn User ID:', data?.user?.id);
  console.log('signIn Session Present?:', Boolean(data?.session));

  if (data?.user) {
    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    console.log('Fetched Profile from DB:', profile);
    console.log('Profile Error:', pErr?.message);
  }
}

testSignIn();
