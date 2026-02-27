import CryptoJS from 'crypto-js';

function getSecret(): string {
  const secret = process.env.API_KEY_SECRET;
  if (!secret) throw new Error('API_KEY_SECRET environment variable is not set');
  return secret;
}

/**
 * AES-encrypt a raw API key for secure storage.
 * Requires API_KEY_SECRET environment variable.
 */
export function encryptApiKey(rawKey: string): string {
  return CryptoJS.AES.encrypt(rawKey, getSecret()).toString();
}

/**
 * Decrypt an AES-encrypted API key back to the raw value.
 * Requires API_KEY_SECRET environment variable.
 */
export function decryptApiKey(encryptedKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedKey, getSecret());
  return bytes.toString(CryptoJS.enc.Utf8);
}
