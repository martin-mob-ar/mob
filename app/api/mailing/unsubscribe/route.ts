import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyUnsubscribeToken } from '@/lib/mailing/novedades-email';

function htmlPage(title: string, message: string, status: number = 200): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} | mob.ar</title>
</head>
<body style="font-family:Arial,Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb;">
  <div style="text-align:center;max-width:400px;padding:32px;">
    <h1 style="font-size:24px;color:#111;margin-bottom:12px;">${title}</h1>
    <p style="font-size:16px;color:#555;line-height:1.5;">${message}</p>
    <a href="https://mob.ar" style="display:inline-block;margin-top:24px;color:#4D7CFF;font-size:14px;text-decoration:none;">Volver a mob.ar</a>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get('uid');
  const token = searchParams.get('token');

  if (!userId || !token) {
    return htmlPage('Enlace inv\u00E1lido', 'El enlace de desuscripci\u00F3n no es v\u00E1lido.', 400);
  }

  if (!verifyUnsubscribeToken(userId, token)) {
    return htmlPage('Enlace inv\u00E1lido', 'El enlace de desuscripci\u00F3n no es v\u00E1lido o ya expir\u00F3.', 403);
  }

  await supabaseAdmin
    .from('user_mailing_preferences')
    .update({ unsubscribed: true })
    .eq('user_id', userId);

  return htmlPage('Te desuscribiste', 'No vas a recibir m\u00E1s emails de novedades de propiedades.');
}
