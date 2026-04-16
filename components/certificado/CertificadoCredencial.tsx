'use client';

import { CertificadoQR } from './CertificadoQR';

interface CertificadoCredencialProps {
  nombreCompleto: string;
  montoAprobado: number;
  fechaEmision: string; // ISO
  fechaVencimiento: string; // ISO
  url: string;
}

const MONTSERRAT = `'Montserrat', system-ui, sans-serif`;

function formatMontoAR(n: number): string {
  return `$${n.toLocaleString('es-AR')}`;
}

function formatFechaAR(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Landscape credential (~ driver's license shape). Renders ~ 540x340 on desktop,
 * scales down on mobile. Exposes id="certificado-mob" for html2canvas capture.
 */
export function CertificadoCredencial({
  nombreCompleto,
  montoAprobado,
  fechaEmision,
  fechaVencimiento,
  url,
}: CertificadoCredencialProps) {
  return (
    <div
      id="certificado-mob"
      style={{
        width: '100%',
        maxWidth: 540,
        aspectRatio: '1.6 / 1',
        background:
          'radial-gradient(at 20% 0%, #1a1e3a 0%, #0A0A0A 55%)',
        color: '#fff',
        borderRadius: 20,
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow:
          '0 30px 60px -20px rgba(81,112,255,0.25), 0 10px 30px -10px rgba(0,0,0,0.4)',
        fontFamily: MONTSERRAT,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative blue glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(81,112,255,0.35) 0%, rgba(81,112,255,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* TOP ROW */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#fff',
            fontFamily: `'Ubuntu', ${MONTSERRAT}`,
          }}
        >
          mob
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: '#9CA3AF',
          }}
        >
          CERTIFICADO DE INQUILINO
        </span>
      </div>

      {/* BODY — two columns */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 20,
          position: 'relative',
        }}
      >
        {/* LEFT: name + amount + badges */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 9,
              letterSpacing: '0.12em',
              color: '#9CA3AF',
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            ACREDITA QUE
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: 10,
              wordBreak: 'break-word',
            }}
          >
            {nombreCompleto}
          </div>
          <div
            style={{
              fontSize: 11,
              color: '#9CA3AF',
              marginBottom: 2,
            }}
          >
            está calificado para alquilar hasta
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: '#8FA1FF',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: 10,
            }}
          >
            {formatMontoAR(montoAprobado)}
            <span
              style={{
                fontSize: 13,
                color: '#9CA3AF',
                fontWeight: 500,
                marginLeft: 4,
              }}
            >
              / mes
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Badge color="#10B981">✓ Identidad</Badge>
            <Badge color="#10B981">✓ Scoring</Badge>
            <Badge color="#5170FF">✓ Garantía</Badge>
          </div>
        </div>

        {/* RIGHT: QR + metadata */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
          }}
        >
          <CertificadoQR url={url} size={90} />
          <div style={{ fontSize: 8, color: '#9CA3AF', marginTop: 2 }}>
            Escaneá para validar
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 10,
          fontSize: 9,
          color: '#9CA3AF',
          position: 'relative',
        }}
      >
        <div>
          <span style={{ color: '#6B7280' }}>Emitido</span>{' '}
          <span style={{ color: '#D1D5DB' }}>{formatFechaAR(fechaEmision)}</span>
          <span style={{ color: '#6B7280', marginLeft: 10 }}>Vence</span>{' '}
          <span style={{ color: '#D1D5DB' }}>{formatFechaAR(fechaVencimiento)}</span>
        </div>
        <div style={{ color: '#9CA3AF' }}>
          Validación por <span style={{ color: '#fff', fontWeight: 600 }}>mob</span>
          <span style={{ margin: '0 4px' }}>+</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>Hoggax</span>
        </div>
      </div>
    </div>
  );
}

function Badge({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        color,
        background: `${color}20`,
        padding: '4px 10px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
