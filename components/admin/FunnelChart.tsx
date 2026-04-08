import type { FunnelData } from "@/lib/admin/queries";

const STEPS = [
  { key: "leads", label: "Leads" },
  { key: "visitas", label: "Visitas" },
  { key: "visitasConfirmed", label: "Confirmadas" },
  { key: "visitasCompleted", label: "Completadas" },
  { key: "reservas", label: "Reservas" },
] as const;

export function FunnelChart({ data }: { data: FunnelData }) {
  const max = Math.max(data.leads, 1);

  return (
    <div className="space-y-2">
      {STEPS.map((step, i) => {
        const value = data[step.key];
        const pct = max > 0 ? (value / max) * 100 : 0;
        const prevValue = i > 0 ? data[STEPS[i - 1].key] : null;
        const dropoff =
          prevValue && prevValue > 0
            ? `${Math.round((value / prevValue) * 100)}%`
            : null;

        return (
          <div key={step.key} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-right text-sm text-muted-foreground">
              {step.label}
            </span>
            <div className="relative h-8 flex-1 overflow-hidden rounded bg-muted">
              <div
                className="absolute inset-y-0 left-0 rounded bg-primary/70 transition-all"
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
              <span className="relative z-10 flex h-full items-center px-3 text-sm font-medium">
                {value.toLocaleString("es-AR")}
                {dropoff && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({dropoff} del paso anterior)
                  </span>
                )}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
