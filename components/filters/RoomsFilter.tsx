"use client";

import { useState } from "react";
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
  const { filters, setFilter } = useSearchFilters();
  const [minRooms, setMinRooms] = useState<string>(filters.rooms || "");
  const [maxRooms, setMaxRooms] = useState<string>("");
  const [minAmbientes, setMinAmbientes] = useState<string>("");
  const [maxAmbientes, setMaxAmbientes] = useState<string>("");

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
    setMinRooms("");
    setMaxRooms("");
    setMinAmbientes("");
    setMaxAmbientes("");
    setFilter("rooms", "");
  };

  const handleApply = () => {
    // Send the minimum rooms to the search context
    const rooms = hasMinRooms ? minRooms : "";
    setFilter("rooms", rooms);
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
