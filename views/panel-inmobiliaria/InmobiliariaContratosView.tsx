import { Building2, FileText, ExternalLink, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Contract {
  id: string;
  propietarioName: string;
  propietarioInitials: string;
  tenantName: string;
  tenantInitials: string;
  property: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: "activo" | "finalizado";
}

const contracts: Contract[] = [
  {
    id: "1",
    propietarioName: "Juan Pérez",
    propietarioInitials: "JP",
    tenantName: "Carlos Rossi",
    tenantInitials: "CR",
    property: "Loft Palermo Soho",
    startDate: "01/03/2024",
    endDate: "28/02/2026",
    progress: 42,
    status: "activo",
  },
  {
    id: "2",
    propietarioName: "María García",
    propietarioInitials: "MG",
    tenantName: "Mariana López",
    tenantInitials: "ML",
    property: "Piso Exclusivo Recoleta",
    startDate: "15/01/2023",
    endDate: "14/01/2025",
    progress: 95,
    status: "finalizado",
  },
  {
    id: "3",
    propietarioName: "Carlos López",
    propietarioInitials: "CL",
    tenantName: "Andrés Gómez",
    tenantInitials: "AG",
    property: "Estudio Moderno Belgrano",
    startDate: "01/06/2024",
    endDate: "31/05/2026",
    progress: 28,
    status: "activo",
  },
  {
    id: "4",
    propietarioName: "Ana Martínez",
    propietarioInitials: "AM",
    tenantName: "Lucía Fernández",
    tenantInitials: "LF",
    property: "Depto 3 amb Caballito",
    startDate: "01/09/2024",
    endDate: "31/08/2026",
    progress: 15,
    status: "activo",
  },
];

const InmobiliariaContratosView = () => {
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold">Contratos</h1>

      <div className="space-y-4">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-start gap-6">
              {/* Avatars - Propietario e Inquilino */}
              <div className="flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-accent text-primary flex items-center justify-center font-semibold text-sm">
                    {contract.propietarioInitials}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Propietario
                    </p>
                    <p className="font-medium text-sm">{contract.propietarioName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-secondary text-muted-foreground flex items-center justify-center font-semibold text-sm">
                    {contract.tenantInitials}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Inquilino
                    </p>
                    <p className="font-medium text-sm">{contract.tenantName}</p>
                  </div>
                </div>
              </div>

              {/* Property info */}
              <div className="min-w-[180px]">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Propiedad
                </p>
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{contract.property}</span>
                </div>
              </div>

              {/* Contract period */}
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Período de contrato
                </p>
                <p className="font-medium">
                  {contract.startDate} — {contract.endDate}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Progress 
                    value={contract.progress} 
                    className="flex-1 h-2"
                  />
                  <span className="text-sm font-semibold text-primary">
                    {contract.progress}%
                    <span className="text-muted-foreground font-normal ml-1">completado</span>
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <div className="shrink-0">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                    contract.status === "activo"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {contract.status === "activo" ? "Activo" : "Finalizado"}
                </span>
              </div>

              {/* Actions */}
              <div className="shrink-0">
                {contract.status === "activo" ? (
                  <Button variant="outline" className="rounded-full gap-2">
                    <FileText className="h-4 w-4" />
                    Ver contrato PDF
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button variant="outline" className="rounded-full gap-2">
                    <FileText className="h-4 w-4" />
                    Ver checkout
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InmobiliariaContratosView;
