import { NextRequest, NextResponse } from 'next/server';

const TOKKO_BASE_URL = process.env.TOKKO_BASE_URL || 'https://www.tokkobroker.com/api/v1';

/**
 * POST /api/tokko/validate
 * Validates a Tokko API key by making a lightweight call to the Tokko API.
 * Returns { valid: true } or { valid: false, error: "..." }
 */
export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
      return NextResponse.json(
        { valid: false, error: 'La API key no tiene un formato válido' },
        { status: 400 }
      );
    }

    // Validate by fetching 1 property — the most reliable Tokko endpoint.
    // Invalid keys return 401; /branch/ can return 500 even for valid keys.
    const url = `${TOKKO_BASE_URL}/property/?key=${encodeURIComponent(apiKey.trim())}&lang=es_ar&limit=1&format=json`;

    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (res.status === 401) {
      return NextResponse.json({
        valid: false,
        error: 'La API key de Tokko no es válida. Verificá que esté correcta e intentá de nuevo.',
      });
    }

    if (!res.ok) {
      return NextResponse.json({
        valid: false,
        error: 'No se pudo verificar la API key. El servidor de Tokko no está disponible.',
      });
    }

    // Verify we get a proper Tastypie response with objects array
    const data = await res.json();
    if (!data.objects || !Array.isArray(data.objects)) {
      return NextResponse.json({
        valid: false,
        error: 'La API key de Tokko no devolvió datos válidos.',
      });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('[Tokko Validate] Error:', error);
    return NextResponse.json({
      valid: false,
      error: 'No se pudo conectar con Tokko. Intentá de nuevo en unos minutos.',
    });
  }
}
