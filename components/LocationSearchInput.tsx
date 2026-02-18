"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, X, Search, Loader2 } from "lucide-react";
import { useLocationSearch, LocationResult } from "@/hooks/useLocationSearch";
import { cn } from "@/lib/utils";

interface LocationSearchInputProps {
  selectedLocation: LocationResult | null;
  onSelect: (loc: LocationResult) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

const LocationSearchInput = ({
  selectedLocation,
  onSelect,
  onClear,
  placeholder = "Buscá un barrio o localidad...",
  className,
}: LocationSearchInputProps) => {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { results, isLoading } = useLocationSearch(query, {
    enabled: !selectedLocation && showDropdown,
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (loc: LocationResult) => {
    onSelect(loc);
    setQuery("");
    setShowDropdown(false);
  };

  const handleClear = () => {
    onClear();
    setQuery("");
    setShowDropdown(false);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowDropdown(value.length >= 2);
  };

  if (selectedLocation) {
    return (
      <div className={cn("flex items-center gap-2 h-14 w-full rounded-xl border-2 border-border bg-background px-4 py-1 text-base", className)}>
        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="font-medium">{selectedLocation.name}</span>
          {selectedLocation.display && (
            <span className="text-muted-foreground ml-1.5 text-sm">
              — {selectedLocation.display}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={placeholder}
          className={cn(
            "flex h-14 w-full rounded-xl border-2 border-border bg-background pl-11 pr-4 py-1 text-base focus-visible:outline-none focus-visible:border-primary",
            className
          )}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (query.length >= 2) setShowDropdown(true);
          }}
        />
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full z-50 mt-2 bg-background border border-border rounded-xl shadow-xl max-h-72 overflow-y-auto"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando...
            </div>
          ) : results.length > 0 ? (
            results.map((loc) => (
              <button
                key={loc.id}
                type="button"
                className="w-full text-left px-4 py-2.5 hover:bg-secondary/50 transition-colors flex items-start gap-2"
                onClick={() => handleSelect(loc)}
              >
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-sm font-medium text-foreground block">{loc.name}</span>
                  {loc.display && (
                    <span className="text-xs text-muted-foreground block truncate">{loc.display}</span>
                  )}
                </div>
              </button>
            ))
          ) : query.length >= 2 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No se encontraron ubicaciones
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default LocationSearchInput;
