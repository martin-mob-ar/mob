'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface CertificadoLandingCTAProps {
  /** Optional label override. Defaults to "Generar mi certificado". */
  label?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

/**
 * The "Generar mi certificado" button used on the /certificado landing page.
 *
 * Flow:
 *  - Not logged in       → open auth modal.
 *  - Logged in, not verified → redirect to /verificate?certificado=true.
 *  - Logged in, verified → POST /api/certificados/generate-for-me → redirect to /certificado/[id].
 *  - 409 NOT_ELIGIBLE (edge case: stale auth state) → redirect to /verificate?certificado=true.
 */
export function CertificadoLandingCTA({
  label = 'Generar mi certificado',
  className,
  size = 'lg',
}: CertificadoLandingCTAProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, openAuthModal } = useAuth();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy || isLoading) return;

    if (!isAuthenticated || !user) {
      openAuthModal();
      return;
    }

    if (!user.isVerified) {
      router.push('/verificate?certificado=true');
      return;
    }

    // Verified — try to generate the certificate right here.
    setBusy(true);
    try {
      const res = await fetch('/api/certificados/generate-for-me', {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.id) {
        router.push(`/certificado/${data.id}`);
        return;
      }

      if (res.status === 409) {
        // Eligibility changed between client state and server — route through verify.
        router.push('/verificate?certificado=true');
        return;
      }

      throw new Error(data?.error || 'No pudimos generar tu certificado');
    } catch (err) {
      console.error('[CertificadoLandingCTA]', err);
      toast.error(
        err instanceof Error ? err.message : 'No pudimos generar tu certificado',
        { position: 'bottom-right' }
      );
      setBusy(false);
    }
  }

  return (
    <Button
      size={size}
      onClick={handleClick}
      disabled={busy || isLoading}
      className={
        className ||
        'rounded-full px-10 py-6 text-base font-semibold shadow-xl shadow-primary/25 group'
      }
    >
      {busy ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          {label}
          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </Button>
  );
}
