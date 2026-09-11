import fs from 'fs';
import path from 'path';

// Load .env variables
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

import { supabase } from '../src/lib/supabaseClient.js';

async function reloadSchema() {
  console.log('Using Supabase URL:', process.env.VITE_SUPABASE_URL);
  console.log('Testing attendance_logs select for hour_index column...');

  const { data: testSelect, error: selectErr } = await supabase
    .from('attendance_logs')
    .select('id, student_id, hour_index, status')
    .limit(1);

  if (selectErr) {
    console.error('Select Error:', selectErr.message);
  } else {
    console.log('Select Succeeded! Rows returned:', testSelect);
  }

  // Try upserting a test log with hour_index
  const testLog = {
    student_id: 'd3b07384-d113-4610-a292-628b030b65f7',
    subject_id: 'ec5eac3b-a1c0-416c-81e7-3c34fe7d6b34',
    slot_id: '97ddd8e7-9fac-48fd-86b5-c14c875f487d',
    date: '2026-09-07',
    hour_index: 1,
    status: 'PRESENT',
  };

  console.log('\nTesting upsert with hour_index...');
  const { data: upsertData, error: upsertErr } = await supabase
    .from('attendance_logs')
    .upsert(testLog, { onConflict: 'student_id,date,slot_id,subject_id,hour_index' })
    .select();

  if (upsertErr) {
    console.error('Upsert Error:', upsertErr.message);
  } else {
    console.log('Upsert Succeeded! Data:', upsertErr ? null : upsertData);
  }
}

reloadSchema().catch(console.error);
