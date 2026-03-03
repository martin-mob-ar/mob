/**
 * One-time script to configure CORS on the GCS bucket.
 * Run: node scripts/setup-gcs-cors.mjs
 *
 * Requires GCS env vars to be set in .env.local
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let value = trimmed.slice(eqIdx + 1).trim();
  // Strip surrounding quotes
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  process.env[key] = value;
}

const { Storage } = await import('@google-cloud/storage');

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

const corsConfig = [
  {
    origin: [
      'http://localhost:3000',
      'https://mob.ar',
      'https://www.mob.ar',
    ],
    method: ['PUT', 'GET', 'HEAD', 'OPTIONS'],
    responseHeader: [
      'Content-Type',
      'x-goog-content-length-range',
    ],
    maxAgeSeconds: 3600,
  },
];

await bucket.setCorsConfiguration(corsConfig);
console.log(`✓ CORS configured on bucket: ${process.env.GCS_BUCKET_NAME}`);
console.log('Allowed origins:', corsConfig[0].origin);
