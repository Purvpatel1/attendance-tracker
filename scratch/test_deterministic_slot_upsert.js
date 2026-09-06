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
  if (!str) return '00000000-0000-4000-8000-000000000000';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;

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

async function testSlotUpsert() {
  const email = `slot_uuid_test_${Date.now()}@example.com`;
  const password = 'Password123!';

  const { data: sData } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Slot Test', branch: 'Computer Engineering (CE)', batch: 'CE1' } }
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
    const rawSubjectCode = '26AF1245PC501';
    const rawSlotId = 'Computer Engineering (CE)_CE1_d1_08:00_0';
    const today = '2026-09-06';

    const slotUuid = stringToUuid(rawSlotId);
    console.log('Original Raw Slot ID:', rawSlotId);
    console.log('Converted Slot UUID:', slotUuid);

    // Let's test inserting into attendance_logs using slotUuid
    // If subject_id constraint is dropped or relaxed, or if we pass subject_id / slot_id
    const payload = {
      student_id: user.id,
      slot_id: slotUuid,
      date: today,
      status: 'PRESENT'
    };

    console.log('Upserting payload:', payload);
    const { data: insData, error: insErr } = await supabase.from('attendance_logs').upsert(payload, {
      onConflict: 'student_id,date,slot_id'
    }).select();

    console.log('Upsert Result:', insData);
    console.log('Upsert Error:', insErr);
  }
}

testSlotUpsert();
