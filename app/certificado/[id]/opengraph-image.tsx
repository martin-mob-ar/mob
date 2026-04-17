import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getCertificadoById } from '@/lib/certificados/create';
import { computeCertificadoState } from '@/lib/certificados/types';

export const runtime = 'nodejs';
export const revalidate = 3600;

export const alt = 'Certificado Mob de inquilino calificado';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const MOB_BLUE = '#5170FF';
const INK = '#0B1220';
const INK_MUTED = '#6B7280';
const SUCCESS = '#059669';

const FONT_DIR = join(process.cwd(), 'assets/fonts');

interface Props {
  params: Promise<{ id: string }>;
}

async function getFonts() {
  const [montBold, montExtraBold, ubuntuBold] = await Promise.all([
    readFile(join(FONT_DIR, 'montserrat-latin-700-normal.woff')),
    readFile(join(FONT_DIR, 'montserrat-latin-800-normal.woff')),
    readFile(join(FONT_DIR, 'ubuntu-latin-700-normal.woff')),
  ]);
  return [
    { name: 'Montserrat', data: montBold, weight: 700 as const, style: 'normal' as const },
    { name: 'Montserrat', data: montExtraBold, weight: 800 as const, style: 'normal' as const },
    { name: 'Ubuntu', data: ubuntuBold, weight: 700 as const, style: 'normal' as const },
  ];
}

function CertificadoCard({
  nombre,
  monto,
  footer,
}: {
  nombre: string;
  monto: string;
  footer: string;
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF',
        color: INK,
        fontFamily: 'Montserrat',
        padding: '56px 72px',
        position: 'relative',
      }}
    >
      {/* Top blue strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          background: `linear-gradient(90deg, #3B52E5 0%, ${MOB_BLUE} 50%, #8FA1FF 100%)`,
          display: 'flex',
        }}
      />

      {/* Header: mob wordmark + eyebrow */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 40,
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontFamily: 'Ubuntu',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: MOB_BLUE,
            display: 'flex',
          }}
        >
          mob
        </span>
        <span
          style={{
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: '0.1em',
            color: MOB_BLUE,
            textAlign: 'right',
            lineHeight: 1.35,
            display: 'flex',
          }}
        >
          CERTIFICADO DE INQUILINO APTO
        </span>
      </div>

      {/* Name */}
      {nombre && (
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 24 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              letterSpacing: '0.12em',
              color: INK_MUTED,
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            A NOMBRE DE
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.15,
              color: INK,
            }}
          >
            {nombre}
          </div>
        </div>
      )}

      {/* Amount */}
      <div
        style={{
          display: 'flex',
          fontSize: 18,
          letterSpacing: '0.12em',
          color: INK_MUTED,
          fontWeight: 700,
          marginBottom: 4,
        }}
      >
        MONTO APROBADO
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          marginBottom: 28,
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: MOB_BLUE,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            marginRight: 12,
            display: 'flex',
          }}
        >
          {monto}
        </span>
        <span
          style={{
            fontSize: 24,
            color: INK_MUTED,
            fontWeight: 700,
            display: 'flex',
          }}
        >
          / mes
        </span>
      </div>

      {/* Badges — text only, no icons */}
      <div style={{ display: 'flex', gap: 12 }}>
        {[
          { label: 'Identidad', color: SUCCESS },
          { label: 'Perfil Financiero', color: SUCCESS },
          { label: 'Inquilino Calificado', color: SUCCESS },
          { label: 'Garantía Aprobada', color: MOB_BLUE },
        ].map((badge) => (
          <span
            key={badge.label}
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: badge.color,
              background:
                badge.color === MOB_BLUE
                  ? 'rgba(81,112,255,0.09)'
                  : '#ECFDF5',
              padding: '8px 18px',
              borderRadius: 999,
              display: 'flex',
            }}
          >
            {badge.label}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: 20,
          borderTop: '1px solid #E5E7EB',
          fontSize: 18,
          color: INK_MUTED,
        }}
      >
        <span style={{ display: 'flex' }}>Aprobado por Mob + Hoggax</span>
        <span style={{ display: 'flex' }}>{footer}</span>
      </div>
    </div>
  );
}

export default async function Image({ params }: Props) {
  const { id } = await params;
  const cert = await getCertificadoById(id);
  const state = computeCertificadoState(cert);

  if (state !== 'valid' || !cert) {
    return defaultImage();
  }

  const monto = `$${cert.monto_aprobado.toLocaleString('es-AR')}`;
  const fonts = await getFonts();

  return new ImageResponse(
    <CertificadoCard
      nombre={cert.nombre_completo}
      monto={monto}
      footer={`mob.ar/certificado/${cert.id}`}
    />,
    { ...size, fonts }
  );
}

async function defaultImage() {
  const fonts = await getFonts();

  return new ImageResponse(
    <CertificadoCard nombre="" monto="$2.000.000" footer="mob.ar/certificado" />,
    { width: 1200, height: 630, fonts }
  );
}
