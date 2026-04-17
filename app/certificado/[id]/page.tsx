import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { getCertificadoById } from '@/lib/certificados/create';
import { computeCertificadoState, CERTIFICADO_DISCLAIMER } from '@/lib/certificados/types';
import { CertificadoPage } from '@/components/certificado/CertificadoPage';
import {
  CertificadoExpirado,
  CertificadoRevocado,
  CertificadoNoEncontrado,
} from '@/components/certificado/CertificadoEstados';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.mob.ar';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const cert = await getCertificadoById(id);
  const state = computeCertificadoState(cert);
  const canonical = `${APP_URL}/certificado/${id}`;

  if (state !== 'valid' || !cert) {
    return {
      title: 'Certificado no disponible — Mob',
      description: 'Este certificado no es válido o no fue encontrado.',
      robots: { index: false },
      alternates: { canonical },
    };
  }

  const montoTexto = `$${cert.monto_aprobado.toLocaleString('es-AR')}`;
  const title = `Soy inquilino verificado por Mob — Calificado hasta ${montoTexto}/mes`;
  const description = `Certificado Mob de inquilino calificado. Identidad verificada, scoring aprobado y garantía de alquiler por Hoggax.`;

  return {
    title,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: 'Mob',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CertificadoPageRoute({ params }: PageProps) {
  const { id } = await params;
  const cert = await getCertificadoById(id);
  const state = computeCertificadoState(cert);

  const url = `${APP_URL}/certificado/${id}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        {/* Logo row */}
        <div className="relative px-4 sm:px-5 md:px-6 pt-5 md:pt-7">
          <Link
            href="/"
            aria-label="Ir a Mob"
            className="inline-flex items-center transition-opacity hover:opacity-80"
          >
            <Image
              src="/assets/mob-logo-new.png"
              alt="mob"
              width={112}
              height={44}
              priority
              className="h-8 md:h-10 w-auto"
            />
          </Link>
        </div>

        <div className="relative max-w-[680px] mx-auto px-4 sm:px-5 md:px-6 pt-6 md:pt-10 pb-10 md:pb-16">
          {state === 'not_found' && <CertificadoNoEncontrado />}
          {state === 'revoked' && <CertificadoRevocado />}
          {state === 'expired' && cert && (
            <CertificadoExpirado fechaVencimiento={cert.fecha_vencimiento} />
          )}
          {state === 'valid' && cert && (
            <CertificadoPage
              id={cert.id}
              nombreCompleto={cert.nombre_completo}
              montoAprobado={cert.monto_aprobado}
              fechaEmision={cert.fecha_emision}
              fechaVencimiento={cert.fecha_vencimiento}
              url={url}
            />
          )}

          {state === 'valid' && (
            <p className="mt-8 md:mt-12 text-[10px] md:text-[11px] leading-relaxed text-muted-foreground text-center max-w-[560px] mx-auto">
              {CERTIFICADO_DISCLAIMER}
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
