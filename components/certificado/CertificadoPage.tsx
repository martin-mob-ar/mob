'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Home, ShieldCheck, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CertificadoCredencial } from './CertificadoCredencial';
import { CertificadoCardWrapper } from './CertificadoCardWrapper';
import { CertificadoActions } from './CertificadoActions';

interface CertificadoPageProps {
  id: string;
  nombreCompleto: string;
  montoAprobado: number;
  fechaEmision: string;
  fechaVencimiento: string;
  url: string;
}

export function CertificadoPage(props: CertificadoPageProps) {
  // Owner-controlled privacy toggle — hides the approved amount on the card,
  // the hidden state is preserved in PNG/PDF exports since html2canvas captures
  // the DOM as rendered.
  const [hideAmount, setHideAmount] = useState(false);

  const cardProps = {
    nombreCompleto: props.nombreCompleto,
    montoAprobado: props.montoAprobado,
    fechaEmision: props.fechaEmision,
    fechaVencimiento: props.fechaVencimiento,
    url: props.url,
    hideAmount,
    onToggleAmount: () => setHideAmount((v) => !v),
  };

  return (
    <div className="flex flex-col items-center gap-5 md:gap-7 w-full">
      {/* Certificate card with gentle float animation. Amount toggle lives on the card itself. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full flex justify-center"
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full"
        >
          <CertificadoCardWrapper>
            <CertificadoCredencial {...cardProps} />
          </CertificadoCardWrapper>
        </motion.div>
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-wrap md:flex-nowrap justify-center gap-1.5 md:gap-2"
      >
        <span className="inline-flex w-56 md:w-60 whitespace-nowrap items-center justify-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 md:px-4 md:py-1.5 text-[11px] md:text-xs font-medium text-emerald-700">
          <Home className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
          Apto para alquilar en mob
        </span>
        <span className="inline-flex w-56 md:w-60 whitespace-nowrap items-center justify-center gap-1.5 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 md:px-4 md:py-1.5 text-[11px] md:text-xs font-medium text-primary">
          <ShieldCheck className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
          Aprobado para garantía online
        </span>
        <span className="inline-flex w-56 md:w-60 whitespace-nowrap items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 md:px-4 md:py-1.5 text-[11px] md:text-xs font-medium text-stone-700">
          <Building2 className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
          Presentalo en inmobiliarias
        </span>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-col items-center gap-3 md:gap-4 w-full"
      >
        <CertificadoActions
          url={props.url}
          nombreCompleto={props.nombreCompleto}
          montoAprobado={props.montoAprobado}
        />

        {/* Hide amount toggle */}
        <button
          type="button"
          onClick={() => setHideAmount((v) => !v)}
          className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1"
        >
          <span>Ocultar monto (para compartir en redes)</span>
          <span
            className="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: hideAmount ? '#5170FF' : '#D1D5DB',
            }}
          >
            <span
              className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
              style={{
                transform: hideAmount ? 'translateX(22px)' : 'translateX(2px)',
                marginTop: 2,
              }}
            />
          </span>
        </button>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="w-full max-w-[600px] border-t border-border/60 pt-6 md:pt-8 mt-1 md:mt-2 text-center"
      >
        <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
          ¿Listo para encontrar tu próximo hogar?
        </p>
        <Button
          asChild
          size="lg"
          className="rounded-full px-6 md:px-8 shadow-lg shadow-primary/20 text-sm md:text-base"
        >
          <Link
            href={`/alquileres?maxPrice=${props.montoAprobado}`}
            className="gap-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Buscar propiedades hasta ${props.montoAprobado.toLocaleString('es-AR')}</span>
            <span className="sm:hidden">Buscar hasta ${props.montoAprobado.toLocaleString('es-AR')}</span>
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
