"use client";

import { Search, ChevronDown, MapPin, Loader2, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocationSearch, LocationResult } from "@/hooks/useLocationSearch";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useExchangeRate } from "@/hooks/useExchangeRate";

const dormitoriosOptions = [
  { value: "sin-minimo", label: "Sin mínimo" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5+", label: "5+" },
];

const ambientesOptions = [
  { value: "sin-minimo", label: "Sin mínimo" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5+", label: "5+" },
];

const SearchBar = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [dormitoriosMin, setDormitoriosMinRaw] = useState<string>("sin-minimo");
  const [dormitoriosMax, setDormitoriosMaxRaw] = useState<string>("sin-minimo");
  const [ambientesMin, setAmbientesMinRaw] = useState<string>("sin-minimo");
  const [ambientesMax, setAmbientesMaxRaw] = useState<string>("sin-minimo");

  // Auto-correct: if min > max, adjust the other value
  const setDormitoriosMin = (v: string) => {
    setDormitoriosMinRaw(v);
    if (v !== "sin-minimo" && dormitoriosMax !== "sin-minimo") {
      const n = parseInt(v); const m = parseInt(dormitoriosMax);
      if (!isNaN(n) && !isNaN(m) && n > m) setDormitoriosMaxRaw(v);
    }
  };
  const setDormitoriosMax = (v: string) => {
    setDormitoriosMaxRaw(v);
    if (v !== "sin-minimo" && dormitoriosMin !== "sin-minimo") {
      const n = parseInt(dormitoriosMin); const m = parseInt(v);
      if (!isNaN(n) && !isNaN(m) && m < n) setDormitoriosMinRaw(v);
    }
  };
  const setAmbientesMin = (v: string) => {
    setAmbientesMinRaw(v);
    if (v !== "sin-minimo" && ambientesMax !== "sin-minimo") {
      const n = parseInt(v); const m = parseInt(ambientesMax);
      if (!isNaN(n) && !isNaN(m) && n > m) setAmbientesMaxRaw(v);
    }
  };
  const setAmbientesMax = (v: string) => {
    setAmbientesMaxRaw(v);
    if (v !== "sin-minimo" && ambientesMin !== "sin-minimo") {
      const n = parseInt(ambientesMin); const m = parseInt(v);
      if (!isNaN(n) && !isNaN(m) && m < n) setAmbientesMinRaw(v);
    }
  };

  // Location state
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const roomsDropdownRef = useRef<HTMLDivElement>(null);
  const roomsTriggerRef = useRef<HTMLButtonElement>(null);
  const { results: locationResults, isLoading: locationLoading } = useLocationSearch(locationQuery, {
    enabled: !selectedLocation,
  });

  // Price state
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<"ARS" | "USD">("ARS");
  const { rate: usdRate } = useExchangeRate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // Ignore clicks inside Radix portals (Select dropdowns rendered outside the DOM tree)
      if ((target as Element).closest?.("[data-radix-popper-content-wrapper]")) return;
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(target) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(target)
      ) {
        setShowLocationDropdown(false);
      }
      if (
        roomsDropdownRef.current &&
        !roomsDropdownRef.current.contains(target) &&
        roomsTriggerRef.current &&
        !roomsTriggerRef.current.contains(target)
      ) {
        setRoomsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationSelect = (loc: LocationResult) => {
    setSelectedLocation(loc);
    setLocationQuery(loc.name);
    setShowLocationDropdown(false);
  };

  const handleLocationInputChange = (value: string) => {
    setLocationQuery(value);
    setSelectedLocation(null);
    setShowLocationDropdown(value.length >= 2);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedLocation) {
      params.set("location", selectedLocation.name);
      if (selectedLocation.type === "state") {
        params.set("stateId", String(selectedLocation.id));
      } else {
        params.set("locationId", String(selectedLocation.id));
      }
    } else if (locationQuery.trim()) {
      params.set("location", locationQuery.trim());
    }
    if (dormitoriosMin !== "sin-minimo") params.set("minRooms", dormitoriosMin.replace("+", ""));
    if (dormitoriosMax !== "sin-minimo") params.set("maxRooms", dormitoriosMax.replace("+", ""));
    if (ambientesMin !== "sin-minimo") params.set("minAmbientes", ambientesMin.replace("+", ""));
    if (ambientesMax !== "sin-minimo") params.set("maxAmbientes", ambientesMax.replace("+", ""));
    if (price) {
      let numericPrice = price.replace(/[^\d]/g, "");
      if (numericPrice) {
        // Convert USD to ARS for the backend (DB stores ARS)
        if (currency === "USD" && usdRate) {
          numericPrice = String(Math.round(parseFloat(numericPrice) * usdRate));
        }
        params.set("maxPrice", numericPrice);
      }
    }
    const qs = params.toString();
    router.push(qs ? `/buscar?${qs}` : "/buscar");
  };

  const handleClearRooms = () => {
    setDormitoriosMinRaw("sin-minimo");
    setDormitoriosMaxRaw("sin-minimo");
    setAmbientesMinRaw("sin-minimo");
    setAmbientesMaxRaw("sin-minimo");
  };

  const getRoomsLabel = () => {
    const hasSelection =
      dormitoriosMin !== "sin-minimo" ||
      dormitoriosMax !== "sin-minimo" ||
      ambientesMin !== "sin-minimo" ||
      ambientesMax !== "sin-minimo";

    if (!hasSelection) return "Dormitorios";

    const parts: string[] = [];
    if (dormitoriosMin !== "sin-minimo" || dormitoriosMax !== "sin-minimo") {
      if (dormitoriosMin !== "sin-minimo" && dormitoriosMax !== "sin-minimo") {
        parts.push(`${dormitoriosMin}-${dormitoriosMax} dorm.`);
      } else if (dormitoriosMin !== "sin-minimo") {
        parts.push(`${dormitoriosMin}+ dorm.`);
      } else {
        parts.push(`≤${dormitoriosMax} dorm.`);
      }
    }
    if (ambientesMin !== "sin-minimo" || ambientesMax !== "sin-minimo") {
      if (ambientesMin !== "sin-minimo" && ambientesMax !== "sin-minimo") {
        parts.push(`${ambientesMin}-${ambientesMax} amb.`);
      } else if (ambientesMin !== "sin-minimo") {
        parts.push(`${ambientesMin}+ amb.`);
      } else {
        parts.push(`≤${ambientesMax} amb.`);
      }
    }
    return parts.join(", ") || "Dormitorios";
  };

  const locationDropdown = showLocationDropdown ? (
    <div
      ref={locationDropdownRef}
      className="absolute left-0 right-0 top-full mt-1 bg-background border border-border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
    >
      {locationLoading ? (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Buscando...
        </div>
      ) : locationResults.length > 0 ? (
        locationResults.map((loc) => (
          <button
            key={loc.id}
            onClick={() => handleLocationSelect(loc)}
            className="w-full text-left px-4 py-2.5 hover:bg-secondary/50 transition-colors flex items-start gap-2"
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
      ) : locationQuery.length >= 2 ? (
        <div className="px-4 py-3 text-sm text-muted-foreground">
          No se encontraron ubicaciones
        </div>
      ) : null}
    </div>
  ) : null;

  const roomsInnerContent = (
    <div className="space-y-5">
      {/* Dormitorios */}
      <div>
        <label className="text-sm font-semibold text-foreground block mb-3">Dormitorios</label>
        <div className="flex gap-3">
          <Select value={dormitoriosMin} onValueChange={setDormitoriosMin}>
            <SelectTrigger className="flex-1 rounded-xl h-11">
              <SelectValue placeholder="Sin mínimo" />
            </SelectTrigger>
            <SelectContent className="bg-background z-[100]">
              {dormitoriosOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dormitoriosMax} onValueChange={setDormitoriosMax}>
            <SelectTrigger className="flex-1 rounded-xl h-11">
              <SelectValue placeholder="sin máximo" />
            </SelectTrigger>
            <SelectContent className="bg-background z-[100]">
              {dormitoriosOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.value === "sin-minimo" ? "sin máximo" : opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ambientes */}
      <div>
        <label className="text-sm font-semibold text-foreground block mb-3">Ambientes</label>
        <div className="flex gap-3">
          <Select value={ambientesMin} onValueChange={setAmbientesMin}>
            <SelectTrigger className="flex-1 rounded-xl h-11">
              <SelectValue placeholder="Sin mínimo" />
            </SelectTrigger>
            <SelectContent className="bg-background z-[100]">
              {ambientesOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={ambientesMax} onValueChange={setAmbientesMax}>
            <SelectTrigger className="flex-1 rounded-xl h-11">
              <SelectValue placeholder="sin máximo" />
            </SelectTrigger>
            <SelectContent className="bg-background z-[100]">
              {ambientesOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.value === "sin-minimo" ? "sin máximo" : opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <button
          onClick={handleClearRooms}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Limpiar
        </button>
        <Button
          onClick={() => setRoomsOpen(false)}
          className="rounded-xl px-6"
        >
          Aceptar
        </Button>
      </div>
    </div>
  );

  // Desktop Layout
  if (!isMobile) {
    return (
      <div className="w-full max-w-4xl mx-auto search-bar-mob">
        <div className="flex items-center p-1.5 bg-card rounded-full border border-border shadow-md">
          <div className="flex-1 grid grid-cols-[1fr_1fr] divide-x divide-border">
            <div className="px-6 py-3 relative">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ubicación
              </label>
              <input
                ref={locationInputRef}
                type="text"
                placeholder="Ciudad, barrio..."
                value={locationQuery}
                onChange={(e) => handleLocationInputChange(e.target.value)}
                onFocus={() => locationQuery.length >= 2 && !selectedLocation && setShowLocationDropdown(true)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none mt-1"
              />
              {locationDropdown}
            </div>

            <div className="px-6 py-3 relative">
              <Popover open={roomsOpen} onOpenChange={setRoomsOpen} modal={true}>
                <PopoverTrigger asChild>
                  <div className="cursor-pointer">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Dormitorios
                    </label>
                    <button type="button" className="w-full flex items-center justify-between text-foreground mt-1">
                      <span>{getRoomsLabel()}</span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${roomsOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-4 bg-background z-50 !rounded-xl border border-border shadow-lg" align="center">
                  {roomsInnerContent}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            size="icon"
            className="h-12 w-12 rounded-full flex-shrink-0 mr-1"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Mobile Layout — 3-row compact search card
  return (
    <div className="w-full">
      <div className="bg-background border border-border rounded-xl shadow-sm overflow-visible relative">
        {/* Row 1: Location */}
        <div className="px-4 py-3 relative">
          <div className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <input
              ref={locationInputRef}
              type="text"
              placeholder="Ciudad, barrio..."
              value={locationQuery}
              onChange={(e) => handleLocationInputChange(e.target.value)}
              onFocus={() => locationQuery.length >= 2 && !selectedLocation && setShowLocationDropdown(true)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-[15px]"
            />
          </div>
          {locationDropdown}
        </div>

        {/* Row 2: Dormitorios */}
        <div className="flex items-center border-t border-border relative">
          {/* Dormitorios */}
          <div className="flex-1">
            <button
              ref={roomsTriggerRef}
              type="button"
              onClick={() => { setRoomsOpen(!roomsOpen); setShowLocationDropdown(false); }}
              className="w-full flex items-center justify-between px-4 py-2.5 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground truncate">{getRoomsLabel()}</span>
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform ${roomsOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Dormitorios dropdown — same pattern as location dropdown */}
          {roomsOpen && (
            <div
              ref={roomsDropdownRef}
              className="absolute left-0 right-0 bottom-full mb-1 bg-background border border-border rounded-xl shadow-lg z-50 p-4 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200"
            >
              {roomsInnerContent}
            </div>
          )}
        </div>

        {/* Row 3: Search button */}
        <div className="px-4 pb-3 pt-1.5">
          <Button
            onClick={handleSearch}
            className="w-full h-11 rounded-xl font-semibold text-sm"
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
