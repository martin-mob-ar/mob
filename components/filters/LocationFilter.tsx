"use client";

import { MapPin, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useSearchFilters } from "@/contexts/SearchFiltersContext";
import { useLocationSearch, LocationResult } from "@/hooks/useLocationSearch";

const LocationFilter = () => {
  const [open, setOpen] = useState(false);
  const { filters, setFilter, setFilters } = useSearchFilters();
  const [search, setSearch] = useState(filters.location);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);

  const { results, isLoading } = useLocationSearch(search, {
    enabled: open && !selectedLocation,
  });

  // Sync search input when filter changes externally
  useEffect(() => {
    setSearch(filters.location);
  }, [filters.location]);

  const handleSelect = (loc: LocationResult) => {
    setSelectedLocation(loc);
    setSearch(loc.name);
    setFilters({
      location: loc.name,
      locationId: String(loc.id),
    });
    setOpen(false);
  };

  const handleClear = () => {
    setSearch("");
    setSelectedLocation(null);
    setFilters({
      location: "",
      locationId: "",
    });
  };

  const handleInputChange = (value: string) => {
    setSearch(value);
    setSelectedLocation(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && search) {
      setFilters({
        location: search,
        locationId: "",
      });
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border hover:border-primary/30 transition-colors bg-background">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {filters.location || "Ubicación"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 bg-background" align="start">
        <div className="space-y-2">
          <Input
            placeholder="Buscar ubicación..."
            value={search}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="rounded-xl"
            autoFocus
          />
          {filters.location && (
            <button
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpiar
            </button>
          )}

          <div className="max-h-56 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando...
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-0.5">
                {results.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => handleSelect(loc)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors flex items-start gap-2"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-foreground block">{loc.name}</span>
                      {loc.display && (
                        <span className="text-xs text-muted-foreground block truncate">{loc.display}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : search.length >= 2 && !selectedLocation ? (
              <div className="px-2 py-3 text-sm text-muted-foreground">
                No se encontraron ubicaciones
              </div>
            ) : search.length < 2 ? (
              <div className="px-2 py-3 text-xs text-muted-foreground">
                Escribi al menos 2 caracteres para buscar
              </div>
            ) : null}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LocationFilter;
