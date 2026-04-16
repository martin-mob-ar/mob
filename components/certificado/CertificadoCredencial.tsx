'use client';

import { CertificadoQR } from './CertificadoQR';

interface CertificadoCredencialProps {
  nombreCompleto: string;
  montoAprobado: number;
  fechaEmision: string; // ISO
  fechaVencimiento: string; // ISO
  url: string;
  /** When true, the approved amount is replaced with bullets. */
  hideAmount?: boolean;
  /** Optional callback for the inline eye toggle next to "Monto aprobado". */
  onToggleAmount?: () => void;
}

const DISPLAY_FONT = `'Montserrat', system-ui, -apple-system, sans-serif`;
const BRAND_FONT = `'Ubuntu', 'Montserrat', system-ui, sans-serif`;

// Mob brand colors (inline so html2canvas captures them reliably — CSS variables
// sometimes don't resolve during canvas rendering).
const MOB_BLUE = '#5170FF';
const MOB_BLUE_DARK = '#3B52E5';
const INK = '#0B1220';
const INK_MUTED = '#6B7280';
const HAIRLINE = '#E5E7EB';
const SUCCESS = '#059669';
const SUCCESS_TINT = '#ECFDF5';

function formatMontoAR(n: number): string {
  return `$${n.toLocaleString('es-AR')}`;
}

function formatFechaAR(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Landscape credential, white/blue/black MercadoPago-style — designed to feel
 * like a shareable proof card. Exposes id="certificado-mob" for html2canvas.
 */
export function CertificadoCredencial({
  nombreCompleto,
  montoAprobado,
  fechaEmision,
  fechaVencimiento,
  url,
  hideAmount = false,
  onToggleAmount,
}: CertificadoCredencialProps) {
  return (
    <div
      id="certificado-mob"
      style={{
        width: '100%',
        maxWidth: 560,
        aspectRatio: '1.58 / 1',
        background: '#FFFFFF',
        color: INK,
        borderRadius: 24,
        border: `1px solid ${HAIRLINE}`,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        boxShadow:
          '0 24px 60px -20px rgba(81,112,255,0.18), 0 8px 24px -8px rgba(11,18,32,0.08)',
        fontFamily: DISPLAY_FONT,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top brand strip — MP-style colored accent */}
      <div
        aria-hidden
        style={{
          height: 6,
          background: `linear-gradient(90deg, ${MOB_BLUE_DARK} 0%, ${MOB_BLUE} 50%, #8FA1FF 100%)`,
          flexShrink: 0,
        }}
      />

      {/* Content wrapper */}
      <div
        style={{
          flex: 1,
          padding: '18px 22px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          minHeight: 0,
        }}
      >
        {/* HEADER ROW: mob wordmark + eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: BRAND_FONT,
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: MOB_BLUE,
              lineHeight: 1,
            }}
          >
            mob
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.16em',
              color: MOB_BLUE,
              textTransform: 'uppercase',
            }}
          >
            Certificado de inquilino
          </span>
        </div>

        {/* STATUS PILL (MP-style check) */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            alignSelf: 'flex-start',
            background: SUCCESS_TINT,
            color: SUCCESS,
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            border: `1px solid ${SUCCESS}25`,
          }}
        >
          <CheckIcon />
          Inquilino calificado
        </div>

        {/* BODY: two columns (info | QR) — both vertically centered */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
            minHeight: 0,
          }}
        >
          {/* LEFT: name → amount → badges, top-stacked with consistent gap */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              minWidth: 0,
            }}
          >
            {/* Name block (lead) */}
            <div>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  color: INK_MUTED,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  marginBottom: 2,
                }}
              >
                A nombre de
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: INK,
                  lineHeight: 1.15,
                  wordBreak: 'break-word',
                }}
              >
                {nombreCompleto}
              </div>
            </div>

            {/* Amount block */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    letterSpacing: '0.14em',
                    color: INK_MUTED,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Monto aprobado
                </span>
                {onToggleAmount && (
                  <button
                    type="button"
                    onClick={onToggleAmount}
                    aria-label={hideAmount ? 'Mostrar monto' : 'Ocultar monto'}
                    aria-pressed={hideAmount}
                    data-export-hide
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      border: `1px solid ${HAIRLINE}`,
                      background: '#fff',
                      color: INK_MUTED,
                      cursor: 'pointer',
                      padding: 0,
                      lineHeight: 0,
                    }}
                  >
                    {hideAmount ? <EyeIcon size={12} /> : <EyeOffIcon size={12} />}
                  </button>
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 6,
                  lineHeight: 1,
                }}
              >
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: MOB_BLUE,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {hideAmount ? (
                    <span aria-label="Monto oculto">• • • • • •</span>
                  ) : (
                    formatMontoAR(montoAprobado)
                  )}
                </span>
                <span style={{ fontSize: 12, color: INK_MUTED, fontWeight: 600 }}>
                  / mes
                </span>
              </div>
            </div>

            {/* Inline badges */}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              <Chip label="Identidad" />
              <Chip label="Scoring" />
              <Chip label="Garantía" accent />
            </div>
          </div>

          {/* RIGHT: QR */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                border: `1px solid ${HAIRLINE}`,
                borderRadius: 12,
                padding: 6,
                background: '#fff',
              }}
            >
              <CertificadoQR url={url} size={132} light="#FFFFFF" dark={INK} />
            </div>
            <div
              style={{
                fontSize: 8,
                color: INK_MUTED,
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              Escaneá para validar
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div
          style={{
            borderTop: `1px solid ${HAIRLINE}`,
            paddingTop: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 9,
            color: INK_MUTED,
          }}
        >
          <div style={{ display: 'flex', gap: 10 }}>
            <span>
              <span style={{ color: INK_MUTED }}>Emitido </span>
              <span style={{ color: INK, fontWeight: 700 }}>
                {formatFechaAR(fechaEmision)}
              </span>
            </span>
            <span>
              <span style={{ color: INK_MUTED }}>Vence </span>
              <span style={{ color: INK, fontWeight: 700 }}>
                {formatFechaAR(fechaVencimiento)}
              </span>
            </span>
          </div>
          <div style={{ color: INK_MUTED }}>
            Validación por{' '}
            <span style={{ color: INK, fontWeight: 700 }}>mob</span>
            <span style={{ margin: '0 3px' }}>+</span>
            <span style={{ color: INK, fontWeight: 700 }}>Hoggax</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Small presentational helpers ---

function Chip({ label, accent = false }: { label: string; accent?: boolean }) {
  const color = accent ? MOB_BLUE : SUCCESS;
  const bg = accent ? 'rgba(81,112,255,0.09)' : SUCCESS_TINT;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 10,
        fontWeight: 700,
        color,
        background: bg,
        padding: '3px 8px',
        borderRadius: 999,
        border: `1px solid ${color}20`,
        whiteSpace: 'nowrap',
      }}
    >
      <CheckIcon size={10} color={color} />
      {label}
    </span>
  );
}

function CheckIcon({ size = 12, color }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path
        d="M3 8.5L6.5 12L13 4.5"
        stroke={color || 'currentColor'}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function EyeOffIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path
        d="M9.88 9.88a3 3 0 0 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
