export interface FunnelStep {
  label: string;
  value: number;
}

export function GenericFunnelBars({ steps }: { steps: FunnelStep[] }) {
  const max = Math.max(...steps.map((s) => s.value), 1);

  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const pct = max > 0 ? (step.value / max) * 100 : 0;
        const prevValue = i > 0 ? steps[i - 1].value : null;
        const dropoff =
          prevValue && prevValue > 0
            ? `${Math.round((step.value / prevValue) * 100)}%`
            : null;

        return (
          <div key={step.label} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-right text-sm text-muted-foreground">
              {step.label}
            </span>
            <div className="relative h-8 flex-1 overflow-hidden rounded bg-muted">
              <div
                className="absolute inset-y-0 left-0 rounded bg-primary/70 transition-all"
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
              <span className="relative z-10 flex h-full items-center px-3 text-sm font-medium">
                {step.value.toLocaleString("es-AR")}
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
