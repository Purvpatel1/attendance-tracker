import crypto from 'crypto';

export async function stringToUuid(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function stringToUuidNode(str) {
  const hash = crypto.createHash('sha256').update(str, 'utf8').digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

const test1 = 'Computer Engineering (CE):26AF1245PC501';
const test2 = 'Information Technology (IT):IT1:1:08:00:09:00:26AF1246PC501:0';

async function run() {
  const uuid1Subtle = await stringToUuid(test1);
  const uuid1Node = stringToUuidNode(test1);
  console.log('Test 1 Subtle:', uuid1Subtle);
  console.log('Test 1 Node  :', uuid1Node);
  console.log('Match 1?     :', uuid1Subtle === uuid1Node);

  const uuid2Subtle = await stringToUuid(test2);
  const uuid2Node = stringToUuidNode(test2);
  console.log('Test 2 Subtle:', uuid2Subtle);
  console.log('Test 2 Node  :', uuid2Node);
  console.log('Match 2?     :', uuid2Subtle === uuid2Node);
}

run();
