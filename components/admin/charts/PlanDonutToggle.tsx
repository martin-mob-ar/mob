"use client";

import { useState } from "react";
import { PlanDonut } from "./PlanDonut";
import type { PlanCount } from "@/lib/admin/queries";

interface PlanDonutToggleProps {
  todas: PlanCount[];
  duenoDir: PlanCount[];
}

export function PlanDonutToggle({ todas, duenoDir }: PlanDonutToggleProps) {
  const [mode, setMode] = useState<"todas" | "dueno">("todas");

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <div className="inline-flex rounded-md border text-xs">
          <button
            onClick={() => setMode("todas")}
            className={`rounded-l-md px-2.5 py-1 transition-colors ${
              mode === "todas"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setMode("dueno")}
            className={`rounded-r-md px-2.5 py-1 transition-colors ${
              mode === "dueno"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Dueño dir.
          </button>
        </div>
      </div>
      <PlanDonut data={mode === "todas" ? todas : duenoDir} />
    </div>
  );
}
