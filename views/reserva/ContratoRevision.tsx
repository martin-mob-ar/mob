"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReservationLayout from "@/components/reservation/ReservationLayout";
import { 
  FileText, 
  ArrowRight,
  ChevronLeft,
  MessageCircle,
  Link as LinkIcon,
  CheckCircle2,
  Eye
} from "lucide-react";

const ContratoRevision = () => {
  const router = useRouter();

  const handleSign = () => {
    router.push("/reserva/contrato-firmado");
  };

  const handleBack = () => {
    router.push("/reserva/aprobada");
  };

  return (
    <ReservationLayout showProgress={false}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="h-14 w-14 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">
              Revisá el contrato
            </h1>
            <p className="text-muted-foreground">
              Te enviamos el contrato para que lo revises antes de firmar
            </p>
          </div>

          {/* Contract Card */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Contrato de alquiler</p>
                    <p className="text-sm text-muted-foreground">PDF · 12 páginas</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Eye className="h-4 w-4" />
                  Ver
                </Button>
              </div>

              <div className="h-px bg-border" />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Duración: 24 meses</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Actualización: ICL semestral</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Garantía: Hoggax incluida</span>
                </div>
              </div>
            </div>
          </div>

          {/* Share options */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Compartir para revisión
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="rounded-xl h-12 gap-2">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button variant="outline" className="rounded-xl h-12 gap-2">
                <LinkIcon className="h-4 w-4" />
                Copiar link
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground text-center">
              Tanto vos como el propietario pueden revisar el contrato antes de firmar
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border shrink-0">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Atrás
          </Button>
          <Button 
            onClick={handleSign}
            className="flex-1 rounded-full gap-2"
          >
            <FileText className="h-4 w-4" />
            Firmar contrato
          </Button>
        </div>
      </div>
    </ReservationLayout>
  );
};

export default ContratoRevision;
