import CryptoJS from 'crypto-js';

const SECRET = process.env.API_KEY_SECRET;

/**
 * AES-encrypt a raw API key for secure storage.
 * Requires API_KEY_SECRET environment variable.
 */
export function encryptApiKey(rawKey: string): string {
  if (!SECRET) throw new Error('API_KEY_SECRET environment variable is not set');
  return CryptoJS.AES.encrypt(rawKey, SECRET).toString();
}

/**
 * Decrypt an AES-encrypted API key back to the raw value.
 * Requires API_KEY_SECRET environment variable.
 */
export function decryptApiKey(encryptedKey: string): string {
  if (!SECRET) throw new Error('API_KEY_SECRET environment variable is not set');
  const bytes = CryptoJS.AES.decrypt(encryptedKey, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}
