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

async function testSchemaColumns() {
  console.log('Testing schema.sql column names in attendance_logs...');
  const dummyUuid1 = '00000000-0000-0000-0000-000000000001';
  const dummyUuid2 = '00000000-0000-0000-0000-000000000002';
  const dummyUuid3 = '00000000-0000-0000-0000-000000000003';

  const { data, error } = await supabase.from('attendance_logs').insert({
    student_id: dummyUuid1,
    subject_id: dummyUuid2,
    slot_id: dummyUuid3,
    date: '2026-09-06',
    status: 'PRESENT'
  }).select();

  console.log('Insert Result:', data);
  console.log('Insert Error:', error);
}

testSchemaColumns();
