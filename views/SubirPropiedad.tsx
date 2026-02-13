"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLoadScript } from "@react-google-maps/api";
import {
  ArrowLeft,
  Home,
  Clock,
  Plus,
  Minus,
  Upload,
  Calendar,
  Search,
  X,
  Loader2,
  MapPin,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { getGeometryFromPlace } from "@/lib/google-maps/places";
import { createClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mobLogo = "/assets/mob-logo-new.png";

const TOTAL_STEPS = 9;
const GOOGLE_MAPS_LIBRARIES: ("places" | "geometry")[] = ["places"];
const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 };

const propertyTypes = [
  { id: 2, label: "Departamento" },
  { id: 3, label: "Casa" },
  { id: 13, label: "PH" },
];

const disposiciones = ["Frente", "Contrafrente", "Lateral"];

const curatedTags = [
  { id: 10, label: "Balcón" },
  { id: 35, label: "Parrilla" },
  { id: 51, label: "Pileta" },
  { id: 33, label: "Gimnasio" },
  { id: 41, label: "SUM" },
  { id: 20, label: "Laundry" },
  { id: 1524, label: "Seguridad 24hs" },
  { id: 21, label: "Terraza" },
  { id: 54, label: "Apto profesional" },
];

const weekDays = [
  { id: "lunes", label: "Lunes" },
  { id: "martes", label: "Martes" },
  { id: "miercoles", label: "Miércoles" },
  { id: "jueves", label: "Jueves" },
  { id: "viernes", label: "Viernes" },
];

const hours = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

interface LocationSearchResult {
  id: number;
  name: string;
  depth: number;
  display: string;
}

const SubirPropiedad = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step 2: Tipo de propiedad
  const [typeId, setTypeId] = useState<number | null>(null);

  // Step 3: Ubicación
  const [locationId, setLocationId] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationSearchResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [placeSelected, setPlaceSelected] = useState(false);
  const [address, setAddress] = useState("");
  const [geoLat, setGeoLat] = useState("");
  const [geoLong, setGeoLong] = useState("");
  const [piso, setPiso] = useState("");
  const [depto, setDepto] = useState("");

  // Step 4: Map
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  // Step 5: Detalles
  const [ambientes, setAmbientes] = useState(2);
  const [dormitorios, setDormitorios] = useState(1);
  const [banos, setBanos] = useState(1);
  const [cocheras, setCocheras] = useState(0);
  const [antiguedad, setAntiguedad] = useState("");
  const [superficie, setSuperficie] = useState("");
  const [disposicion, setDisposicion] = useState("Frente");

  // Step 6: Precio y características
  const [precioMensual, setPrecioMensual] = useState("");
  const [moneda, setMoneda] = useState<"USD" | "ARS">("USD");
  const [expensas, setExpensas] = useState("");
  const [expensasIncluidas, setExpensasIncluidas] = useState(true);
  const [amoblado, setAmoblado] = useState(false);
  const [dispuestoNegociar, setDispuestoNegociar] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // Step 8: Logística
  const [fechaDisponible, setFechaDisponible] = useState("");
  const [coordinacionLlaves, setCoordinacionLlaves] = useState("");
  const [diasVisita, setDiasVisita] = useState<string[]>(["lunes", "miercoles", "jueves"]);
  const [horariosVisita, setHorariosVisita] = useState<Record<string, { start: string; end: string }>>({
    lunes: { start: "09:00", end: "18:00" },
    martes: { start: "09:00", end: "18:00" },
    miercoles: { start: "09:00", end: "18:00" },
    jueves: { start: "09:00", end: "18:00" },
    viernes: { start: "09:00", end: "18:00" },
  });

  // Google Maps
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const progress = (currentStep / TOTAL_STEPS) * 100;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced location search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/locations/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
        const json = await res.json();
        setSearchResults(json.data ?? []);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // Initialize map on Step 4
  useEffect(() => {
    if (currentStep !== 4 || !isLoaded || !mapRef.current || typeof google === "undefined") return;
    if (mapInstanceRef.current) return;

    const lat = geoLat ? parseFloat(geoLat) : DEFAULT_CENTER.lat;
    const lng = geoLong ? parseFloat(geoLong) : DEFAULT_CENTER.lng;
    const hasCoords = geoLat && geoLong;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: hasCoords ? 16 : 10,
      disableDefaultUI: false,
    });
    mapInstanceRef.current = map;

    if (hasCoords) {
      const marker = new google.maps.Marker({
        map,
        position: { lat, lng },
        draggable: true,
        title: address || "Ubicación",
      });
      markerRef.current = marker;

      marker.addListener("dragend", () => {
        const pos = marker.getPosition();
        if (pos) {
          setGeoLat(String(pos.lat()));
          setGeoLong(String(pos.lng()));
        }
      });
    }
  }, [currentStep, isLoaded, geoLat, geoLong, address]);

  // Reset map instance when leaving step 4
  useEffect(() => {
    if (currentStep !== 4) {
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  }, [currentStep]);

  const handleLocationSelect = (location: LocationSearchResult) => {
    setSelectedLocation(location);
    setLocationId(location.id);
    setSearchQuery("");
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleLocationClear = () => {
    setSelectedLocation(null);
    setLocationId(null);
    setAddress("");
    setGeoLat("");
    setGeoLong("");
    setPlaceSelected(false);
  };

  const onPlaceSelect = useCallback(() => {
    const autocomplete = autocompleteRef.current;
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (!place.geometry?.location) return;

    const geo = getGeometryFromPlace(place);
    if (!geo) return;

    setAddress(place.formatted_address || place.name || "");
    setGeoLat(String(geo.lat));
    setGeoLong(String(geo.lng));
    setPlaceSelected(true);
  }, []);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const toggleTagId = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const toggleDiaVisita = (dia: string) => {
    setDiasVisita((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const updateHorario = (dia: string, field: "start" | "end", value: string) => {
    setHorariosVisita((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSubmitError("Debes iniciar sesión para publicar una propiedad.");
        setIsSubmitting(false);
        return;
      }

      const propertyTypeLabel = propertyTypes.find((t) => t.id === typeId)?.label || "";
      const locationName = selectedLocation?.name || "";
      const autoTitle = `${propertyTypeLabel} en ${locationName}`.trim();

      // Build visit hours as strings: "lunes 09:00-18:00"
      const visitHoursArr = diasVisita.map((dia) => {
        const h = horariosVisita[dia];
        return `${dia} ${h?.start || "09:00"}-${h?.end || "18:00"}`;
      });

      const body = {
        profile_id: user.id,
        type_id: typeId,
        address: address || null,
        geo_lat: geoLat || null,
        geo_long: geoLong || null,
        location_id: locationId,
        room_amount: ambientes,
        bathroom_amount: banos,
        parking_lot_amount: cocheras,
        total_surface: superficie ? String(superficie) : null,
        age: antiguedad ? parseInt(antiguedad) : null,
        disposition: disposicion || null,
        floor: piso || null,
        apartment_door: depto || null,
        price: precioMensual ? Number(precioMensual) : null,
        currency: moneda,
        expenses: !expensasIncluidas && expensas ? Number(expensas) : null,
        tagIds: selectedTagIds,
        publication_title: autoTitle,
        description: null,
        available_date: fechaDisponible || null,
        key_coordination: coordinacionLlaves || null,
        visit_days: diasVisita,
        visit_hours: visitHoursArr,
      };

      const res = await fetch("/api/properties/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (!res.ok) {
        setSubmitError(result.error || "Error al crear la propiedad.");
        setIsSubmitting(false);
        return;
      }

      router.push("/gestion");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CounterInput = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
  }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-border">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <Minus className="h-4 w-4 text-muted-foreground" />
        </button>
        <span className="w-8 text-center font-bold text-xl">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );

  const getPropertyTypeLabel = () => propertyTypes.find((t) => t.id === typeId)?.label || "—";

  const renderStep = () => {
    switch (currentStep) {
      // Step 1: Welcome
      case 1:
        return (
          <div className="flex flex-col items-center text-center max-w-lg mx-auto">
            <div className="w-full max-w-md aspect-[4/3] rounded-3xl bg-accent/50 flex items-center justify-center mb-8">
              <Home className="h-16 w-16 text-primary/60" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">
              Vamos a dar de alta tu propiedad
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Te guiaremos en un proceso simple para que tu inmueble luzca
              increíble y atraiga a los mejores inquilinos verificados.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Toma unos 5 minutos
            </div>
          </div>
        );

      // Step 2: Tipo de propiedad
      case 2:
        return (
          <div className="max-w-xl mx-auto space-y-8">
            <h1 className="font-display text-3xl font-bold">
              ¿Qué tipo de propiedad es?
            </h1>
            <div className="grid grid-cols-3 gap-3">
              {propertyTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setTypeId(type.id)}
                  className={cn(
                    "py-4 px-6 rounded-2xl border-2 text-sm font-semibold transition-all",
                    typeId === type.id
                      ? "border-primary bg-accent text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {type.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        );

      // Step 3: Ubicación (Barrio + Address)
      case 3:
        return (
          <div className="max-w-xl mx-auto space-y-8">
            <h1 className="font-display text-3xl font-bold">
              ¿Dónde está ubicada?
            </h1>

            <div className="space-y-6">
              {/* Barrio search */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                  Barrio / Localidad
                </label>

                {selectedLocation ? (
                  <div className="flex items-center gap-2 h-14 w-full rounded-xl border border-border bg-background px-4 py-1 text-base">
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
                      onClick={handleLocationClear}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative" ref={dropdownRef}>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        placeholder="Buscá un barrio o localidad..."
                        className="flex h-14 w-full rounded-xl border border-border bg-background pl-11 pr-11 py-1 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => {
                          if (searchResults.length > 0) setShowDropdown(true);
                        }}
                      />
                      {searchLoading && (
                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                      )}
                    </div>

                    {showDropdown && searchResults.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-xl border border-border bg-background shadow-lg">
                        {searchResults.map((loc) => (
                          <button
                            key={loc.id}
                            type="button"
                            className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border last:border-b-0"
                            onClick={() => handleLocationSelect(loc)}
                          >
                            <div className="text-sm font-medium">{loc.name}</div>
                            {loc.display && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {loc.display}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {showDropdown && searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
                      <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-background shadow-lg px-4 py-3 text-sm text-muted-foreground">
                        No se encontraron resultados para &ldquo;{searchQuery}&rdquo;
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Google Address Autocomplete — only after barrio selected */}
              {selectedLocation && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                    Dirección
                  </label>
                  <input
                    type="text"
                    defaultValue={address}
                    placeholder="Escribe y seleccioná una dirección..."
                    className={cn(
                      "flex h-14 w-full rounded-xl border bg-background px-4 py-1 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      !placeSelected && address ? "border-red-500" : "border-border"
                    )}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setPlaceSelected(false);
                    }}
                    ref={(el) => {
                      if (!el || !isLoaded || typeof google === "undefined") return;
                      if ((el as any)._autocompleteAttached) return;
                      (el as any)._autocompleteAttached = true;
                      const autocomplete = new google.maps.places.Autocomplete(el, {
                        types: ["address"],
                        componentRestrictions: { country: "ar" },
                        fields: ["geometry", "formatted_address", "name"],
                      });
                      autocomplete.addListener("place_changed", onPlaceSelect);
                      autocompleteRef.current = autocomplete;
                    }}
                  />
                  {!placeSelected && address && (
                    <p className="text-sm text-red-500 mt-2">
                      Seleccioná una dirección de las sugerencias de Google Maps
                    </p>
                  )}
                </div>
              )}

              {/* Piso / Depto — only after address selected */}
              {selectedLocation && placeSelected && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                      Piso
                    </label>
                    <Input
                      value={piso}
                      onChange={(e) => setPiso(e.target.value)}
                      placeholder="Ej: 4"
                      className="h-14 rounded-xl text-base"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                      Depto
                    </label>
                    <Input
                      value={depto}
                      onChange={(e) => setDepto(e.target.value)}
                      placeholder="Ej: B"
                      className="h-14 rounded-xl text-base"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      // Step 4: Confirmar dirección (Google Map)
      case 4:
        return (
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">
                Confirmá la ubicación exacta
              </h1>
              <p className="text-muted-foreground">
                Podés arrastrar el marcador para ajustar la ubicación.
              </p>
            </div>

            <div
              ref={mapRef}
              className="w-full aspect-square max-w-lg mx-auto rounded-3xl overflow-hidden border border-border"
              style={{ minHeight: "400px" }}
            >
              {!isLoaded && (
                <div className="flex items-center justify-center h-full bg-secondary/30">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        );

      // Step 5: Detalles del espacio
      case 5:
        return (
          <div className="max-w-xl mx-auto space-y-6">
            <h1 className="font-display text-3xl font-bold">
              Detalles del espacio
            </h1>

            <div className="space-y-3">
              <CounterInput label="Ambientes" value={ambientes} onChange={setAmbientes} />
              <CounterInput label="Dormitorios" value={dormitorios} onChange={setDormitorios} />
              <CounterInput label="Baños" value={banos} onChange={setBanos} />
              <CounterInput label="Cocheras" value={cocheras} onChange={setCocheras} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                  Antigüedad (años)
                </label>
                <Input
                  value={antiguedad}
                  onChange={(e) => setAntiguedad(e.target.value)}
                  placeholder="0"
                  type="number"
                  className="h-14 rounded-xl text-base"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                  Superficie (m²)
                </label>
                <Input
                  value={superficie}
                  onChange={(e) => setSuperficie(e.target.value)}
                  placeholder="0"
                  type="number"
                  className="h-14 rounded-xl text-base"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                Disposición
              </label>
              <div className="grid grid-cols-3 gap-3">
                {disposiciones.map((disp) => (
                  <button
                    key={disp}
                    onClick={() => setDisposicion(disp)}
                    className={cn(
                      "py-4 px-6 rounded-2xl border-2 text-sm font-semibold transition-all",
                      disposicion === disp
                        ? "border-primary bg-accent text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {disp.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      // Step 6: Precio y características
      case 6:
        return (
          <div className="max-w-xl mx-auto space-y-8">
            <h1 className="font-display text-3xl font-bold">
              Precio y características
            </h1>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                  Precio mensual
                </label>
                <div className="flex gap-3">
                  <Input
                    value={precioMensual}
                    onChange={(e) => setPrecioMensual(e.target.value)}
                    placeholder={moneda === "USD" ? "$ USD" : "$ ARS"}
                    className="h-14 rounded-xl text-base flex-1"
                  />
                  <div className="flex items-center gap-2 p-2 rounded-xl border border-border bg-secondary/30">
                    <button
                      onClick={() => setMoneda("USD")}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                        moneda === "USD"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      USD
                    </button>
                    <button
                      onClick={() => setMoneda("ARS")}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                        moneda === "ARS"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      ARS
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border">
                <span className="font-medium">¿Expensas incluidas?</span>
                <Switch
                  checked={expensasIncluidas}
                  onCheckedChange={(checked) => {
                    setExpensasIncluidas(checked);
                    if (checked) setExpensas("");
                  }}
                />
              </div>

              {!expensasIncluidas && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                    Expensas
                  </label>
                  <Input
                    value={expensas}
                    onChange={(e) => setExpensas(e.target.value)}
                    placeholder="$ ARS"
                    className="h-14 rounded-xl text-base"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-2xl border border-border">
                <span className="font-medium">¿Está amoblado?</span>
                <Switch checked={amoblado} onCheckedChange={setAmoblado} />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                Servicios y características
              </label>
              <div className="flex flex-wrap gap-2">
                {curatedTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTagId(tag.id)}
                    className={cn(
                      "px-4 py-2.5 rounded-full border text-sm font-medium transition-all",
                      selectedTagIds.includes(tag.id)
                        ? "border-primary bg-accent text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl border border-border">
              <span className="font-medium">Estoy dispuesto a negociar el precio</span>
              <Switch
                checked={dispuestoNegociar}
                onCheckedChange={setDispuestoNegociar}
              />
            </div>
          </div>
        );

      // Step 7: Fotos y videos (placeholder)
      case 7:
        return (
          <div className="max-w-xl mx-auto space-y-6">
            <h1 className="font-display text-3xl font-bold text-center">
              Fotos y videos
            </h1>

            <div className="w-full aspect-[4/3] rounded-3xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center bg-secondary/20">
              <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-display font-semibold uppercase tracking-wider text-sm mb-1">
                Subí fotos y videos
              </p>
              <p className="text-sm text-muted-foreground">
                Arrastrá tus archivos acá
              </p>
            </div>
          </div>
        );

      // Step 8: Logística y disponibilidad
      case 8:
        return (
          <div className="max-w-xl mx-auto space-y-8">
            <h1 className="font-display text-3xl font-bold">
              Logística y disponibilidad
            </h1>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                ¿Cuándo se puede alquilar?
              </label>
              <div className="relative">
                <Input
                  type="date"
                  value={fechaDisponible}
                  onChange={(e) => setFechaDisponible(e.target.value)}
                  className="h-14 rounded-xl text-base pr-12"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                Coordinación de llaves
              </label>
              <Input
                value={coordinacionLlaves}
                onChange={(e) => setCoordinacionLlaves(e.target.value)}
                placeholder="Las tengo yo"
                className="h-14 rounded-xl text-base"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                Disponibilidad de visitas
              </label>
              <div className="space-y-2">
                {weekDays.map((day) => (
                  <div
                    key={day.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border"
                  >
                    <Checkbox
                      id={day.id}
                      checked={diasVisita.includes(day.id)}
                      onCheckedChange={() => toggleDiaVisita(day.id)}
                      className="h-5 w-5"
                    />
                    <label
                      htmlFor={day.id}
                      className="font-medium flex-1 cursor-pointer"
                    >
                      {day.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={horariosVisita[day.id]?.start || "09:00"}
                        onValueChange={(value) => updateHorario(day.id, "start", value)}
                        disabled={!diasVisita.includes(day.id)}
                      >
                        <SelectTrigger className="w-24 h-9 rounded-lg text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background max-h-48">
                          {hours.map((hour) => (
                            <SelectItem key={`${day.id}-start-${hour}`} value={hour}>
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-muted-foreground">—</span>
                      <Select
                        value={horariosVisita[day.id]?.end || "18:00"}
                        onValueChange={(value) => updateHorario(day.id, "end", value)}
                        disabled={!diasVisita.includes(day.id)}
                      >
                        <SelectTrigger className="w-24 h-9 rounded-lg text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background max-h-48">
                          {hours.map((hour) => (
                            <SelectItem key={`${day.id}-end-${hour}`} value={hour}>
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      // Step 9: Resumen
      case 9:
        return (
          <div className="max-w-xl mx-auto space-y-6">
            <h1 className="font-display text-3xl font-bold">
              Revisá tu publicación
            </h1>
            <p className="text-muted-foreground">
              Verificá que toda la información sea correcta antes de publicar.
            </p>

            {/* Tipo de propiedad */}
            <SummarySection title="Tipo de propiedad" onEdit={() => setCurrentStep(2)}>
              <p className="font-medium">{getPropertyTypeLabel()}</p>
            </SummarySection>

            {/* Ubicación */}
            <SummarySection title="Ubicación" onEdit={() => setCurrentStep(3)}>
              {selectedLocation && (
                <p className="text-sm">
                  <span className="font-medium">{selectedLocation.name}</span>
                  {selectedLocation.display && (
                    <span className="text-muted-foreground"> — {selectedLocation.display}</span>
                  )}
                </p>
              )}
              {address && <p className="text-sm text-muted-foreground">{address}</p>}
              {piso && <p className="text-sm text-muted-foreground">Piso {piso}{depto ? `, Depto ${depto}` : ""}</p>}
            </SummarySection>

            {/* Detalles */}
            <SummarySection title="Detalles del espacio" onEdit={() => setCurrentStep(5)}>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>{ambientes} ambientes</span>
                <span>{dormitorios} dormitorios</span>
                <span>{banos} baños</span>
                <span>{cocheras} cocheras</span>
                {antiguedad && <span>{antiguedad} años</span>}
                {superficie && <span>{superficie} m²</span>}
                <span>{disposicion}</span>
              </div>
            </SummarySection>

            {/* Precio */}
            <SummarySection title="Precio y características" onEdit={() => setCurrentStep(6)}>
              <div className="space-y-1 text-sm">
                {precioMensual && (
                  <p className="font-medium">
                    {moneda} {Number(precioMensual).toLocaleString()}
                  </p>
                )}
                <p className="text-muted-foreground">
                  {expensasIncluidas
                    ? "Expensas incluidas"
                    : expensas
                      ? `Expensas: ARS ${Number(expensas).toLocaleString()}`
                      : "Sin expensas informadas"}
                </p>
                {amoblado && <p className="text-muted-foreground">Amoblado</p>}
                {selectedTagIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedTagIds.map((tagId) => {
                      const tag = curatedTags.find((t) => t.id === tagId);
                      return tag ? (
                        <span key={tagId} className="px-2 py-0.5 rounded-full bg-accent text-xs font-medium text-primary">
                          {tag.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </SummarySection>

            {/* Logística */}
            <SummarySection title="Logística y disponibilidad" onEdit={() => setCurrentStep(8)}>
              <div className="space-y-1 text-sm">
                {fechaDisponible && (
                  <p>Disponible desde: {new Date(fechaDisponible + "T12:00:00").toLocaleDateString("es-AR")}</p>
                )}
                {coordinacionLlaves && <p>Llaves: {coordinacionLlaves}</p>}
                {diasVisita.length > 0 && (
                  <p className="text-muted-foreground">
                    Visitas: {diasVisita.map((d) => weekDays.find((w) => w.id === d)?.label).join(", ")}
                  </p>
                )}
              </div>
            </SummarySection>

            {submitError && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {submitError}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <img src={mobLogo} alt="MOB" className="h-6" />
          </div>
          <button
            onClick={handleCancel}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
          >
            Cancelar
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container py-12">{renderStep()}</main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container flex items-center justify-between h-20">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={cn(
              "text-sm font-semibold uppercase tracking-wider",
              currentStep === 1
                ? "text-muted-foreground/50 cursor-not-allowed"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Atrás
          </button>
          {currentStep === TOTAL_STEPS ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-full px-10 h-12"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Publicando...
                </>
              ) : (
                "Publicar propiedad"
              )}
            </Button>
          ) : (
            <Button onClick={handleNext} className="rounded-full px-10 h-12">
              Siguiente
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};

// Summary section component
function SummarySection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-2xl border border-border space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Pencil className="h-3 w-3" />
          Editar
        </button>
      </div>
      {children}
    </div>
  );
}

export default SubirPropiedad;
