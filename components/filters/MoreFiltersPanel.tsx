import { X, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchFilters, SearchFilters } from "@/contexts/SearchFiltersContext";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { CurrencyInput } from "@/components/ui/currency-input";
import { TAG_SECTIONS } from "@/lib/constants/tags";

interface MoreFiltersPanelProps {
  open: boolean;
  onClose: () => void;
}

// Maps UI labels to property_type_name values in the DB
const propertyTypes = [
  { id: "Apartment", label: "Departamento" },
  { id: "House", label: "Casa" },
  { id: "Condo", label: "PH" },
];

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
    (filters.surfaceType as "cubierta" | "total") || "total"
  );
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(filters.tagIds);

  // Sync local state when panel opens
  useEffect(() => {
    if (open) {
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
      setSurfaceType((filters.surfaceType as "cubierta" | "total") || "total");
      setSelectedTagIds(filters.tagIds);
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
    // Convert to ARS for the search
    let min = minPrice;
    let max = maxPrice;
    if (currency === "USD" && usdRate) {
      if (min) min = String(Math.round(parseFloat(min) * usdRate));
      if (max) max = String(Math.round(parseFloat(max) * usdRate));
    }
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
    setFilters({
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
    });
    onClose();
  };

  const handleClear = () => {
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
    setSurfaceType("total");
    setSelectedTagIds([]);
    clearFilters();
    router.replace("/buscar");
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

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="py-4 border-b border-border">
      <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-3">{title}</h4>
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
          <h3 className="font-display text-lg font-bold">Más filtros</h3>
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
            {/* Valor */}
            <FilterSection title="Valor">
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
                    Valor total
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
                    $ Pesos
                  </button>
                  <button
                    onClick={() => handleCurrencySwitch("USD")}
                    className={`flex-1 py-1.5 px-3 rounded-full text-sm font-medium transition-all ${
                      currency === "USD"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    US$ Dólares
                  </button>
                </div>
                {currency === "USD" && usdRate && (
                  <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                    <ArrowRightLeft className="h-3 w-3" />
                    <span>1 USD = <span className="font-semibold text-foreground">${usdRate.toLocaleString("es-AR")}</span> ARS</span>
                  </div>
                )}
                <div className="flex gap-3">
                  <CurrencyInput
                    value={minPrice}
                    onChange={setMinPrice}
                    currency={currency}
                    placeholder={currency === "USD" ? "US$ 0" : "$ 0"}
                  />
                  <CurrencyInput
                    value={maxPrice}
                    onChange={setMaxPrice}
                    currency={currency}
                    placeholder={currency === "USD" ? "US$ 1.000" : "$ 1.000.000"}
                  />
                </div>
              </div>
            </FilterSection>

            {/* Tipos de inmueble */}
            <FilterSection title="Tipos de inmueble">
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
                    <SelectItem value="1">Monoamb.</SelectItem>
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
                    <SelectItem value="1">Monoamb.</SelectItem>
                    {["2", "3", "4", "5"].map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Input
                    placeholder="Mínima (m²)"
                    className="rounded-xl"
                    value={minSurface}
                    onChange={(e) => setMinSurface(e.target.value.replace(/[^\d]/g, ""))}
                  />
                  <Input
                    placeholder="Máxima (m²)"
                    className="rounded-xl"
                    value={maxSurface}
                    onChange={(e) => setMaxSurface(e.target.value.replace(/[^\d]/g, ""))}
                  />
                </div>
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
