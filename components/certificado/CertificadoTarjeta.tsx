'use client';

import { CertificadoQR } from './CertificadoQR';

interface CertificadoTarjetaProps {
  nombreCompleto: string;
  montoAprobado: number;
  fechaEmision: string;
  fechaVencimiento: string;
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
 * Portrait card — matches the Notion spec literally. Max-width 400px,
 * vertical stacking. id="certificado-mob" for html2canvas capture.
 */
export function CertificadoTarjeta({
  nombreCompleto,
  montoAprobado,
  fechaEmision,
  fechaVencimiento,
  url,
}: CertificadoTarjetaProps) {
  return (
    <div
      id="certificado-mob"
      style={{
        width: '100%',
        maxWidth: 400,
        background:
          'radial-gradient(at 50% 0%, #1a1e3a 0%, #0A0A0A 60%)',
        color: '#fff',
        borderRadius: 20,
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        boxShadow:
          '0 30px 60px -20px rgba(81,112,255,0.25), 0 10px 30px -10px rgba(0,0,0,0.4)',
        fontFamily: MONTSERRAT,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* TOP */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 28,
          position: 'relative',
        }}
      >
        <span
          style={{
            fontSize: 26,
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

      {/* BODY */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: '0.12em',
            color: '#9CA3AF',
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          ESTE CERTIFICADO ACREDITA QUE
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: 14,
            wordBreak: 'break-word',
            maxWidth: '100%',
          }}
        >
          {nombreCompleto}
        </div>
        <div
          style={{
            fontSize: 13,
            color: '#9CA3AF',
            marginBottom: 4,
          }}
        >
          está calificado para alquilar hasta
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: '#8FA1FF',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 4,
          }}
        >
          {formatMontoAR(montoAprobado)}
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#9CA3AF',
            marginBottom: 20,
          }}
        >
          por mes
        </div>
        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <Badge color="#10B981">✓ Identidad verificada</Badge>
          <Badge color="#10B981">✓ Scoring aprobado</Badge>
          <Badge color="#5170FF">✓ Garantía aprobada</Badge>
        </div>
      </div>

      {/* DIVIDER */}
      <div
        style={{
          height: 1,
          background: 'rgba(255,255,255,0.08)',
          margin: '0 -8px 20px',
          position: 'relative',
        }}
      />

      {/* FOOTER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          position: 'relative',
        }}
      >
        {/* Left: dates + issuer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <div
              style={{
                fontSize: 9,
                color: '#6B7280',
                letterSpacing: '0.08em',
              }}
            >
              VÁLIDO HASTA
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
              {formatFechaAR(fechaVencimiento)}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 9,
                color: '#6B7280',
                letterSpacing: '0.08em',
              }}
            >
              EMITIDO POR
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
              mob + Hoggax
            </div>
          </div>
          <div
            style={{
              fontSize: 9,
              color: '#6B7280',
              marginTop: 2,
            }}
          >
            Emitido {formatFechaAR(fechaEmision)}
          </div>
        </div>

        {/* Right: QR */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <CertificadoQR url={url} size={90} />
          <div style={{ fontSize: 9, color: '#9CA3AF' }}>Escaneá para validar</div>
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
        padding: '5px 12px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
