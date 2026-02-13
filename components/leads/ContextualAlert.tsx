import { Button } from "@/components/ui/button";
import { AlertCircle, Star, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ContextualAlertProps {
  type: "pending_decision" | "high_probability" | "inactive";
  count?: number;
  daysInactive?: number;
  leadName?: string;
  propertyId?: string;
}

const ContextualAlert = ({ type, count, daysInactive, leadName, propertyId }: ContextualAlertProps) => {
  if (type === "pending_decision") {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              Tenés {count} interesado{count !== 1 ? "s" : ""} esperando decisión
            </p>
            <p className="text-sm text-muted-foreground">
              Respondé pronto para no perder oportunidades
            </p>
          </div>
        </div>
        {propertyId ? (
          <Button asChild variant="outline" size="sm" className="rounded-full shrink-0">
            <Link href={`/gestion/propiedad/${propertyId}`}>
              Revisar ahora
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="rounded-full shrink-0">
            Revisar ahora
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    );
  }

  if (type === "high_probability") {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
            <Star className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {leadName ? `${leadName} tiene` : "Este perfil tiene"} alta probabilidad de cierre
            </p>
            <p className="text-sm text-muted-foreground">
              Perfil verificado con buena capacidad de pago
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-full shrink-0 border-green-500/30 text-green-700 hover:bg-green-500/10">
          Ver perfil
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  if (type === "inactive") {
    return (
      <div className="bg-muted border border-border rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted-foreground/10 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              Hace {daysInactive} días que no tomás una decisión
            </p>
            <p className="text-sm text-muted-foreground">
              Los interesados pueden perder interés si no hay respuesta
            </p>
          </div>
        </div>
        <Button size="sm" className="rounded-full shrink-0">
          Revisar ahora
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  return null;
};

export default ContextualAlert;
