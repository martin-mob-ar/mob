'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CertificadoCredencial } from './CertificadoCredencial';
import { CertificadoTarjeta } from './CertificadoTarjeta';
import { CertificadoActions } from './CertificadoActions';

interface CertificadoPageProps {
  id: string;
  nombreCompleto: string;
  montoAprobado: number;
  fechaEmision: string;
  fechaVencimiento: string;
  url: string;
  /** When true, hide the internal-only layout toggle. Defaults false. */
  hideLayoutToggle?: boolean;
}

type Layout = 'credencial' | 'tarjeta';

export function CertificadoPage(props: CertificadoPageProps) {
  const [layout, setLayout] = useState<Layout>('credencial');

  const cardProps = {
    nombreCompleto: props.nombreCompleto,
    montoAprobado: props.montoAprobado,
    fechaEmision: props.fechaEmision,
    fechaVencimiento: props.fechaVencimiento,
    url: props.url,
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Verified banner */}
      <div className="w-full max-w-[540px] flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
        <BadgeCheck className="h-5 w-5 shrink-0" />
        <div className="text-sm font-medium">
          Certificado válido — Validación por Mob
        </div>
      </div>

      {/* Layout toggle (internal) */}
      {!props.hideLayoutToggle && (
        <div className="inline-flex rounded-full bg-muted p-1 text-sm">
          <button
            type="button"
            onClick={() => setLayout('credencial')}
            className={`rounded-full px-4 py-1.5 transition-colors ${
              layout === 'credencial'
                ? 'bg-background shadow-sm font-medium'
                : 'text-muted-foreground'
            }`}
          >
            Credencial
          </button>
          <button
            type="button"
            onClick={() => setLayout('tarjeta')}
            className={`rounded-full px-4 py-1.5 transition-colors ${
              layout === 'tarjeta'
                ? 'bg-background shadow-sm font-medium'
                : 'text-muted-foreground'
            }`}
          >
            Tarjeta
          </button>
        </div>
      )}

      {/* Certificate */}
      <div className="w-full flex justify-center">
        {layout === 'credencial' ? (
          <CertificadoCredencial {...cardProps} />
        ) : (
          <CertificadoTarjeta {...cardProps} />
        )}
      </div>

      {/* Actions */}
      <CertificadoActions
        url={props.url}
        nombreCompleto={props.nombreCompleto}
        montoAprobado={props.montoAprobado}
      />

      {/* CTA */}
      <div className="w-full max-w-[540px] border-t pt-6 mt-2 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          ¿Listo para encontrar tu próximo hogar?
        </p>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link
            href={`/alquileres?precio_max=${props.montoAprobado}`}
            className="gap-2"
          >
            <Search />
            Buscar propiedades hasta ${props.montoAprobado.toLocaleString('es-AR')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
