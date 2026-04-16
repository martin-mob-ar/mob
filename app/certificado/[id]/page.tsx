import type { Metadata } from 'next';
import Link from 'next/link';
import { getCertificadoById } from '@/lib/certificados/create';
import { computeCertificadoState } from '@/lib/certificados/types';
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
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="w-full border-b bg-white">
        <div className="max-w-[640px] mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-black text-2xl tracking-tight"
            style={{ fontFamily: `'Ubuntu', system-ui, sans-serif` }}
          >
            mob
          </Link>
          <div className="text-xs text-muted-foreground">
            Validación por <span className="font-semibold text-foreground">Mob</span>
          </div>
        </div>
      </header>

      <main className="max-w-[640px] mx-auto px-5 py-8">
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
      </main>

      <footer className="max-w-[640px] mx-auto px-5 py-10">
        <p className="text-[11px] leading-relaxed text-muted-foreground text-center">
          Este certificado es meramente informativo sobre el estado crediticio
          actual, carece de efectos vinculantes y no constituye obligación alguna
          de Mob de actuar como fiador ni genera derecho alguno a favor de
          terceros. La concesión de fianza queda sujeta a aprobación, pago y
          firma del contrato de fianza correspondiente. Cualquier modificación o
          variación en las condiciones que constituyen el valor de la garantía
          será causa de nulidad del presente certificado.
        </p>
      </footer>
    </div>
  );
}
