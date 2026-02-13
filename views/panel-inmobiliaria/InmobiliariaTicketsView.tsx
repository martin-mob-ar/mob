import { MessageCircle, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Ticket {
  id: string;
  title: string;
  property: string;
  propietario: string;
  inquilino: string;
  createdAt: string;
  status: "abierto" | "en_progreso" | "resuelto";
  priority: "alta" | "media" | "baja";
}

const tickets: Ticket[] = [
  {
    id: "1",
    title: "Aire acondicionado no funciona",
    property: "Depto Recoleta",
    propietario: "Carlos López",
    inquilino: "Mariana López",
    createdAt: "Hace 2 horas",
    status: "abierto",
    priority: "alta",
  },
  {
    id: "2",
    title: "Consulta sobre renovación de contrato",
    property: "Loft Palermo Soho",
    propietario: "Juan Pérez",
    inquilino: "Carlos Rossi",
    createdAt: "Ayer",
    status: "en_progreso",
    priority: "media",
  },
  {
    id: "3",
    title: "Pérdida de agua en baño",
    property: "Estudio Belgrano",
    propietario: "Ana Martínez",
    inquilino: "Andrés Gómez",
    createdAt: "Hace 3 días",
    status: "resuelto",
    priority: "alta",
  },
];

const statusConfig = {
  abierto: {
    label: "Abierto",
    icon: AlertCircle,
    className: "bg-destructive/10 text-destructive",
  },
  en_progreso: {
    label: "En progreso",
    icon: Clock,
    className: "bg-amber-100 text-amber-700",
  },
  resuelto: {
    label: "Resuelto",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700",
  },
};

const priorityConfig = {
  alta: "border-l-destructive",
  media: "border-l-amber-500",
  baja: "border-l-muted-foreground",
};

const InmobiliariaTicketsView = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Tickets / Soporte</h1>
        <Button className="rounded-full gap-2">
          <MessageCircle className="h-4 w-4" />
          Nuevo ticket
        </Button>
      </div>

      <div className="space-y-4">
        {tickets.map((ticket) => {
          const StatusIcon = statusConfig[ticket.status].icon;
          return (
            <div
              key={ticket.id}
              className={`bg-card rounded-2xl border border-border border-l-4 ${priorityConfig[ticket.priority]} p-6`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{ticket.title}</h3>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusConfig[ticket.status].className}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[ticket.status].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>
                      <span className="uppercase text-xs tracking-wider">Propiedad:</span>{" "}
                      <span className="text-foreground font-medium">{ticket.property}</span>
                    </span>
                    <span>
                      <span className="uppercase text-xs tracking-wider">Propietario:</span>{" "}
                      <span className="text-foreground font-medium">{ticket.propietario}</span>
                    </span>
                    <span>
                      <span className="uppercase text-xs tracking-wider">Inquilino:</span>{" "}
                      <span className="text-foreground font-medium">{ticket.inquilino}</span>
                    </span>
                    <span className="text-muted-foreground">{ticket.createdAt}</span>
                  </div>
                </div>
                <Button variant="outline" className="rounded-full">
                  Ver detalle
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InmobiliariaTicketsView;
