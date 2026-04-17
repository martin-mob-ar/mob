'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Share2, Loader2 } from 'lucide-react';
import { CERTIFICADO_DISCLAIMER } from '@/lib/certificados/types';

interface CertificadoActionsProps {
  url: string;
  nombreCompleto: string;
  /** DOM id of the element to capture — defaults to "certificado-mob" */
  targetId?: string;
}

type BusyState = null | 'png' | 'pdf' | 'share';

export function CertificadoActions({
  url,
  nombreCompleto,
  targetId = 'certificado-mob',
}: CertificadoActionsProps) {
  const [busy, setBusy] = useState<BusyState>(null);

  /** Capture the card as a PNG blob using html-to-image (SVG foreignObject).
   *  This renders exactly what the browser shows — no CSS re-interpretation. */
  async function captureBlob(): Promise<Blob> {
    const el = document.getElementById(targetId);
    if (!el) throw new Error('No se encontró el certificado para exportar');
    const { toBlob } = await import('html-to-image');

    // Hide elements tagged with data-export-hide (e.g. eye toggle)
    const filter = (node: Node) => {
      if (node instanceof HTMLElement && node.hasAttribute('data-export-hide')) {
        return false;
      }
      return true;
    };

    const blob = await toBlob(el, {
      pixelRatio: 2,
      filter,
    });
    if (!blob) throw new Error('toBlob returned null');
    return blob;
  }

  async function handlePng() {
    try {
      setBusy('png');
      const blob = await captureBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `certificado-mob-${nombreCompleto
        .replace(/\s+/g, '-')
        .toLowerCase()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[CertificadoActions] PNG export failed', err);
    } finally {
      setBusy(null);
    }
  }

  async function handlePdf() {
    try {
      setBusy('pdf');
      const blob = await captureBlob();
      const imgDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      // Get image dimensions to compute aspect ratio
      const img = await new Promise<HTMLImageElement>((resolve) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.src = imgDataUrl;
      });

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
      const cardAspect = img.naturalWidth / img.naturalHeight;
      const imgWidth = availableWidth;
      const imgHeight = imgWidth / cardAspect;
      const imgX = margin;
      const imgY = margin + 24; // small top pad to feel balanced

      pdf.addImage(imgDataUrl, 'PNG', imgX, imgY, imgWidth, imgHeight);

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
      const blob = await captureBlob();
      const file = new File(
        [blob],
        `certificado-mob-${nombreCompleto.replace(/\s+/g, '-').toLowerCase()}.png`,
        { type: 'image/png' }
      );
      await navigator.share({
        files: [file],
      });
    } catch {
      // user cancelled or share not supported — no-op
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2 w-full max-w-[600px]">
      <Button variant="outline" size="sm" onClick={handlePng} disabled={!!busy} className="w-full sm:w-auto">
        {busy === 'png' ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Download />
        )}
        Descargar imagen
      </Button>
      <Button variant="outline" size="sm" onClick={handlePdf} disabled={!!busy} className="w-full sm:w-auto">
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
        onClick={handleShare}
        disabled={!!busy}
        className="col-span-2 sm:col-span-1 w-full sm:w-auto"
      >
        {busy === 'share' ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Share2 />
        )}
        Compartir
      </Button>
    </div>
  );
}
