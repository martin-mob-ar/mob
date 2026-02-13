import { useState } from "react";
import { Building2, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TicketStatus = "abierto" | "cerrado";
type TicketPriority = "alta" | "baja";

interface Ticket {
  id: string;
  code: string;
  title: string;
  description: string;
  property: string;
  tenant: string;
  priority: TicketPriority;
  status: TicketStatus;
  timeAgo: string;
  comments: number;
}

const tickets: Ticket[] = [
  {
    id: "1",
    code: "#TK-432",
    title: "Falla en aire acondicionado",
    description: "El equipo no enciende desde la última tormenta eléctrica.",
    property: "Loft Palermo",
    tenant: "Carlos Rossi",
    priority: "alta",
    status: "abierto",
    timeAgo: "Hace 2 horas",
    comments: 2,
  },
  {
    id: "2",
    code: "#TK-411",
    title: "Limpieza de tanque de agua",
    description: "Solicitud de mantenimiento preventivo anual.",
    property: "Depto Belgrano",
    tenant: "Propietario",
    priority: "baja",
    status: "abierto",
    timeAgo: "Ayer",
    comments: 1,
  },
];

type FilterTab = "todos" | "abiertos" | "cerrados";

const TicketsView = () => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("todos");

  const filteredTickets = tickets.filter((ticket) => {
    if (activeFilter === "todos") return true;
    if (activeFilter === "abiertos") return ticket.status === "abierto";
    if (activeFilter === "cerrados") return ticket.status === "cerrado";
    return true;
  });

  const openCount = tickets.filter((t) => t.status === "abierto").length;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold">Tickets</h1>

      {/* Filter tabs */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveFilter("todos")}
            className={cn(
              "px-6 py-3 rounded-full text-sm font-semibold transition-all",
              activeFilter === "todos"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveFilter("abiertos")}
            className={cn(
              "px-6 py-3 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
              activeFilter === "abiertos"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            Abiertos
            <span
              className={cn(
                "h-5 min-w-[20px] px-1.5 rounded-full text-xs flex items-center justify-center",
                activeFilter === "abiertos"
                  ? "bg-white/20 text-white"
                  : "bg-muted-foreground/20"
              )}
            >
              {openCount}
            </span>
          </button>
          <button
            onClick={() => setActiveFilter("cerrados")}
            className={cn(
              "px-6 py-3 rounded-full text-sm font-semibold transition-all",
              activeFilter === "cerrados"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            Cerrados
          </button>
        </div>
      </div>

      {/* Ticket cards */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm text-muted-foreground font-mono">
                    {ticket.code}
                  </span>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide",
                      ticket.priority === "alta"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {ticket.priority === "alta" ? "Alta prioridad" : "Baja prioridad"}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-muted text-muted-foreground">
                    {ticket.status === "abierto" ? "Abierto" : "Cerrado"}
                  </span>
                </div>

                {/* Title and description */}
                <h3 className="font-display font-semibold text-lg mb-2">{ticket.title}</h3>
                <p className="text-muted-foreground">{ticket.description}</p>

                {/* Footer */}
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="uppercase text-xs tracking-wider font-medium">
                      {ticket.property} • {ticket.tenant}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{ticket.timeAgo}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-primary font-medium">
                    <MessageCircle className="h-4 w-4" />
                    <span>{ticket.comments} comentarios</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Button className="rounded-full shrink-0">Ver gestión</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketsView;
