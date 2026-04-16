import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createCertificadoInquilino } from '@/lib/certificados/create';

/**
 * Self-serve certificate generation.
 *
 * Called from the `/certificado` landing page when a verified user clicks
 * "Generar mi certificado". The endpoint resolves the caller via the cookie
 * session (no webhook secret — this is for the browser), then delegates to
 * the same idempotent helper used by the Truora document-validation webhook.
 *
 * If the user isn't eligible (not Hoggax-approved / not KYC'd), we return 409
 * so the client can redirect to /verificate?certificado=true instead.
 */
export async function POST() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Look up the public users.id from auth_id
    const { data: publicUser, error: userErr } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .maybeSingle();

    if (userErr || !publicUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const result = await createCertificadoInquilino({ userId: publicUser.id });

    if (!result) {
      return NextResponse.json(
        {
          error: 'NOT_ELIGIBLE',
          message:
            'Todavía no podés generar un certificado. Necesitás completar la verificación de identidad y garantía.',
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      url: result.url,
      reused: result.reused,
    });
  } catch (error) {
    console.error('[certificados.generate-for-me] Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
