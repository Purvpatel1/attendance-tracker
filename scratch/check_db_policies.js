import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach((line) => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const { supabase } = await import('../src/lib/supabaseClient.js');

async function checkPolicies() {
  console.log('--- Testing query on pg_policies or schema ---');
  const { data: res1, error: err1 } = await supabase.from('pg_policies').select('*');
  console.log('pg_policies query:', { res1, err1 });
}

checkPolicies().catch(console.error);
