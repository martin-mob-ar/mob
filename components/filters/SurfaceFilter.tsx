"use client";

import { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchFilters } from "@/contexts/SearchFiltersContext";

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
    if (filters.minSurface || filters.maxSurface) {
      const type = surfaceType === "cubierta" ? "Cub." : "Tot.";
      if (filters.minSurface && filters.maxSurface) {
        return `${filters.minSurface}-${filters.maxSurface} m² ${type}`;
      }
      if (filters.minSurface) {
        return `Desde ${filters.minSurface} m² ${type}`;
      }
      return `Hasta ${filters.maxSurface} m² ${type}`;
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
                <Input
                  inputMode="numeric"
                  placeholder="Desde"
                  value={minSurface}
                  onChange={(e) => setMinSurface(e.target.value.replace(/[^\d]/g, ""))}
                  className="rounded-xl text-sm"
                />
              </div>
              <span className="text-muted-foreground">-</span>
              <div className="flex-1">
                <Input
                  inputMode="numeric"
                  placeholder="Hasta"
                  value={maxSurface}
                  onChange={(e) => setMaxSurface(e.target.value.replace(/[^\d]/g, ""))}
                  className="rounded-xl text-sm"
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
