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

async function testDomains() {
  const testEmail = `student_${Date.now()}@example.com`;
  console.log('Testing signUp with:', testEmail);
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'Password123!',
    options: {
      data: {
        full_name: 'Test Student',
        roll_number: '21IT100',
        branch: 'Information Technology (IT)',
        batch: 'IT1',
      }
    }
  });

  console.log('Error:', error);
  console.log('Data User ID:', data?.user?.id);
  console.log('Data Session:', data?.session ? 'YES' : 'NO');
  console.log('Data User Metadata:', data?.user?.user_metadata);
}

testDomains();
