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

async function checkTriggerAndAuth() {
  console.log('Testing auth signup and checking if profile is created by trigger or RLS...');

  // Try signing up a student
  const email = `trigger_test_${Date.now()}@example.com`;
  const password = 'Password123!';
  const fullName = 'Trigger Test Student';
  const rollNumber = '21IT077';
  const branch = 'Information Technology (IT)';
  const batch = 'IT2';

  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        roll_number: rollNumber,
        branch,
        batch,
      },
    },
  });

  console.log('SignUp error:', signUpErr);
  console.log('SignUp User ID:', signUpData?.user?.id);
  console.log('SignUp Session:', signUpData?.session ? 'YES' : 'NO');

  if (signUpData?.user) {
    console.log('User created! User Metadata:', signUpData.user.user_metadata);
  }
}

checkTriggerAndAuth();
