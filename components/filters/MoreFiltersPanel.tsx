import { X, ArrowRightLeft, MapPin, Loader2 as Spinner, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchFilters, SearchFilters, SelectedLocation } from "@/contexts/SearchFiltersContext";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { CurrencyInput } from "@/components/ui/currency-input";
import { TAG_SECTIONS } from "@/lib/constants/tags";
import { useLocationSearch, LocationResult } from "@/hooks/useLocationSearch";
import { AnimateHeight } from "@/components/ui/animate-height";

interface MoreFiltersPanelProps {
  open: boolean;
  onClose: () => void;
}

// Maps to property_type_name values in the DB (Spanish names from tokko_property_type)
const propertyTypes = [
  { id: "Departamento", label: "Departamento" },
  { id: "Casa", label: "Casa" },
  { id: "PH", label: "PH" },
];

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

  return (
    <div className="relative flex-1">
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
        onFocus={(e) => requestAnimationFrame(() => e.target.setSelectionRange(e.target.value.length, e.target.value.length))}
        placeholder={placeholder}
        className="flex h-11 w-full rounded-xl border border-input bg-background pl-3 pr-10 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm font-medium tabular-nums"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
        m²
      </span>
    </div>
  );
}

const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="py-4 border-b border-border">
    <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-widest mb-3">{title}</h4>
    {children}
  </div>
);

const NumberPill = ({
  value,
  label,
  selected,
  onSelect,
}: {
  value: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    onClick={onSelect}
    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
      selected
        ? "border-primary bg-primary/10 text-primary"
        : "border-border hover:border-primary hover:bg-primary/5"
    }`}
  >
    {label}
  </button>
);

const MoreFiltersPanel = ({ open, onClose }: MoreFiltersPanelProps) => {
  const { filters, setFilters, clearFilters, search } = useSearchFilters();
  const { rate: usdRate } = useExchangeRate();
  const router = useRouter();

  // Local state mirrors context filters so user can tweak before applying
  const [priceType, setPriceType] = useState<"total" | "alquiler">("total");
  const [currency, setCurrency] = useState<"ARS" | "USD">("ARS");
  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(filters.propertyTypeNames);
  const [minRooms, setMinRoomsRaw] = useState(filters.minRooms);
  const [maxRooms, setMaxRoomsRaw] = useState(filters.maxRooms);
  const [minAmbientes, setMinAmbientesRaw] = useState(filters.minAmbientes);
  const [maxAmbientes, setMaxAmbientesRaw] = useState(filters.maxAmbientes);

  // Auto-correct: if min > max, adjust the other value
  const setMinRooms = (v: string) => {
    setMinRoomsRaw(v);
    const n = parseInt(v); const m = parseInt(maxRooms);
    if (v && v !== "none" && maxRooms && maxRooms !== "none" && !isNaN(n) && !isNaN(m) && n > m) setMaxRoomsRaw(v);
  };
  const setMaxRooms = (v: string) => {
    setMaxRoomsRaw(v);
    const n = parseInt(minRooms); const m = parseInt(v);
    if (v && v !== "none" && minRooms && minRooms !== "none" && !isNaN(n) && !isNaN(m) && m < n) setMinRoomsRaw(v);
  };
  const setMinAmbientes = (v: string) => {
    setMinAmbientesRaw(v);
    const n = parseInt(v); const m = parseInt(maxAmbientes);
    if (v && v !== "none" && maxAmbientes && maxAmbientes !== "none" && !isNaN(n) && !isNaN(m) && n > m) setMaxAmbientesRaw(v);
  };
  const setMaxAmbientes = (v: string) => {
    setMaxAmbientesRaw(v);
    const n = parseInt(minAmbientes); const m = parseInt(v);
    if (v && v !== "none" && minAmbientes && minAmbientes !== "none" && !isNaN(n) && !isNaN(m) && m < n) setMinAmbientesRaw(v);
  };
  const [parking, setParking] = useState(filters.parking);
  const [bathrooms, setBathrooms] = useState(filters.bathrooms);
  const [minSurface, setMinSurface] = useState(filters.minSurface);
  const [maxSurface, setMaxSurface] = useState(filters.maxSurface);
  const [surfaceType, setSurfaceType] = useState<"cubierta" | "total">(
    (filters.surfaceType as "cubierta" | "total") || "cubierta"
  );
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(filters.tagIds);
  const [availabilityFilter, setAvailabilityFilter] = useState<"" | "immediate" | "next-month" | "custom">(filters.availabilityFilter);
  const [availabilityDate, setAvailabilityDate] = useState(filters.availabilityDate);
  const [ownerType, setOwnerType] = useState<"" | "dueno" | "inmobiliaria">(filters.ownerType);

  // Location multi-select state
  const [locationSearch, setLocationSearch] = useState("");
  const [pendingLocations, setPendingLocations] = useState<SelectedLocation[]>(filters.selectedLocations);
  const { results: locationResults, isLoading: locationLoading } = useLocationSearch(locationSearch, {
    enabled: open && locationSearch.length >= 2,
  });

  const isPendingSelected = (loc: LocationResult) =>
    pendingLocations.some((s) => s.id === loc.id && s.type === loc.type);

  const handleLocationSelect = (loc: LocationResult) => {
    if (isPendingSelected(loc)) {
      setPendingLocations((prev) => prev.filter((l) => !(l.id === loc.id && l.type === loc.type)));
    } else {
      setPendingLocations((prev) => [...prev, { id: loc.id, name: loc.name, display: loc.display, type: loc.type, slug: loc.slug ?? undefined, stateSlug: loc.stateSlug ?? undefined }]);
    }
    setLocationSearch("");
  };

  const handleLocationRemove = (id: number, type: "location" | "state") => {
    setPendingLocations((prev) => prev.filter((l) => !(l.id === id && l.type === type)));
  };

  const handleLocationClear = () => {
    setLocationSearch("");
    setPendingLocations([]);
  };

  // Sync local state when panel opens
  useEffect(() => {
    if (open) {
      setLocationSearch("");
      setPendingLocations(filters.selectedLocations);
      setCurrency(filters.currency || "ARS");
      setPriceType(filters.priceType || "total");
      setMinPrice(filters.minPrice);
      setMaxPrice(filters.maxPrice);
      setSelectedTypes(filters.propertyTypeNames);
      setMinRoomsRaw(filters.minRooms);
      setMaxRoomsRaw(filters.maxRooms);
      setMinAmbientesRaw(filters.minAmbientes);
      setMaxAmbientesRaw(filters.maxAmbientes);
      setParking(filters.parking);
      setBathrooms(filters.bathrooms);
      setMinSurface(filters.minSurface);
      setMaxSurface(filters.maxSurface);
      setSurfaceType((filters.surfaceType as "cubierta" | "total") || "cubierta");
      setSelectedTagIds(filters.tagIds);
      setAvailabilityFilter(filters.availabilityFilter);
      setAvailabilityDate(filters.availabilityDate);
      setOwnerType(filters.ownerType);
    }
  }, [open, filters]);

  const handleCurrencySwitch = (newCurrency: "ARS" | "USD") => {
    if (newCurrency === currency || !usdRate) {
      setCurrency(newCurrency);
      return;
    }
    if (newCurrency === "USD") {
      setMinPrice(minPrice ? String(Math.round(parseFloat(minPrice) / usdRate)) : "");
      setMaxPrice(maxPrice ? String(Math.round(parseFloat(maxPrice) / usdRate)) : "");
    } else {
      setMinPrice(minPrice ? String(Math.round(parseFloat(minPrice) * usdRate)) : "");
      setMaxPrice(maxPrice ? String(Math.round(parseFloat(maxPrice) * usdRate)) : "");
    }
    setCurrency(newCurrency);
  };

  if (!open) return null;

  const handleApply = () => {
    let min = minPrice;
    let max = maxPrice;
    // Auto-swap if min > max
    if (min && max && parseInt(min) > parseInt(max)) {
      [min, max] = [max, min];
    }
    // Auto-swap surface if min > max
    let surfMin = minSurface;
    let surfMax = maxSurface;
    if (surfMin && surfMax && parseInt(surfMin) > parseInt(surfMax)) {
      [surfMin, surfMax] = [surfMax, surfMin];
    }
    // Build location filter values from pending selections
    const pendingStates = pendingLocations.filter((l) => l.type === "state");
    const pendingLocs = pendingLocations.filter((l) => l.type === "location");

    setFilters({
      selectedLocations: pendingLocations,
      location: pendingLocations.map((l) => l.name).join(", "),
      locationId: pendingLocs.map((l) => l.id).join(","),
      stateId: pendingStates.length > 0 ? String(pendingStates[0].id) : "",
      currency,
      priceType,
      minPrice: min,
      maxPrice: max,
      propertyTypeNames: selectedTypes,
      minRooms: minRooms && minRooms !== "none" ? minRooms : "",
      maxRooms: maxRooms && maxRooms !== "none" ? maxRooms : "",
      minAmbientes: minAmbientes && minAmbientes !== "none" ? minAmbientes : "",
      maxAmbientes: maxAmbientes && maxAmbientes !== "none" ? maxAmbientes : "",
      parking,
      bathrooms,
      minSurface: surfMin,
      maxSurface: surfMax,
      surfaceType,
      tagIds: selectedTagIds,
      availabilityFilter,
      availabilityDate: availabilityFilter === "custom" ? availabilityDate : "",
      ownerType,
    });
    onClose();
  };

  const handleClear = () => {
    setLocationSearch("");
    setPendingLocations([]);
    setMinPrice("");
    setMaxPrice("");
    setCurrency("ARS");
    setSelectedTypes([]);
    setMinRoomsRaw("");
    setMaxRoomsRaw("");
    setMinAmbientesRaw("");
    setMaxAmbientesRaw("");
    setParking("");
    setBathrooms("");
    setMinSurface("");
    setMaxSurface("");
    setSurfaceType("cubierta");
    setSelectedTagIds([]);
    setAvailabilityFilter("");
    setAvailabilityDate("");
    setOwnerType("");
    clearFilters();
    router.replace("/alquileres");
    onClose();
  };

  const toggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleTagId = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed left-0 top-0 bottom-0 w-full max-w-md bg-background z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-display text-lg font-bold">Filtros</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {/* Ubicación — multi-select */}
            <FilterSection title="Ubicación">
              <div className="space-y-2">
                {/* Selected chips */}
                {pendingLocations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {pendingLocations.map((loc) => (
                      <span
                        key={`${loc.type}-${loc.id}`}
                        className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                      >
                        {loc.name}
                        <button
                          onClick={() => handleLocationRemove(loc.id, loc.type)}
                          className="h-4 w-4 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors cursor-pointer"
                          aria-label={`Quitar ${loc.name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={handleLocationClear}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1 cursor-pointer"
                    >
                      Limpiar
                    </button>
                  </div>
                )}

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar barrio, ciudad..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="rounded-xl pl-9"
                  />
                </div>
                <div className="max-h-44 overflow-y-auto">
                  {locationLoading ? (
                    <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
                      <Spinner className="h-4 w-4 animate-spin" />
                      Buscando...
                    </div>
                  ) : locationResults.length > 0 ? (
                    <div className="space-y-0.5">
                      {locationResults.map((loc) => {
                        const selected = isPendingSelected(loc);
                        return (
                          <button
                            key={`${loc.type}-${loc.id}`}
                            onClick={() => handleLocationSelect(loc)}
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
                            <div className="min-w-0">
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
                  ) : locationSearch.length >= 2 ? (
                    <div className="px-2 py-3 text-sm text-muted-foreground">
                      No se encontraron ubicaciones
                    </div>
                  ) : locationSearch.length > 0 && locationSearch.length < 2 ? (
                    <div className="px-2 py-3 text-xs text-muted-foreground">
                      Escribi al menos 2 caracteres para buscar
                    </div>
                  ) : null}
                </div>
              </div>
            </FilterSection>

            {/* Precio */}
            <FilterSection title="Precio">
              <div className="space-y-3">
                <div className="flex rounded-full border border-border p-1 bg-muted/30">
                  <button
                    onClick={() => setPriceType("total")}
                    className={`flex-1 py-1.5 px-4 rounded-full text-sm font-medium transition-all ${
                      priceType === "total"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    Precio total
                  </button>
                  <button
                    onClick={() => setPriceType("alquiler")}
                    className={`flex-1 py-1.5 px-4 rounded-full text-sm font-medium transition-all ${
                      priceType === "alquiler"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    Alquiler
                  </button>
                </div>
                <div className="flex rounded-full border border-border p-1 bg-muted/30">
                  <button
                    onClick={() => handleCurrencySwitch("ARS")}
                    className={`flex-1 py-1.5 px-3 rounded-full text-sm font-medium transition-all ${
                      currency === "ARS"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    Pesos
                  </button>
                  <button
                    onClick={() => handleCurrencySwitch("USD")}
                    className={`flex-1 py-1.5 px-3 rounded-full text-sm font-medium transition-all ${
                      currency === "USD"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    Dólares
                  </button>
                </div>
                {currency === "USD" && usdRate && (
                  <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-muted/50 text-xs text-muted-foreground">
                    <ArrowRightLeft className="h-3 w-3" />
                    <span>1 USD = <span className="font-semibold text-foreground">${usdRate.toLocaleString("es-AR")}</span> ARS</span>
                  </div>
                )}
                <div className="flex gap-3">
                  <CurrencyInput
                    value={minPrice}
                    onChange={setMinPrice}
                    currency={currency}
                    placeholder={currency === "USD" ? "USD 0" : "$ 0"}
                  />
                  <CurrencyInput
                    value={maxPrice}
                    onChange={setMaxPrice}
                    currency={currency}
                    placeholder={currency === "USD" ? "USD 1.000" : "$ 1.000.000"}
                  />
                </div>
              </div>
            </FilterSection>

            {/* Tipo de inmueble */}
            <FilterSection title="Tipo de inmueble">
              <div className="flex flex-wrap gap-2">
                {propertyTypes.map((type) => (
                  <label
                    key={type.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full border cursor-pointer text-sm transition-colors ${
                      selectedTypes.includes(type.id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <Checkbox
                      className="h-4 w-4"
                      checked={selectedTypes.includes(type.id)}
                      onCheckedChange={() => toggleType(type.id)}
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Dormitorios */}
            <FilterSection title="Dormitorios">
              <div className="flex gap-3">
                <Select value={minRooms || "none"} onValueChange={(v) => setMinRooms(v === "none" ? "" : v)}>
                  <SelectTrigger className="flex-1 rounded-full border-border">
                    <SelectValue placeholder="Sin mínimo" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="none">Sin mínimo</SelectItem>
                    {["1", "2", "3", "4", "5"].map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={maxRooms || "none"} onValueChange={(v) => setMaxRooms(v === "none" ? "" : v)}>
                  <SelectTrigger className="flex-1 rounded-full border-border">
                    <SelectValue placeholder="Sin máximo" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="none">Sin máximo</SelectItem>
                    {["1", "2", "3", "4", "5"].map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FilterSection>

            {/* Ambientes */}
            <FilterSection title="Ambientes">
              <div className="flex gap-3">
                <Select value={minAmbientes || "none"} onValueChange={(v) => setMinAmbientes(v === "none" ? "" : v)}>
                  <SelectTrigger className="flex-1 rounded-full border-border">
                    <SelectValue placeholder="Sin mínimo" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="none">Sin mínimo</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    {["2", "3", "4", "5"].map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={maxAmbientes || "none"} onValueChange={(v) => setMaxAmbientes(v === "none" ? "" : v)}>
                  <SelectTrigger className="flex-1 rounded-full border-border">
                    <SelectValue placeholder="Sin máximo" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="none">Sin máximo</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    {["2", "3", "4", "5"].map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FilterSection>

            {/* Tipo de dueño */}
            <FilterSection title="Tipo de dueño">
              <div className="flex gap-2">
                {([
                  { value: "" as const, label: "Todos" },
                  { value: "inmobiliaria" as const, label: "Inmobiliaria" },
                  { value: "dueno" as const, label: "Dueño directo" },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setOwnerType(opt.value)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                      ownerType === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Cocheras */}
            <FilterSection title="Cocheras">
              <div className="flex gap-2">
                <NumberPill
                  value=""
                  label="Indistinto"
                  selected={parking === ""}
                  onSelect={() => setParking("")}
                />
                {["1", "2", "3"].map((n) => (
                  <NumberPill
                    key={n}
                    value={n}
                    label={`${n}+`}
                    selected={parking === n}
                    onSelect={() => setParking(parking === n ? "" : n)}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Baños */}
            <FilterSection title="Baños">
              <div className="flex gap-2">
                {["1", "2", "3", "4"].map((n) => (
                  <NumberPill
                    key={n}
                    value={n}
                    label={`${n}+`}
                    selected={bathrooms === n}
                    onSelect={() => setBathrooms(bathrooms === n ? "" : n)}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Superficie */}
            <FilterSection title="Superficie">
              <div className="space-y-3">
                <div className="flex rounded-full border border-border p-1 bg-muted/30">
                  <button
                    onClick={() => setSurfaceType("cubierta")}
                    className={`flex-1 py-1.5 px-4 rounded-full text-sm font-medium transition-all ${
                      surfaceType === "cubierta"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    Cubierta
                  </button>
                  <button
                    onClick={() => setSurfaceType("total")}
                    className={`flex-1 py-1.5 px-4 rounded-full text-sm font-medium transition-all ${
                      surfaceType === "total"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    Total
                  </button>
                </div>
                <div className="flex gap-3">
                  <SurfaceInput
                    value={minSurface}
                    onChange={setMinSurface}
                    placeholder="0"
                  />
                  <SurfaceInput
                    value={maxSurface}
                    onChange={setMaxSurface}
                    placeholder="0"
                  />
                </div>
              </div>
            </FilterSection>

            {/* Disponibilidad */}
            <FilterSection title="Disponibilidad">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {([
                    { value: "immediate", label: "Disponible ahora" },
                    { value: "next-month", label: "Próximo mes" },
                    { value: "custom", label: "Elegir fecha" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAvailabilityFilter(availabilityFilter === opt.value ? "" : opt.value)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                        availabilityFilter === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <AnimateHeight show={availabilityFilter === "custom"}>
                  <div className="relative pt-1">
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      max="9999-12-31"
                      value={availabilityDate}
                      onChange={(e) => setAvailabilityDate(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </AnimateHeight>
              </div>
            </FilterSection>

            {/* Tag sections from shared constants */}
            {TAG_SECTIONS.map((section) => (
              <FilterSection key={section.title} title={section.title}>
                <div className="flex flex-wrap gap-2">
                  {section.tags.map((tag) => (
                    <label
                      key={tag.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full border cursor-pointer text-sm transition-colors ${
                        selectedTagIds.includes(tag.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <Checkbox
                        className="h-4 w-4"
                        checked={selectedTagIds.includes(tag.id)}
                        onCheckedChange={() => toggleTagId(tag.id)}
                      />
                      {tag.label}
                    </label>
                  ))}
                </div>
              </FilterSection>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-3">
          <Button variant="outline" className="flex-1 rounded-full" onClick={handleClear}>
            Limpiar
          </Button>
          <Button className="flex-1 rounded-full" onClick={handleApply}>
            Ver resultados
          </Button>
        </div>
      </div>
    </>
  );
};

export default MoreFiltersPanel;
