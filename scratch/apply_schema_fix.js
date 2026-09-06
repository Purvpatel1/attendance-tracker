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

async function testAttendanceInsertText() {
  // Check if we can sign in a user and insert into attendance_logs with text subject_id and slot_id
  const email = `schema_test_${Date.now()}@example.com`;
  const password = 'Password123!';

  const { data: sData } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Schema Test', branch: 'Computer Engineering (CE)', batch: 'CE1' } }
  });

  let user = sData?.user;
  let session = sData?.session;

  if (!session && user) {
    const { data: loginData } = await supabase.auth.signInWithPassword({ email, password });
    session = loginData?.session;
    user = loginData?.user;
  }

  console.log('Authenticated User ID:', user?.id);

  if (user) {
    // Try inserting with string subject_code and slot_key
    const { data: insData, error: insErr } = await supabase.from('attendance_logs').insert({
      student_id: user.id,
      subject_id: '26AF1245PC501',
      slot_id: 'CE_CE1_d1_08:00_0',
      date: '2026-09-06',
      status: 'PRESENT'
    }).select();

    console.log('Insert Result:', insData);
    console.log('Insert Error:', insErr);
  }
}

testAttendanceInsertText();
