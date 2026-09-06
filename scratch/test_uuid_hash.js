function stringToUuid(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const hex2 = Math.abs(hash * 31).toString(16).padStart(8, '0');
  return `00000000-0000-4${hex.slice(0, 3)}-8${hex.slice(3, 6)}-${hex.slice(6)}${hex2.slice(0, 4)}`;
}

console.log('UUID for 26AF1245PC501:', stringToUuid('26AF1245PC501'));
console.log('UUID for slot_1:', stringToUuid('CE_CE1_d1_08:00_0'));
