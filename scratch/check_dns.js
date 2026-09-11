import dns from 'dns';

dns.lookup('db.dbljekkyenasgffgyedp.supabase.co', (err, address) => {
  console.log('DNS db.dbljekkyenasgffgyedp.supabase.co:', { err, address });
});

dns.lookup('aws-0-ap-south-1.pooler.supabase.com', (err, address) => {
  console.log('DNS pooler:', { err, address });
});
