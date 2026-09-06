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

async function testInsert() {
  console.log('Testing insert into attendance_logs table...');
  const { data, error } = await supabase.from('attendance_logs').insert({
    subject_code: '26AF1245PC501',
    slot_key: 'test_slot_1',
    date: '2026-09-06',
    status: 'PRESENT'
  }).select();

  console.log('Insert Result:', data);
  console.log('Insert Error:', error);
}

testInsert();
