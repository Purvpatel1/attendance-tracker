console.log('IGCCSVC_DB defined:', Boolean(process.env.IGCCSVC_DB));
if (process.env.IGCCSVC_DB) {
  console.log('IGCCSVC_DB length:', process.env.IGCCSVC_DB.length);
  console.log('IGCCSVC_DB prefix:', process.env.IGCCSVC_DB.substring(0, 15));
}
