import Link from 'next/link';
import { AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

function formatFechaAR(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function CertificadoExpirado({
  fechaVencimiento,
}: {
  fechaVencimiento: string;
}) {
  return (
    <div className="w-full max-w-[540px] mx-auto flex flex-col items-center gap-5 py-10 text-center">
      <div className="w-full flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <div className="text-sm font-medium">
          Este certificado venció el {formatFechaAR(fechaVencimiento)}
        </div>
      </div>
      <p className="text-muted-foreground max-w-sm">
        El inquilino debe renovar su verificación en Mob para obtener un nuevo
        certificado vigente.
      </p>
      <Button asChild size="lg">
        <Link href="/verificate" className="gap-2">
          <RefreshCw />
          Renovar certificado
        </Link>
      </Button>
    </div>
  );
}

export function CertificadoRevocado() {
  return (
    <div className="w-full max-w-[540px] mx-auto flex flex-col items-center gap-5 py-10 text-center">
      <div className="w-full flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900">
        <XCircle className="h-5 w-5 shrink-0" />
        <div className="text-sm font-medium">
          Este certificado fue revocado
        </div>
      </div>
      <p className="text-muted-foreground max-w-sm">
        El certificado ya no es válido. Si sos el titular, contactanos para más
        información.
      </p>
    </div>
  );
}

export function CertificadoNoEncontrado() {
  return (
    <div className="w-full max-w-[540px] mx-auto flex flex-col items-center gap-5 py-10 text-center">
      <div className="w-full flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900">
        <XCircle className="h-5 w-5 shrink-0" />
        <div className="text-sm font-medium">
          Certificado no encontrado
        </div>
      </div>
      <p className="text-muted-foreground max-w-sm">
        Este certificado no fue emitido por Mob o el link es incorrecto.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Volver a Mob</Link>
      </Button>
    </div>
  );
}
