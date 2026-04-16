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

function buildTweetText(montoAprobado: number): string {
  return `Ya soy un inquilino verificado por @mob 🏠✓\nCalificado para alquilar hasta ${formatMontoAR(
    montoAprobado
  )}/mes.\n\nMirá mi certificado 👇`;
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
      const isLandscape = canvas.width >= canvas.height;
      const pdf = new JsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        canvas.width,
        canvas.height
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
          text: buildTweetText(montoAprobado),
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
    const params = new URLSearchParams({
      text: buildTweetText(montoAprobado),
      url,
    });
    window.open(
      `https://twitter.com/intent/tweet?${params.toString()}`,
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
        PDF
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
        onClick={handleShare}
        disabled={!!busy}
      >
        {copied ? <Check /> : <Share2 />}
        {copied ? 'Copiado' : 'Compartir'}
      </Button>
    </div>
  );
}
