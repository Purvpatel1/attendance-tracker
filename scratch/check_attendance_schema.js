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

async function checkAttendanceTable() {
  console.log('Testing query on attendance_logs table...');
  const { data, error } = await supabase.from('attendance_logs').select('*').limit(1);
  console.log('attendance_logs Query Result:', data);
  console.log('attendance_logs Error:', error);
}

checkAttendanceTable();
