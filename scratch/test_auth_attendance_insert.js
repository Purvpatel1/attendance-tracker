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

async function testAuthInsert() {
  const email = `auth_test_${Date.now()}@example.com`;
  const password = 'Password123!';

  console.log('1. Signing up user:', email);
  const { data: signUpData, error: sErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Auth Test Student',
        roll_number: '21IT001',
        branch: 'Information Technology (IT)',
        batch: 'IT1'
      }
    }
  });

  if (sErr) {
    console.error('SignUp Error:', sErr);
    return;
  }

  let session = signUpData.session;
  let user = signUpData.user;

  if (!session && user) {
    const { data: signInData, error: loginErr } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (!loginErr && signInData.session) {
      session = signInData.session;
      user = signInData.user;
    }
  }

  console.log('Authenticated User ID:', user?.id);

  if (user && session) {
    // 2. Try inserting attendance log
    const dummySubjectUuid = '11111111-1111-1111-1111-111111111111';
    const dummySlotUuid = '22222222-2222-2222-2222-222222222222';
    const today = new Date().toISOString().split('T')[0];

    console.log('2. Inserting attendance log for date:', today);
    const { data: logData, error: logErr } = await supabase
      .from('attendance_logs')
      .insert({
        student_id: user.id,
        subject_id: dummySubjectUuid,
        slot_id: dummySlotUuid,
        date: today,
        status: 'PRESENT'
      })
      .select();

    console.log('Attendance Log Insert Result:', logData);
    console.log('Attendance Log Insert Error:', logErr);
  }
}

testAuthInsert();
