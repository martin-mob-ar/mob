'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Download,
  FileText,
  Share2,
  Twitter,
  Check,
  Loader2,
} from 'lucide-react';
import { CERTIFICADO_DISCLAIMER } from '@/lib/certificados/types';

interface CertificadoActionsProps {
  url: string;
  nombreCompleto: string;
  montoAprobado: number;
  /** DOM id of the element to capture — defaults to "certificado-mob" */
  targetId?: string;
}

function formatMontoAR(n: number): string {
  return `$${n.toLocaleString('es-AR')}`;
}

// Shared share text. Matches the approved viral copy + tenant's URL.
function buildShareText(montoAprobado: number, url: string): string {
  return [
    'Ya soy un inquilino verificado por @MobAlquileres 🏠✓',
    '',
    `Calificado para alquilar hasta ${formatMontoAR(montoAprobado)}/mes.`,
    '',
    'Y aprobado para una garantía de Hoggax.',
    '',
    `Mirá mi certificado 👇 ${url}`,
  ].join('\n');
}

export function CertificadoActions({
  url,
  nombreCompleto,
  montoAprobado,
  targetId = 'certificado-mob',
}: CertificadoActionsProps) {
  const [busy, setBusy] = useState<null | 'png' | 'pdf' | 'share'>(null);
  const [copied, setCopied] = useState(false);

  async function captureCanvas() {
    const el = document.getElementById(targetId);
    if (!el) throw new Error('No se encontró el certificado para exportar');
    // Dynamic import keeps html2canvas out of the initial bundle
    const { default: html2canvas } = await import('html2canvas');
    return html2canvas(el, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      // Strip elements tagged with data-export-hide from the capture
      // (e.g. the eye toggle next to the approved amount).
      ignoreElements: (node) =>
        node instanceof HTMLElement && node.hasAttribute('data-export-hide'),
    });
  }

  async function handlePng() {
    try {
      setBusy('png');
      const canvas = await captureCanvas();
      const link = document.createElement('a');
      link.download = `certificado-mob-${nombreCompleto
        .replace(/\s+/g, '-')
        .toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('[CertificadoActions] PNG export failed', err);
    } finally {
      setBusy(null);
    }
  }

  async function handlePdf() {
    try {
      setBusy('pdf');
      const canvas = await captureCanvas();
      const { default: JsPDF } = await import('jspdf');

      // A4 portrait in points (pt) — gives us consistent sizing regardless of
      // the card's raster dimensions and leaves room for the disclaimer below.
      const pdf = new JsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const availableWidth = pageWidth - margin * 2;

      // Fit the card image into the available width while preserving aspect.
      const cardAspect = canvas.width / canvas.height;
      const imgWidth = availableWidth;
      const imgHeight = imgWidth / cardAspect;
      const imgX = margin;
      const imgY = margin + 24; // small top pad to feel balanced

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        imgX,
        imgY,
        imgWidth,
        imgHeight
      );

      // Disclaimer block — placed below the card.
      const disclaimerY = imgY + imgHeight + 32;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(107, 114, 128); // muted gray matching the site

      const lines = pdf.splitTextToSize(CERTIFICADO_DISCLAIMER, availableWidth);
      pdf.text(lines, margin, disclaimerY, { lineHeightFactor: 1.45 });

      // Small footer: public URL so a printed copy is still scannable.
      const footerY = pageHeight - margin;
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      pdf.text(url, margin, footerY);
      pdf.text(
        'Validación por Mob + Hoggax',
        pageWidth - margin,
        footerY,
        { align: 'right' }
      );

      pdf.save(
        `certificado-mob-${nombreCompleto.replace(/\s+/g, '-').toLowerCase()}.pdf`
      );
    } catch (err) {
      console.error('[CertificadoActions] PDF export failed', err);
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    try {
      setBusy('share');
      if (navigator.share) {
        await navigator.share({
          title: 'Mi certificado Mob',
          text: buildShareText(montoAprobado, url),
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled native share — no-op
    } finally {
      setBusy(null);
    }
  }

  function handleTweet() {
    const text = buildShareText(montoAprobado, url);
    // Note: we include the URL inside `text` already (as the viral copy
    // requires it to sit under "Mirá mi certificado 👇"). X's intent handler
    // still adds a card preview based on the URL it finds in the tweet body.
    const params = new URLSearchParams({ text });
    window.open(
      `https://twitter.com/intent/tweet?${params.toString()}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  function handleWhatsApp() {
    const text = buildShareText(montoAprobado, url);
    const params = new URLSearchParams({ text });
    window.open(
      `https://api.whatsapp.com/send?${params.toString()}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="outline" size="sm" onClick={handlePng} disabled={!!busy}>
        {busy === 'png' ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Download />
        )}
        Descargar imagen
      </Button>
      <Button variant="outline" size="sm" onClick={handlePdf} disabled={!!busy}>
        {busy === 'pdf' ? (
          <Loader2 className="animate-spin" />
        ) : (
          <FileText />
        )}
        Descargar como PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleTweet}
        disabled={!!busy}
        className="bg-black text-white hover:bg-black/90 hover:text-white border-black"
      >
        <Twitter />
        Compartir en X
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleWhatsApp}
        disabled={!!busy}
        className="bg-[#25D366] text-white hover:bg-[#1fb257] hover:text-white border-[#25D366]"
      >
        <WhatsAppIcon />
        Compartir por WhatsApp
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        disabled={!!busy}
      >
        {copied ? <Check /> : <Share2 />}
        {copied ? 'Copiado' : 'Compartir'}
      </Button>
    </div>
  );
}

// Inline WhatsApp glyph — lucide doesn't ship one and we need brand-accurate.
function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.98L0 24l6.2-1.62A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 21.8c-1.87 0-3.71-.5-5.32-1.45l-.38-.22-3.68.96.98-3.59-.25-.37A9.78 9.78 0 0 1 2.2 12c0-5.4 4.4-9.8 9.8-9.8 2.62 0 5.08 1.02 6.93 2.87A9.73 9.73 0 0 1 21.8 12c0 5.4-4.4 9.8-9.8 9.8zm5.36-7.34c-.29-.15-1.73-.85-2-.95-.27-.1-.46-.15-.66.15-.2.29-.76.95-.94 1.15-.17.2-.35.22-.65.07-.29-.14-1.24-.46-2.36-1.46-.87-.77-1.46-1.73-1.63-2.02-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.14-.17.19-.3.29-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.59-.9-2.18-.24-.57-.48-.49-.66-.5l-.57-.01c-.19 0-.5.07-.76.37s-1 .98-1 2.39 1.02 2.77 1.17 2.96c.14.2 2.01 3.07 4.86 4.3.68.29 1.21.47 1.62.6.68.22 1.3.19 1.79.12.55-.08 1.7-.7 1.94-1.37.24-.68.24-1.26.17-1.37-.07-.12-.26-.19-.55-.34z" />
    </svg>
  );
}
