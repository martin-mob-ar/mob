import { randomBytes } from 'crypto';

// URL-safe alphabet without visually confusing chars (no 0/O, 1/l/I).
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
const ALPHABET_LEN = ALPHABET.length;

/**
 * Generate a short, non-sequential, URL-safe alphanumeric id.
 * Default 8 chars → ~1.1 trillion possibilities with the 32-char alphabet.
 */
export function generateCertificadoId(length = 8): string {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET_LEN];
  }
  return out;
}
