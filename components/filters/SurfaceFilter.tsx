"use client";

import { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useSearchFilters } from "@/contexts/SearchFiltersContext";

function SurfaceInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
}) {
  const displayValue = value
    ? Number(value).toLocaleString("es-AR")
    : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.replace(/[^\d]/g, ""));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    requestAnimationFrame(() => {
      e.target.setSelectionRange(e.target.value.length, e.target.value.length);
    });
  };

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className="flex h-11 w-full rounded-xl border border-input bg-background pl-3 pr-10 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm font-medium tabular-nums"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
        m²
      </span>
    </div>
  );
}

const SurfaceFilter = () => {
  const [open, setOpen] = useState(false);
  const { filters, setFilters } = useSearchFilters();
  const [surfaceType, setSurfaceType] = useState<"cubierta" | "total">(
    (filters.surfaceType as "cubierta" | "total") || "total"
  );
  const [minSurface, setMinSurface] = useState(filters.minSurface);
  const [maxSurface, setMaxSurface] = useState(filters.maxSurface);

  // Sync local state when context changes externally (e.g. via MoreFiltersPanel)
  useEffect(() => {
    setMinSurface(filters.minSurface);
    setMaxSurface(filters.maxSurface);
    setSurfaceType((filters.surfaceType as "cubierta" | "total") || "total");
  }, [filters.minSurface, filters.maxSurface, filters.surfaceType]);

  const handleApply = () => {
    let min = minSurface;
    let max = maxSurface;
    // Auto-swap if min > max
    if (min && max && parseInt(min) > parseInt(max)) {
      [min, max] = [max, min];
      setMinSurface(min);
      setMaxSurface(max);
    }
    if (min !== filters.minSurface || max !== filters.maxSurface || surfaceType !== filters.surfaceType) {
      setFilters({ minSurface: min, maxSurface: max, surfaceType });
    }
    setOpen(false);
  };

  const handleClear = () => {
    setMinSurface("");
    setMaxSurface("");
    setSurfaceType("total");
    if (filters.minSurface || filters.maxSurface || filters.surfaceType !== "total") {
      setFilters({ minSurface: "", maxSurface: "", surfaceType: "total" });
    }
  };

  const getDisplayText = () => {
    if (minSurface || maxSurface) {
      const type = surfaceType === "cubierta" ? "Cub." : "Tot.";
      const fmt = (v: string) => {
        const n = Number(v);
        return n >= 1_000_000
          ? new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 }).format(n)
          : n.toLocaleString("es-AR");
      };
      if (minSurface && maxSurface) {
        return `${fmt(minSurface)}-${fmt(maxSurface)} m² ${type}`;
      }
      if (minSurface) {
        return `Desde ${fmt(minSurface)} m² ${type}`;
      }
      return `Hasta ${fmt(maxSurface)} m² ${type}`;
    }
    return "Superficie";
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border hover:border-primary/30 transition-colors bg-background">
          <Maximize2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{getDisplayText()}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 bg-background" align="start">
        <div className="space-y-4">
          {/* Surface Type Selector */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Tipo de superficie
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSurfaceType("cubierta")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  surfaceType === "cubierta"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80 text-foreground"
                }`}
              >
                Cubierta
              </button>
              <button
                onClick={() => setSurfaceType("total")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  surfaceType === "total"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80 text-foreground"
                }`}
              >
                Total
              </button>
            </div>
          </div>

          {/* Min/Max Inputs */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Rango de m²
            </p>
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <SurfaceInput
                  value={minSurface}
                  onChange={setMinSurface}
                  placeholder="0"
                />
              </div>
              <span className="text-muted-foreground">-</span>
              <div className="flex-1">
                <SurfaceInput
                  value={maxSurface}
                  onChange={setMaxSurface}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <button
              onClick={handleClear}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpiar
            </button>
            <Button
              onClick={handleApply}
              className="rounded-xl px-6"
            >
              Ver resultados
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SurfaceFilter;
