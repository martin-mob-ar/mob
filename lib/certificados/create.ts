import { supabaseAdmin } from '@/lib/supabase/server';
import { generateCertificadoId } from './id';
import type { CertificadoInquilino } from './types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.mob.ar';
const VIGENCIA_DIAS = 90;
const MAX_ID_RETRIES = 5;

export interface CreateCertificadoResult {
  id: string;
  url: string;
  reused: boolean; // true if we returned an existing active certificate
}

export interface CreateCertificadoError {
  code:
    | 'USER_NOT_FOUND'
    | 'NOT_VERIFIED'
    | 'NOT_APPROVED'
    | 'MISSING_AMOUNT'
    | 'MISSING_NAME'
    | 'DB_ERROR';
  message: string;
}

/**
 * Issue (or reuse) a tenant certificate for a verified, Hoggax-approved user.
 *
 * Idempotent: if the user already has an ACTIVO certificate that hasn't
 * expired yet, returns that one instead of creating a new row. This keeps
 * any already-shared links stable.
 *
 * Returns null if the user is not eligible — the caller decides whether that
 * is an error or a soft no-op (the truora document-validation hook treats it
 * as soft).
 */
export async function createCertificadoInquilino({
  userId,
}: {
  userId: string;
}): Promise<CreateCertificadoResult | null> {
  // 1. Load user + check eligibility
  const { data: user, error: userErr } = await supabaseAdmin
    .from('users')
    .select(
      'id, name, hoggax_approved, hoggax_max_rent_plus_expenses, truora_document_verified'
    )
    .eq('id', userId)
    .maybeSingle();

  if (userErr || !user) return null;
  if (!user.truora_document_verified) return null;
  if (!user.hoggax_approved) return null;
  if (!user.hoggax_max_rent_plus_expenses || user.hoggax_max_rent_plus_expenses <= 0) return null;

  // 2. Idempotency: reuse active non-expired certificate if present
  const nowIso = new Date().toISOString();
  const { data: existing } = await supabaseAdmin
    .from('certificados_inquilino')
    .select('id, fecha_vencimiento, estado')
    .eq('user_id', userId)
    .eq('estado', 'ACTIVO')
    .gt('fecha_vencimiento', nowIso)
    .order('fecha_emision', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return {
      id: existing.id,
      url: `${APP_URL}/certificado/${existing.id}`,
      reused: true,
    };
  }

  // 3. Resolve full name from Truora KYC (authoritative), fall back to users.name
  const { data: truoraRow } = await supabaseAdmin
    .from('verificaciones_truora')
    .select('id, name, last_name')
    .eq('user_id', userId)
    .eq('truora_document_verified', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nombreCompleto = [truoraRow?.name, truoraRow?.last_name]
    .filter(Boolean)
    .join(' ')
    .trim() || user.name;

  if (!nombreCompleto) return null;

  // 4. Latest Hoggax approval row (for traceability)
  const { data: hoggaxRow } = await supabaseAdmin
    .from('verificaciones_hoggax')
    .select('id')
    .eq('user_id', userId)
    .eq('hoggax_approved', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // 5. Insert with collision retry
  const fechaVencimiento = new Date(Date.now() + VIGENCIA_DIAS * 24 * 60 * 60 * 1000).toISOString();

  for (let attempt = 0; attempt < MAX_ID_RETRIES; attempt++) {
    const id = generateCertificadoId(8);
    const { data, error } = await supabaseAdmin
      .from('certificados_inquilino')
      .insert({
        id,
        user_id: userId,
        nombre_completo: nombreCompleto,
        monto_aprobado: user.hoggax_max_rent_plus_expenses,
        fecha_vencimiento: fechaVencimiento,
        estado: 'ACTIVO',
        verificacion_hoggax_id: hoggaxRow?.id ?? null,
        verificacion_truora_id: truoraRow?.id ?? null,
      })
      .select('id')
      .single();

    if (!error && data) {
      return {
        id: data.id,
        url: `${APP_URL}/certificado/${data.id}`,
        reused: false,
      };
    }

    // 23505 = unique_violation (PK collision) — retry with a new id
    if (error && (error as { code?: string }).code !== '23505') {
      console.error('[certificados.create] insert error:', error);
      return null;
    }
  }

  console.error('[certificados.create] ID collision after', MAX_ID_RETRIES, 'retries');
  return null;
}

export async function getCertificadoById(
  id: string
): Promise<CertificadoInquilino | null> {
  const { data, error } = await supabaseAdmin
    .from('certificados_inquilino')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[certificados.get] error:', error);
    return null;
  }
  return data as CertificadoInquilino | null;
}
