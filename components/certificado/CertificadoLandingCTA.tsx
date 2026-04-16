'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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

// Persisted across reloads so Google-OAuth round-trips still resume the flow.
const PENDING_KEY = 'cert_cta_pending';
// Where the user should land after the auth modal completes. The AuthModal
// reads ?redirect= from the URL to:
//   1. Close itself immediately after login/register (no manual close needed).
//   2. Auto-infer account_type=1 (inquilino) on register, since the redirect
//      path starts with "/verificate" — skipping the account-type picker.
const REDIRECT_TARGET = '/verificate?certificado=true';

/**
 * The "Generar mi certificado" button used on the /certificado landing page.
 *
 * Flow:
 *  - Not logged in       → push ?redirect=/verificate?certificado=true onto
 *                           the URL, set pending flag, open auth modal. The
 *                           AuthModal picks up the redirect automatically.
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, user, openAuthModal, refreshUser } = useAuth();
  const [busy, setBusy] = useState(false);
  // Prevent the effect from firing twice while a generation request is in flight.
  const resumingRef = useRef(false);

  const runFlow = useCallback(async () => {
    if (resumingRef.current) return;
    resumingRef.current = true;

    if (!user) {
      resumingRef.current = false;
      return;
    }

    // Default the caller's account_type to inquilino (1) when unset. The
    // certificate flow is inquilino-only — users arriving here via the CTA
    // are signalling intent. Existing dueño/inmobiliaria classifications are
    // preserved by the endpoint (only sets when currently null).
    if (user.accountType == null) {
      try {
        await fetch('/api/users/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_type: 1 }),
        });
        // Pick up the new accountType in the auth context so downstream
        // screens (e.g. /verificate) render the tenant copy.
        await refreshUser();
      } catch {
        // Non-fatal — continue with the flow.
      }
    }

    if (!user.isVerified) {
      router.push('/verificate?certificado=true');
      return;
    }

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
      resumingRef.current = false;
    }
  }, [user, router, refreshUser]);

  // If we arrive at the page already authenticated with a pending flag
  // (Google OAuth round-trip), or if auth completes while the modal was open
  // (email/password login), resume the flow automatically.
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) return;
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(PENDING_KEY) !== '1') return;

    sessionStorage.removeItem(PENDING_KEY);
    runFlow();
  }, [isAuthenticated, isLoading, user, runFlow]);

  async function handleClick() {
    if (busy || isLoading) return;

    if (!isAuthenticated || !user) {
      // Mark intent so we resume once auth completes (works for both modal
      // login and Google OAuth full-page redirects).
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(PENDING_KEY, '1');
      }
      // Push ?redirect=/verificate?certificado=true onto the URL BEFORE opening
      // the modal. AuthModal reads searchParams / window.location.search to:
      //   - Close the modal + navigate immediately after login.
      //   - Skip the account-type picker on register (redirect starts with
      //     "/verificate" → account_type auto-inferred as inquilino).
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(searchParams.toString());
        params.set('redirect', REDIRECT_TARGET);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
      openAuthModal();
      return;
    }

    await runFlow();
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
