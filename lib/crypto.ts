import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit auth tag

/**
 * Derive a 32-byte key from the secret string.
 * SHA-256 ensures we always get exactly 32 bytes regardless of input length.
 */
function getKey(): Buffer {
  const secret = process.env.API_KEY_SECRET;
  if (!secret) throw new Error('API_KEY_SECRET environment variable is not set');
  return createHash('sha256').update(secret).digest();
}

/**
 * AES-256-GCM encrypt a raw API key for secure storage.
 * Returns: base64(iv + authTag + ciphertext)
 *
 * - Random 12-byte IV per encryption (never reused)
 * - 16-byte authentication tag (integrity + tamper protection)
 * - Requires API_KEY_SECRET environment variable.
 */
export function encryptApiKey(rawKey: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const encrypted = Buffer.concat([
    cipher.update(rawKey, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Pack: iv (12) + authTag (16) + ciphertext
  const packed = Buffer.concat([iv, authTag, encrypted]);
  return packed.toString('base64');
}

/**
 * Decrypt an API key. Supports both:
 * - New format: base64(iv + authTag + ciphertext) from native crypto
 * - Legacy format: CryptoJS AES string (starts with "U2FsdGVkX1" in base64)
 *
 * Legacy support allows gradual migration without re-encrypting all keys at once.
 */
export function decryptApiKey(encryptedKey: string): string {
  // Detect legacy CryptoJS format: CryptoJS prepends "Salted__" which base64-encodes to "U2FsdGVkX1"
  if (encryptedKey.startsWith('U2FsdGVkX1')) {
    return decryptLegacy(encryptedKey);
  }

  const packed = Buffer.from(encryptedKey, 'base64');

  if (packed.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    throw new Error('Invalid encrypted data: too short');
  }

  const iv = packed.subarray(0, IV_LENGTH);
  const authTag = packed.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = packed.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const key = getKey();
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Legacy CryptoJS decryption for backwards compatibility.
 * CryptoJS AES with passphrase uses OpenSSL-compatible key derivation (EVP_BytesToKey).
 */
function decryptLegacy(encryptedKey: string): string {
  const data = Buffer.from(encryptedKey, 'base64');

  // CryptoJS format: "Salted__" (8 bytes) + salt (8 bytes) + ciphertext
  const salt = data.subarray(8, 16);
  const ciphertext = data.subarray(16);

  const secret = process.env.API_KEY_SECRET;
  if (!secret) throw new Error('API_KEY_SECRET environment variable is not set');

  // EVP_BytesToKey: derive key + iv from passphrase + salt
  const { key, iv } = evpBytesToKey(Buffer.from(secret, 'utf8'), salt, 32, 16);

  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * OpenSSL EVP_BytesToKey key derivation (MD5-based).
 * Used by CryptoJS when encrypting with a passphrase string.
 */
function evpBytesToKey(
  password: Buffer,
  salt: Buffer,
  keyLen: number,
  ivLen: number
): { key: Buffer; iv: Buffer } {
  const totalLen = keyLen + ivLen;
  const blocks: Buffer[] = [];
  let prev: Buffer = Buffer.alloc(0);

  while (Buffer.concat(blocks).length < totalLen) {
    prev = Buffer.from(
      createHash('md5')
        .update(Buffer.concat([prev, password, salt]))
        .digest()
    );
    blocks.push(prev);
  }

  const derived = Buffer.concat(blocks);
  return {
    key: derived.subarray(0, keyLen),
    iv: derived.subarray(keyLen, keyLen + ivLen),
  };
}
