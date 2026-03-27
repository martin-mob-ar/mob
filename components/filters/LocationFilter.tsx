"use client";

import { MapPin, Loader2, X, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useSearchFilters, SelectedLocation } from "@/contexts/SearchFiltersContext";
import { useLocationSearch, LocationResult } from "@/hooks/useLocationSearch";

const LocationFilter = () => {
  const [open, setOpen] = useState(false);
  const { filters, setFilters } = useSearchFilters();
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, isLoading } = useLocationSearch(search, {
    enabled: open && search.length >= 2,
  });

  // Focus input when popover opens
  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const isAlreadySelected = (loc: LocationResult) =>
    filters.selectedLocations.some((s) => s.id === loc.id && s.type === loc.type);

  const handleSelect = (loc: LocationResult) => {
    if (isAlreadySelected(loc)) {
      handleRemove(loc.id, loc.type);
      return;
    }

    const newSelected: SelectedLocation = {
      id: loc.id,
      name: loc.name,
      display: loc.display,
      type: loc.type,
    };

    const updatedLocations = [...filters.selectedLocations, newSelected];

    // Separate states from locations
    const states = updatedLocations.filter((l) => l.type === "state");
    const locations = updatedLocations.filter((l) => l.type === "location");

    setFilters({
      selectedLocations: updatedLocations,
      location: updatedLocations.map((l) => l.name).join(", "),
      locationId: locations.map((l) => l.id).join(","),
      stateId: states.length > 0 ? String(states[0].id) : "",
    });

    setSearch("");
    inputRef.current?.focus();
  };

  const handleRemove = (id: number, type: "location" | "state") => {
    const updatedLocations = filters.selectedLocations.filter(
      (l) => !(l.id === id && l.type === type)
    );

    const states = updatedLocations.filter((l) => l.type === "state");
    const locations = updatedLocations.filter((l) => l.type === "location");

    setFilters({
      selectedLocations: updatedLocations,
      location: updatedLocations.map((l) => l.name).join(", "),
      locationId: locations.map((l) => l.id).join(","),
      stateId: states.length > 0 ? String(states[0].id) : "",
    });
  };

  const handleClear = () => {
    setSearch("");
    setFilters({
      location: "",
      locationId: "",
      stateId: "",
      selectedLocations: [],
    });
  };

  const getButtonLabel = () => {
    const count = filters.selectedLocations.length;
    if (count === 0) return "Ubicación";
    if (count === 1) return filters.selectedLocations[0].name;
    return `${filters.selectedLocations[0].name} +${count - 1}`;
  };

  const hasSelections = filters.selectedLocations.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-colors bg-background cursor-pointer ${
            hasSelections
              ? "border-primary/40 bg-primary/5 text-primary"
              : "border-border hover:border-primary/30"
          }`}
        >
          <MapPin className={`h-4 w-4 ${hasSelections ? "text-primary" : "text-muted-foreground"}`} />
          <span className="text-sm font-medium">
            {getButtonLabel()}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-background" align="start">
        {/* Selected chips */}
        {hasSelections && (
          <div className="px-3 pt-3 pb-1">
            <div className="flex flex-wrap gap-1.5">
              {filters.selectedLocations.map((loc) => (
                <span
                  key={`${loc.type}-${loc.id}`}
                  className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                  {loc.name}
                  <button
                    onClick={() => handleRemove(loc.id, loc.type)}
                    className="h-4 w-4 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label={`Quitar ${loc.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search input */}
        <div className="p-3 pb-2">
          <Input
            ref={inputRef}
            placeholder="Buscar barrio, ciudad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl"
          />
        </div>

        {/* Results list */}
        <div className="max-h-56 overflow-y-auto px-1.5 pb-1.5">
          {isLoading ? (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando...
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-0.5">
              {results.map((loc) => {
                const selected = isAlreadySelected(loc);
                return (
                  <button
                    key={`${loc.type}-${loc.id}`}
                    onClick={() => handleSelect(loc)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors flex items-start gap-2 cursor-pointer ${
                      selected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    {selected ? (
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <span className={`text-sm font-medium block ${selected ? "text-primary" : "text-foreground"}`}>
                        {loc.name}
                      </span>
                      {loc.display && (
                        <span className="text-xs text-muted-foreground block truncate">
                          {loc.display}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : search.length >= 2 ? (
            <div className="px-3 py-3 text-sm text-muted-foreground">
              No se encontraron ubicaciones
            </div>
          ) : (
            <div className="px-3 py-3 text-xs text-muted-foreground">
              Escribi al menos 2 caracteres para buscar
            </div>
          )}
        </div>

        {/* Footer with clear action */}
        {hasSelections && (
          <div className="px-3 pb-3 pt-1 border-t border-border">
            <button
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Limpiar todo
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default LocationFilter;
