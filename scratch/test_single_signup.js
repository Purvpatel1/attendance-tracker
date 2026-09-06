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

async function testSingleSignup() {
  const email = `student_single_${Date.now()}@gmail.com`;
  const password = 'Password123!';
  const fullName = 'Single Test Student';
  const rollNumber = '21CE088';
  const branch = 'Computer Engineering (CE)';
  const batch = 'CE2';

  console.log('Attempting signup for:', email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        roll_number: rollNumber,
        branch,
        batch
      }
    }
  });

  console.log('SignUp error:', error);
  console.log('SignUp data user:', data?.user?.id);
  console.log('SignUp data session:', data?.session ? 'YES' : 'NO');

  if (data?.session) {
    console.log('Session present! Upserting profile...');
    const { data: pData, error: pErr } = await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
      roll_number: rollNumber,
      branch,
      batch
    }).select();
    console.log('Profile upsert result:', pData, 'Error:', pErr);
  } else if (data?.user) {
    console.log('User present but session is NULL! Attempting signInWithPassword...');
    const { data: sData, error: sErr } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    console.log('signInWithPassword error:', sErr);
    console.log('signInWithPassword session:', sData?.session ? 'YES' : 'NO');
  }
}

testSingleSignup();
