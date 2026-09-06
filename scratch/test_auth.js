import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env file directly
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach((line) => {
  const [key, val] = line.split('=');
  if (key && val) env[key.trim()] = val.trim();
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Supabase URL:', url);
console.log('Testing Supabase Key Present:', Boolean(key));

const supabase = createClient(url, key);

async function testSignUp() {
  const testEmail = `test_student_${Date.now()}@college.edu`;
  const testPassword = 'Password123!';

  console.log('\n--- Attempting supabase.auth.signUp ---');
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: 'Diagnostic Test Student',
        roll_number: '26DIAG001',
        branch: 'Computer Engineering (CE)',
        batch: 'CE1',
      },
    },
  });

  console.log('signUp Error:', error);
  console.log('signUp User ID:', data?.user?.id);
  console.log('signUp User Email:', data?.user?.email);
  console.log('signUp User Confirmed At:', data?.user?.confirmed_at);
  console.log('signUp User Identities:', data?.user?.identities);
  console.log('signUp Session Present?:', Boolean(data?.session));

  if (data?.user) {
    console.log('\n--- Attempting Profile Query ---');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id);
    
    console.log('Profile Query Data:', profileData);
    console.log('Profile Query Error:', profileError);
  }
}

testSignUp();
