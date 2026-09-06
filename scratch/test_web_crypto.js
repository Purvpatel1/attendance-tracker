import crypto from 'crypto';

// Standard Web Crypto API stringToUuid function (works identically in Browser and Node)
async function stringToUuidWebCrypto(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  // SubtleCrypto is built-in in modern browsers & Node 15+
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

const testStr = 'Computer Engineering (CE):26AF1245PC501';
stringToUuidWebCrypto(testStr).then(uuid => {
  console.log('WebCrypto SHA-256 UUID:', uuid);
});
