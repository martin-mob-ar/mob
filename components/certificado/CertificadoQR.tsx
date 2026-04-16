'use client';

import { QRCodeSVG } from 'qrcode.react';

export function CertificadoQR({
  url,
  size = 80,
  light = '#ffffff',
  dark = '#0A0A0A',
}: {
  url: string;
  size?: number;
  light?: string;
  dark?: string;
}) {
  return (
    <div
      style={{ backgroundColor: light, padding: 6, borderRadius: 4 }}
      aria-label="Código QR para validar el certificado"
    >
      <QRCodeSVG
        value={url}
        size={size}
        level="H"
        bgColor={light}
        fgColor={dark}
      />
    </div>
  );
}
