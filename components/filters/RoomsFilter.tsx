"use client";

import { useState, useEffect } from "react";
import { Bed } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSearchFilters } from "@/contexts/SearchFiltersContext";

const RoomsFilter = () => {
  const [open, setOpen] = useState(false);
  const { filters, setFilters } = useSearchFilters();
  const [minRooms, setMinRoomsRaw] = useState<string>(filters.minRooms || "");
  const [maxRooms, setMaxRoomsRaw] = useState<string>(filters.maxRooms || "");
  const [minAmbientes, setMinAmbientesRaw] = useState<string>(filters.minAmbientes || "");
  const [maxAmbientes, setMaxAmbientesRaw] = useState<string>(filters.maxAmbientes || "");

  // Auto-correct: if min > max, adjust the other value
  const setMinRooms = (v: string) => {
    setMinRoomsRaw(v);
    const n = parseInt(v);
    const m = parseInt(maxRooms);
    if (v && v !== "none" && maxRooms && maxRooms !== "none" && !isNaN(n) && !isNaN(m) && n > m) {
      setMaxRoomsRaw(v);
    }
  };
  const setMaxRooms = (v: string) => {
    setMaxRoomsRaw(v);
    const n = parseInt(minRooms);
    const m = parseInt(v);
    if (v && v !== "none" && minRooms && minRooms !== "none" && !isNaN(n) && !isNaN(m) && m < n) {
      setMinRoomsRaw(v);
    }
  };
  const setMinAmbientes = (v: string) => {
    setMinAmbientesRaw(v);
    const n = parseInt(v);
    const m = parseInt(maxAmbientes);
    if (v && v !== "none" && maxAmbientes && maxAmbientes !== "none" && !isNaN(n) && !isNaN(m) && n > m) {
      setMaxAmbientesRaw(v);
    }
  };
  const setMaxAmbientes = (v: string) => {
    setMaxAmbientesRaw(v);
    const n = parseInt(minAmbientes);
    const m = parseInt(v);
    if (v && v !== "none" && minAmbientes && minAmbientes !== "none" && !isNaN(n) && !isNaN(m) && m < n) {
      setMinAmbientesRaw(v);
    }
  };

  const dormitoriosMinOptions = [
    { label: "Sin mínimo", value: "" },
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
  ];

  const dormitoriosMaxOptions = [
    { label: "Sin máximo", value: "" },
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
  ];

  const ambientesMinOptions = [
    { label: "Sin mínimo", value: "" },
    { label: "Monoamb.", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
  ];

  const ambientesMaxOptions = [
    { label: "Sin máximo", value: "" },
    { label: "Monoamb.", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
  ];

  // Sync local state when context changes externally (e.g. via MoreFiltersPanel)
  useEffect(() => {
    setMinRoomsRaw(filters.minRooms || "");
    setMaxRoomsRaw(filters.maxRooms || "");
    setMinAmbientesRaw(filters.minAmbientes || "");
    setMaxAmbientesRaw(filters.maxAmbientes || "");
  }, [filters.minRooms, filters.maxRooms, filters.minAmbientes, filters.maxAmbientes]);

  const hasMinRooms = minRooms !== "" && minRooms !== "none";
  const hasMaxRooms = maxRooms !== "" && maxRooms !== "none";
  const hasMinAmbientes = minAmbientes !== "" && minAmbientes !== "none";
  const hasMaxAmbientes = maxAmbientes !== "" && maxAmbientes !== "none";

  const getDisplayText = () => {
    const parts = [];

    if (hasMinRooms || hasMaxRooms) {
      const min = hasMinRooms ? minRooms : "1";
      const max = hasMaxRooms ? maxRooms : null;

      if (hasMinRooms && hasMaxRooms) {
        parts.push(`${min}-${max} dorm`);
      } else if (hasMinRooms) {
        parts.push(`${min}+ dorm`);
      } else {
        parts.push(`1-${max} dorm`);
      }
    }

    if (hasMinAmbientes || hasMaxAmbientes) {
      const min = hasMinAmbientes ? minAmbientes : "1";
      const max = hasMaxAmbientes ? maxAmbientes : null;

      if (hasMinAmbientes && hasMaxAmbientes) {
        parts.push(`${min}-${max} amb`);
      } else if (hasMinAmbientes) {
        parts.push(`${min}+ amb`);
      } else {
        parts.push(`1-${max} amb`);
      }
    }

    return parts.length > 0 ? parts.join(", ") : "Dormitorios";
  };

  const handleClear = () => {
    setMinRoomsRaw("");
    setMaxRoomsRaw("");
    setMinAmbientesRaw("");
    setMaxAmbientesRaw("");
    setFilters({ minRooms: "", maxRooms: "", minAmbientes: "", maxAmbientes: "" });
  };

  const handleApply = () => {
    setFilters({
      minRooms: hasMinRooms ? minRooms : "",
      maxRooms: hasMaxRooms ? maxRooms : "",
      minAmbientes: hasMinAmbientes ? minAmbientes : "",
      maxAmbientes: hasMaxAmbientes ? maxAmbientes : "",
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border hover:border-primary/30 transition-colors bg-background">
          <Bed className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{getDisplayText()}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-background" align="start">
        <div className="space-y-5">
          {/* Dormitorios */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">
              Dormitorios
            </p>
            <div className="flex gap-3">
              <Select value={minRooms} onValueChange={setMinRooms}>
                <SelectTrigger className="flex-1 rounded-full border-border focus:ring-primary">
                  <SelectValue placeholder="Sin mínimo" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {dormitoriosMinOptions.map((option) => (
                    <SelectItem key={`min-room-${option.value}`} value={option.value || "none"}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={maxRooms} onValueChange={setMaxRooms}>
                <SelectTrigger className="flex-1 rounded-full border-border focus:ring-primary">
                  <SelectValue placeholder="Sin máximo" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {dormitoriosMaxOptions.map((option) => (
                    <SelectItem key={`max-room-${option.value}`} value={option.value || "none"}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ambientes */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">
              Ambientes
            </p>
            <div className="flex gap-3">
              <Select value={minAmbientes} onValueChange={setMinAmbientes}>
                <SelectTrigger className="flex-1 rounded-full border-border focus:ring-primary">
                  <SelectValue placeholder="Sin mínimo" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {ambientesMinOptions.map((option) => (
                    <SelectItem key={`min-amb-${option.value}`} value={option.value || "none"}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={maxAmbientes} onValueChange={setMaxAmbientes}>
                <SelectTrigger className="flex-1 rounded-full border-border focus:ring-primary">
                  <SelectValue placeholder="Sin máximo" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {ambientesMaxOptions.map((option) => (
                    <SelectItem key={`max-amb-${option.value}`} value={option.value || "none"}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-border" />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleClear}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpiar
            </button>
            <Button
              onClick={handleApply}
              className="rounded-full px-6"
            >
              Ver resultados
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RoomsFilter;
