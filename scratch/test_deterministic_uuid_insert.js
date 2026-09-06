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

function stringToUuid(str) {
  let hash1 = 5381;
  let hash2 = 52711;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 = (hash1 * 33) ^ char;
    hash2 = (hash2 * 33) ^ char;
  }
  const h1 = (hash1 >>> 0).toString(16).padStart(8, '0');
  const h2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  const h3 = ((hash1 ^ hash2) >>> 0).toString(16).padStart(8, '0');
  const h4 = ((hash1 + hash2) >>> 0).toString(16).padStart(8, '0');
  return `${h1.slice(0, 8)}-${h2.slice(0, 4)}-4${h2.slice(4, 7)}-8${h3.slice(0, 3)}-${h3.slice(3, 7)}${h4.slice(0, 8)}`;
}

async function testDeterministicInsert() {
  const email = `det_test_${Date.now()}@example.com`;
  const password = 'Password123!';

  const { data: sData } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Deterministic Test', branch: 'Computer Engineering (CE)', batch: 'CE1' } }
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
    const subjectUuid = stringToUuid('26AF1245PC501');
    const slotUuid = stringToUuid('CE_CE1_d1_08:00_0');
    const today = '2026-09-06';

    console.log('Testing insert with deterministic UUIDs:');
    console.log('Subject UUID:', subjectUuid);
    console.log('Slot UUID:', slotUuid);

    const { data: insData, error: insErr } = await supabase.from('attendance_logs').insert({
      student_id: user.id,
      subject_id: subjectUuid,
      slot_id: slotUuid,
      date: today,
      status: 'PRESENT'
    }).select();

    console.log('Insert Result:', insData);
    console.log('Insert Error:', insErr);
  }
}

testDeterministicInsert();
