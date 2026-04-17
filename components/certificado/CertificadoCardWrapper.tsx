'use client';

import type { ReactNode } from 'react';

/**
 * Pure-CSS responsive wrapper for the certificado card.
 *
 * Uses CSS `container-type: inline-size` on the outer div so we can
 * query its actual width with `@container`. The inner div is always
 * 600px and we apply `zoom` via container query breakpoints.
 *
 * This avoids all JS measurement issues (window.innerWidth vs CSS viewport,
 * device toolbar quirks, etc.).
 */
export function CertificadoCardWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="certificado-card-container w-full max-w-[600px] mx-auto">
      <div className="certificado-card-inner">
        {children}
      </div>
    </div>
  );
}
