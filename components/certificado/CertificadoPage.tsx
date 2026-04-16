'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CertificadoCredencial } from './CertificadoCredencial';
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
    <div className="flex flex-col items-center gap-7 w-full">
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
          className="w-full max-w-[560px]"
        >
          <CertificadoCredencial {...cardProps} />
        </motion.div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <CertificadoActions
          url={props.url}
          nombreCompleto={props.nombreCompleto}
          montoAprobado={props.montoAprobado}
        />
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="w-full max-w-[560px] border-t border-border/60 pt-8 mt-2 text-center"
      >
        <p className="text-sm text-muted-foreground mb-4">
          ¿Listo para encontrar tu próximo hogar?
        </p>
        <Button
          asChild
          size="lg"
          className="rounded-full px-8 shadow-lg shadow-primary/20"
        >
          <Link
            href={`/alquileres?maxPrice=${props.montoAprobado}`}
            className="gap-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Search className="h-4 w-4" />
            Buscar propiedades hasta $
            {props.montoAprobado.toLocaleString('es-AR')}
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
