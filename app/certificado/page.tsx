import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CertificadoLandingContent } from '@/components/certificado/CertificadoLandingContent';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.mob.ar';

export const metadata: Metadata = {
  title: 'Certificado Mob | Tu aprobación de inquilino, en un link',
  description:
    'Verificate una vez y recibí un certificado público con QR. Compartilo en X, presentalo en inmobiliarias o llevalo a la visita — tu aprobación de inquilino calificado, siempre a mano.',
  alternates: { canonical: `${APP_URL}/certificado` },
  openGraph: {
    title: 'Certificado Mob | Tu aprobación de inquilino, en un link',
    description:
      'Verificate una vez y recibí un certificado público con QR. Validación por Mob + Hoggax.',
    url: `${APP_URL}/certificado`,
    type: 'website',
    siteName: 'Mob',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Certificado Mob | Tu aprobación de inquilino, en un link',
    description:
      'Verificate una vez y recibí un certificado público con QR. Validación por Mob + Hoggax.',
  },
};

export default function CertificadoLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CertificadoLandingContent />
      <Footer />
    </div>
  );
}
