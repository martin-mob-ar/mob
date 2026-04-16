import { ImageResponse } from 'next/og';
import { getCertificadoById } from '@/lib/certificados/create';
import { computeCertificadoState } from '@/lib/certificados/types';

export const runtime = 'nodejs';
export const revalidate = 3600;

export const alt = 'Certificado Mob de inquilino calificado';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Image({ params }: Props) {
  const { id } = await params;
  const cert = await getCertificadoById(id);
  const state = computeCertificadoState(cert);

  if (state !== 'valid' || !cert) {
    return defaultImage();
  }

  const monto = `$${cert.monto_aprobado.toLocaleString('es-AR')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0A0A0A',
          color: '#fff',
          fontFamily: 'sans-serif',
          padding: 72,
          position: 'relative',
        }}
      >
        {/* Blue glow */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(81,112,255,0.4) 0%, rgba(81,112,255,0) 70%)',
            display: 'flex',
          }}
        />

        {/* Top row: mob wordmark + tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: 76,
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#fff',
            }}
          >
            mob
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: '0.2em',
              color: '#9CA3AF',
            }}
          >
            CERTIFICADO DE INQUILINO
          </span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, display: 'flex' }} />

        {/* Name + amount */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              letterSpacing: '0.12em',
              color: '#9CA3AF',
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            ESTE CERTIFICADO ACREDITA QUE
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 20,
              color: '#fff',
            }}
          >
            {cert.nombre_completo}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: '#9CA3AF',
              marginBottom: 6,
            }}
          >
            está calificado para alquilar hasta
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              marginBottom: 32,
            }}
          >
            <span
              style={{
                fontSize: 104,
                fontWeight: 900,
                color: '#8FA1FF',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                marginRight: 16,
              }}
            >
              {monto}
            </span>
            <span style={{ fontSize: 28, color: '#9CA3AF', fontWeight: 500 }}>
              / mes
            </span>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex' }}>
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#10B981',
                background: '#10B98122',
                padding: '12px 24px',
                borderRadius: 999,
                marginRight: 12,
                display: 'flex',
              }}
            >
              ✓ Identidad verificada
            </span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#10B981',
                background: '#10B98122',
                padding: '12px 24px',
                borderRadius: 999,
                marginRight: 12,
                display: 'flex',
              }}
            >
              ✓ Scoring aprobado
            </span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#5170FF',
                background: '#5170FF22',
                padding: '12px 24px',
                borderRadius: 999,
                display: 'flex',
              }}
            >
              ✓ Garantía aprobada
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontSize: 20,
            color: '#9CA3AF',
          }}
        >
          <span style={{ display: 'flex' }}>
            Validación por Mob + Hoggax
          </span>
          <span style={{ display: 'flex' }}>mob.ar/certificado/{cert.id}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

function defaultImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #4F5FFF 0%, #6B7AFF 50%, #8B96FF 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <span
          style={{
            display: 'flex',
            fontSize: 140,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.03em',
            marginBottom: 20,
          }}
        >
          mob
        </span>
        <span
          style={{
            display: 'flex',
            fontSize: 36,
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 500,
          }}
        >
          Certificado de inquilino calificado
        </span>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
