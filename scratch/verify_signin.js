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

async function verifySignInFlow() {
  console.log('Testing Sign In with existing account...');
  // Use a student email created earlier during initial signup before rate limit
  const email = 'student_v2_1788262375163@college.edu';
  const password = 'Password123!';

  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log('SignIn Error:', signInErr);
  console.log('SignIn User ID:', signInData?.user?.id);
  console.log('SignIn Session Present?:', Boolean(signInData?.session));

  if (signInData?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .single();

    console.log('DB Profile fetched:', profile);
  }
}

verifySignInFlow();
