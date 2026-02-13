"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useSearchFilters } from "@/contexts/SearchFiltersContext";

const popularLocations = [
  "Palermo",
  "Belgrano",
  "Recoleta",
  "Villa Crespo",
  "Caballito",
  "Nuñez",
];

const LocationFilter = () => {
  const [open, setOpen] = useState(false);
  const { filters, setFilter } = useSearchFilters();
  const [search, setSearch] = useState(filters.location);

  const handleSelect = (location: string) => {
    setSearch(location);
    setFilter("location", location);
    setOpen(false);
  };

  const handleClear = () => {
    setSearch("");
    setFilter("location", "");
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
      <PopoverContent className="w-72 p-3 bg-background" align="start">
        <div className="space-y-3">
          <Input
            placeholder="Buscar ubicación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && search) {
                setFilter("location", search);
                setOpen(false);
              }
            }}
            className="rounded-xl"
          />
          {filters.location && (
            <button
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpiar
            </button>
          )}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider px-2 mb-2">
              Populares
            </p>
            {popularLocations
              .filter((loc) => loc.toLowerCase().includes(search.toLowerCase()))
              .map((location) => (
                <button
                  key={location}
                  onClick={() => handleSelect(location)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/50 text-sm transition-colors"
                >
                  {location}
                </button>
              ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LocationFilter;
