'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BadgeCheck, Search } from 'lucide-react';
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
  const cardProps = {
    nombreCompleto: props.nombreCompleto,
    montoAprobado: props.montoAprobado,
    fechaEmision: props.fechaEmision,
    fechaVencimiento: props.fechaVencimiento,
    url: props.url,
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Verified banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[540px] flex items-center gap-2.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-emerald-900"
      >
        <BadgeCheck className="h-4 w-4 shrink-0" />
        <div className="text-xs md:text-sm font-medium">
          Certificado válido · Validación por Mob + Hoggax
        </div>
      </motion.div>

      {/* Certificate card with gentle float animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full flex justify-center"
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full max-w-[540px]"
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
        className="w-full max-w-[540px] border-t border-border/60 pt-8 mt-2 text-center"
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
            href={`/alquileres?precio_max=${props.montoAprobado}`}
            className="gap-2"
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
