/**
 * Script helper pentru a genera hash-uri SHA-256 pentru parole
 * Rulare: node -e "const { createHash } = require('crypto'); console.log(createHash('sha256').update('PAROLA_AICI').digest('hex'));"
 * 
 * Sau pentru browser, folosește acest cod în consolă:
 */

export async function generatePasswordHash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Pentru a genera hash pentru o parolă, rulează în consola browserului:
// generatePasswordHash('123').then(hash => console.log(hash));