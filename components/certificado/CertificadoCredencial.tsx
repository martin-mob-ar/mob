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
const QR_BG = '#F3F4F6';

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
 * Landscape credential card — designed to match the "Certificado de Inquilino
 * Apto" reference design. Exposes id="certificado-mob" for html2canvas.
 *
 * All logos are inline SVG/text so html2canvas can capture them reliably
 * (external <img> tags are unreliable in canvas rendering).
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
        maxWidth: 600,
        background: '#FFFFFF',
        color: INK,
        borderRadius: 20,
        border: `1px solid ${HAIRLINE}`,
        padding: '22px 26px 18px',
        fontFamily: DISPLAY_FONT,
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top brand strip */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          background: `linear-gradient(90deg, ${MOB_BLUE_DARK} 0%, ${MOB_BLUE} 50%, #8FA1FF 100%)`,
        }}
      />

      {/* HEADER ROW: mob wordmark + eyebrow */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 14,
          marginTop: 2,
        }}
      >
        <span
          style={{
            fontFamily: BRAND_FONT,
            fontSize: 42,
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
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.1em',
            color: MOB_BLUE,
            textTransform: 'uppercase' as const,
            textAlign: 'right' as const,
            lineHeight: 1.35,
          }}
        >
          Certificado de
          <br />
          Inquilino Apto
        </span>
      </div>

      {/* BODY: two columns (info | QR) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        {/* LEFT: name → amount → badges */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minWidth: 0,
          }}
        >
          {/* Name block */}
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: '0.12em',
                color: INK_MUTED,
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                marginBottom: 2,
              }}
            >
              A nombre de
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: INK,
                lineHeight: 1.15,
                wordBreak: 'break-word' as const,
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
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  color: INK_MUTED,
                  fontWeight: 700,
                  textTransform: 'uppercase' as const,
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
                  {hideAmount ? (
                    <EyeIcon size={12} />
                  ) : (
                    <EyeOffIcon size={12} />
                  )}
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
                  fontSize: 34,
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
              <span
                style={{
                  fontSize: 14,
                  color: INK_MUTED,
                  fontWeight: 600,
                }}
              >
                / mes
              </span>
            </div>
          </div>

          {/* Inline badges — two rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              <Chip label="Identidad" />
              <Chip label="Perfil Financiero" />
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              <Chip label="Inquilino Calificado" />
              <Chip label="Garantía Aprobada" accent />
            </div>
          </div>
        </div>

        {/* RIGHT: QR */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              borderRadius: 16,
              padding: 10,
              background: QR_BG,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CertificadoQR url={url} size={140} light="#FFFFFF" dark={INK} />
          </div>
          <div
            style={{
              fontSize: 10,
              color: INK_MUTED,
              fontWeight: 600,
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
          paddingTop: 10,
          marginTop: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 10,
          color: INK_MUTED,
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <span>
            Emitido{' '}
            <span style={{ color: INK, fontWeight: 700 }}>
              {formatFechaAR(fechaEmision)}
            </span>
          </span>
          <span>
            Vence{' '}
            <span style={{ color: INK, fontWeight: 700 }}>
              {formatFechaAR(fechaVencimiento)}
            </span>
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>Aprobado por</span>
          <HoggaxLogo height={18} />
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
        fontSize: 11,
        fontWeight: 700,
        color,
        background: bg,
        padding: '4px 10px',
        borderRadius: 999,
        border: `1px solid ${color}20`,
        whiteSpace: 'nowrap' as const,
      }}
    >
      <CheckIcon size={11} color={color} />
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

/** Inline hoggax wordmark SVG — avoids <img> which html2canvas can't reliably render. */
function HoggaxLogo({ height = 18 }: { height?: number }) {
  const aspect = 773 / 194;
  const w = height * aspect;
  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 773 194"
      fill="none"
      aria-label="Hoggax"
      style={{ flexShrink: 0 }}
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M312.934 193.579C288.655 193.579 276.226 181.951 270.076 172.196C269.434 171.193 268.997 170.073 268.79 168.9C268.583 167.728 268.61 166.526 268.869 165.364C269.129 164.202 269.615 163.103 270.301 162.13C270.987 161.157 271.859 160.329 272.866 159.694C273.874 159.059 274.997 158.63 276.17 158.431C277.344 158.232 278.546 158.267 279.706 158.535C280.866 158.802 281.962 159.296 282.93 159.989C283.899 160.682 284.721 161.559 285.348 162.571C290.769 171.163 300.051 175.526 312.934 175.526C315.328 175.526 317.624 176.477 319.317 178.17C321.01 179.863 321.961 182.159 321.961 184.553C321.961 186.947 321.01 189.242 319.317 190.935C317.624 192.628 315.328 193.579 312.934 193.579ZM47.6417 44.1326C35.3138 44.1326 24.0719 50.1517 18.0527 57.8024V9.02635C18.0527 7.84099 17.8192 6.66724 17.3656 5.57211C16.912 4.47699 16.2471 3.48193 15.4089 2.64376C14.5708 1.80558 13.5757 1.14071 12.4806 0.68709C11.3855 0.233473 10.2117 0 9.02635 0C7.84099 0 6.66724 0.233473 5.57211 0.68709C4.47699 1.14071 3.48193 1.80558 2.64376 2.64376C1.80558 3.48193 1.14071 4.47699 0.68709 5.57211C0.233473 6.66724 -1.76632e-08 7.84099 0 9.02635L0 138.412C-1.76632e-08 139.597 0.233473 140.771 0.68709 141.866C1.14071 142.961 1.80558 143.956 2.64376 144.795C3.48193 145.633 4.47699 146.298 5.57211 146.751C6.66724 147.205 7.84099 147.438 9.02635 147.438C10.2117 147.438 11.3855 147.205 12.4806 146.751C13.5757 146.298 14.5708 145.633 15.4089 144.795C16.2471 143.956 16.912 142.961 17.3656 141.866C17.8192 140.771 18.0527 139.597 18.0527 138.412V100.303C18.0527 75.2276 29.116 62.1901 47.6417 62.1901C66.1675 62.1901 77.2308 76.4343 77.2308 100.303V138.417C77.2308 140.811 78.1818 143.107 79.8745 144.799C81.5673 146.492 83.8632 147.443 86.2571 147.443C88.6511 147.443 90.9469 146.492 92.6397 144.799C94.3325 143.107 95.2835 140.811 95.2835 138.417V99.2995C95.2835 67.2052 79.2388 44.1374 47.6417 44.1374M179.537 62.1852C170.496 62.1955 161.828 65.7917 155.435 72.1848C149.042 78.578 145.445 87.2461 145.435 96.2875C145.445 105.329 149.042 113.997 155.435 120.39C161.828 126.783 170.496 130.379 179.537 130.39C188.579 130.379 197.247 126.783 203.64 120.39C210.033 113.997 213.629 105.329 213.64 96.2875C213.629 87.2461 210.033 78.578 203.64 72.1848C197.247 65.7917 188.579 62.1955 179.537 62.1852ZM179.537 148.442C150.779 148.442 127.383 125.046 127.383 96.2875C127.383 67.5287 150.779 44.1326 179.537 44.1326C208.296 44.1326 231.692 67.5287 231.692 96.2875C231.692 125.046 208.296 148.442 179.537 148.442ZM312.934 62.1852C303.893 62.1955 295.225 65.7917 288.832 72.1848C282.438 78.578 278.842 87.2461 278.832 96.2875C278.842 105.329 282.438 113.997 288.832 120.39C295.225 126.783 303.893 130.379 312.934 130.39C321.976 130.379 330.644 126.783 337.037 120.39C343.43 113.997 347.026 105.329 347.037 96.2875C347.026 87.2461 343.43 78.578 337.037 72.1848C330.644 65.7917 321.976 62.1955 312.934 62.1852ZM312.934 148.442C284.175 148.442 260.779 125.046 260.779 96.2875C260.779 67.5287 284.175 44.1326 312.934 44.1326C341.693 44.1326 365.089 67.5287 365.089 96.2875C365.089 125.046 341.693 148.442 312.934 148.442Z" fill="#0B003B"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M312.934 193.579C310.54 193.579 308.244 192.628 306.551 190.935C304.858 189.243 303.907 186.947 303.907 184.553C303.907 182.159 304.858 179.863 306.551 178.17C308.244 176.477 310.54 175.526 312.934 175.526C347.036 175.526 348.04 143.427 348.04 133.397L347.036 96.2876C347.036 93.8936 347.987 91.5978 349.68 89.905C351.372 88.2122 353.668 87.2612 356.062 87.2612C358.456 87.2612 360.752 88.2122 362.445 89.905C364.137 91.5978 365.088 93.8936 365.088 96.2876V137.413C365.088 145.305 363.795 160.457 355.126 173.205C348.807 182.496 336.359 193.574 312.938 193.574" fill="#0B003B"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M586.751 62.185C577.71 62.1965 569.043 65.7933 562.651 72.1863C556.259 78.5794 552.663 87.2467 552.653 96.2872C552.663 105.328 556.259 113.995 562.651 120.388C569.043 126.781 577.71 130.378 586.751 130.389C595.792 130.379 604.46 126.783 610.853 120.39C617.246 113.997 620.843 105.329 620.853 96.2872C620.843 87.2459 617.246 78.5778 610.853 72.1846C604.46 65.7914 595.792 62.1952 586.751 62.185ZM586.751 148.442C557.992 148.442 534.596 125.046 534.596 96.2872C534.596 67.5284 557.992 44.1323 586.751 44.1323C615.509 44.1323 638.91 67.5284 638.91 96.2872C638.91 125.046 615.509 148.442 586.751 148.442Z" fill="#FF366C"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M629.886 148.442H586.753C585.568 148.442 584.394 148.209 583.299 147.755C582.204 147.302 581.208 146.637 580.37 145.799C579.532 144.961 578.867 143.965 578.414 142.87C577.96 141.775 577.727 140.601 577.727 139.416C577.727 138.231 577.96 137.057 578.414 135.962C578.867 134.867 579.532 133.872 580.37 133.034C581.208 132.195 582.204 131.53 583.299 131.077C584.394 130.623 585.568 130.39 586.753 130.39H620.855V96.2876C620.855 93.8936 621.806 91.5978 623.499 89.905C625.192 88.2122 627.487 87.2612 629.881 87.2612C632.275 87.2612 634.571 88.2122 636.264 89.905C637.957 91.5978 638.908 93.8936 638.908 96.2876V139.416C638.908 140.601 638.674 141.775 638.221 142.87C637.767 143.965 637.102 144.961 636.264 145.799C635.426 146.637 634.431 147.302 633.336 147.755C632.241 148.209 631.067 148.442 629.881 148.442" fill="#FF366C"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M680.029 148.443C678.258 148.442 676.525 147.921 675.048 146.943C673.57 145.965 672.414 144.574 671.721 142.943C671.029 141.312 670.832 139.513 671.155 137.771C671.478 136.029 672.306 134.421 673.537 133.146L756.782 46.8889C758.445 45.1658 760.725 44.1739 763.119 44.1313C764.304 44.1102 765.483 44.3229 766.586 44.7571C767.689 45.1913 768.696 45.8386 769.55 46.6621C770.403 47.4855 771.085 48.4689 771.559 49.5561C772.032 50.6433 772.286 51.8131 772.307 52.9987C772.328 54.1842 772.116 55.3623 771.681 56.4657C771.247 57.569 770.6 58.5761 769.776 59.4293L686.526 145.686C684.755 147.521 682.39 148.443 680.029 148.443Z" fill="#0B003B"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M763.282 148.443C760.916 148.443 758.556 147.525 756.784 145.686L673.535 59.4293C671.872 57.7061 670.961 55.393 671.004 52.9987C671.046 50.6044 672.038 48.325 673.761 46.6621C675.485 44.9991 677.798 44.0888 680.192 44.1313C682.586 44.1739 684.866 45.1658 686.529 46.8889L769.779 133.146C771.011 134.421 771.841 136.03 772.165 137.773C772.489 139.517 772.292 141.317 771.599 142.949C770.906 144.581 769.747 145.973 768.268 146.951C766.789 147.929 765.055 148.444 763.282 148.443ZM450.347 62.1854C441.306 62.1957 432.638 65.7918 426.245 72.185C419.851 78.5782 416.255 87.2463 416.245 96.2876C416.255 105.329 419.851 113.997 426.245 120.39C432.638 126.783 441.306 130.38 450.347 130.39C459.389 130.38 468.057 126.783 474.45 120.39C480.843 113.997 484.439 105.329 484.449 96.2876C484.439 87.2463 480.843 78.5782 474.45 72.185C468.057 65.7918 459.389 62.1957 450.347 62.1854ZM450.347 148.443C421.588 148.443 398.192 125.046 398.192 96.2876C398.192 67.5288 421.588 44.1327 450.347 44.1327C479.106 44.1327 502.502 67.5288 502.502 96.2876C502.502 125.046 479.106 148.443 450.347 148.443Z" fill="#0B003B"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M450.346 193.579C447.952 193.579 445.656 192.628 443.963 190.935C442.27 189.243 441.319 186.947 441.319 184.553C441.319 182.159 442.27 179.863 443.963 178.17C445.656 176.477 447.952 175.526 450.346 175.526C484.448 175.526 485.447 143.427 485.447 133.397L484.448 96.2876C484.448 93.8936 485.399 91.5978 487.092 89.905C488.784 88.2122 491.08 87.2612 493.474 87.2612C495.868 87.2612 498.164 88.2122 499.857 89.905C501.55 91.5978 502.501 93.8936 502.501 96.2876V137.413C502.501 145.305 501.207 160.457 492.538 173.205C486.215 182.496 473.766 193.579 450.346 193.579Z" fill="#0B003B"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M450.345 193.579C426.066 193.579 413.637 181.951 407.482 172.196C406.85 171.193 406.422 170.075 406.222 168.906C406.022 167.738 406.054 166.541 406.317 165.385C406.579 164.229 407.067 163.136 407.752 162.168C408.437 161.2 409.305 160.377 410.308 159.745C411.312 159.113 412.429 158.685 413.598 158.485C414.767 158.285 415.963 158.317 417.119 158.579C418.276 158.842 419.369 159.329 420.336 160.014C421.304 160.699 422.128 161.568 422.76 162.571C428.175 171.163 437.458 175.526 450.345 175.526C452.739 175.526 455.035 176.477 456.728 178.17C458.421 179.863 459.372 182.159 459.372 184.553C459.372 186.947 458.421 189.243 456.728 190.935C455.035 192.628 452.739 193.579 450.345 193.579Z" fill="#0B003B"/>
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
