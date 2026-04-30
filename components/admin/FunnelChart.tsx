import type { FunnelData, FunnelPair } from "@/lib/admin/queries";
import { GenericFunnelBars } from "./GenericFunnelBars";

const STEPS: { key: keyof FunnelData; label: string }[] = [
  { key: "views", label: "Vistas" },
  { key: "submits_started", label: "Envío iniciado" },
  { key: "verifications_requested", label: "Verificación" },
  { key: "submits", label: "Completado" },
];

export function FunnelChart({ data }: { data: FunnelPair }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h4 className="mb-3 text-sm font-medium text-muted-foreground">
          Consulta directa
        </h4>
        <GenericFunnelBars
          steps={STEPS.map((s) => ({ label: s.label, value: data.consulta[s.key] }))}
        />
      </div>
      <div>
        <h4 className="mb-3 text-sm font-medium text-muted-foreground">
          Visita agendada
        </h4>
        <GenericFunnelBars
          steps={STEPS.map((s) => ({ label: s.label, value: data.visita[s.key] }))}
        />
      </div>
    </div>
  );
}
