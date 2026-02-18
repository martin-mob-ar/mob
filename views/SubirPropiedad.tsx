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
  Loader2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
import LocationSearchInput from "@/components/LocationSearchInput";
import { LocationResult } from "@/hooks/useLocationSearch";
import { AnimateHeight } from "@/components/ui/animate-height";
import { TAG_SECTIONS, ALL_TAGS } from "@/lib/constants/tags";

const mobLogo = "/assets/mob-logo-new.png";

const TOTAL_STEPS = 8;
const GOOGLE_MAPS_LIBRARIES: ("places" | "geometry")[] = ["places"];
const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 };

const propertyTypes = [
  { id: 2, label: "Departamento" },
  { id: 3, label: "Casa" },
  { id: 13, label: "PH" },
];

const disposiciones = ["Frente", "Contrafrente", "Lateral", "Interior"];

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


const SubirPropiedad = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  // Step 2: Tipo de propiedad
  const [typeId, setTypeId] = useState<number | null>(null);

  // Step 3: Ubicación
  const [locationId, setLocationId] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
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
  const [superficieCubierta, setSuperficieCubierta] = useState("");
  const [superficieTotal, setSuperficieTotal] = useState("");
  const [disposicion, setDisposicion] = useState("Frente");

  // Step 6: Precio y características
  const [precioMensual, setPrecioMensual] = useState("");
  const [moneda, setMoneda] = useState<"ARS" | "USD">("ARS");
  const [expensas, setExpensas] = useState("");
  const [expensasIncluidas, setExpensasIncluidas] = useState(false);
  const [amoblado, setAmoblado] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [duracionContrato, setDuracionContrato] = useState<number>(12);
  const [ipcEnabled, setIpcEnabled] = useState(true);
  const [ipcPeriodo, setIpcPeriodo] = useState<string>("trimestral");

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

  // Reset validation errors when step changes
  useEffect(() => {
    setShowErrors(false);
  }, [currentStep]);

  // Default IPC based on currency: ON for ARS, OFF for USD
  useEffect(() => {
    setIpcEnabled(moneda === "ARS");
  }, [moneda]);

  // Initialize/update map on Step 3 (map confirmation)
  // Map div is always in DOM (hidden when not step 3) to prevent Google Maps orphaned elements
  useEffect(() => {
    if (currentStep !== 3 || !isLoaded || !mapRef.current || typeof google === "undefined") return;

    const lat = geoLat ? parseFloat(geoLat) : DEFAULT_CENTER.lat;
    const lng = geoLong ? parseFloat(geoLong) : DEFAULT_CENTER.lng;
    const hasCoords = geoLat && geoLong;

    if (!mapInstanceRef.current) {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: hasCoords ? 16 : 10,
        disableDefaultUI: false,
      });
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setCenter({ lat, lng });
      mapInstanceRef.current.setZoom(hasCoords ? 16 : 10);
    }

    if (hasCoords) {
      if (markerRef.current) {
        markerRef.current.setPosition({ lat, lng });
      } else {
        const marker = new google.maps.Marker({
          map: mapInstanceRef.current,
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
    }
  }, [currentStep, isLoaded, geoLat, geoLong, address]);

  const handleLocationSelect = (location: LocationResult) => {
    setSelectedLocation(location);
    setLocationId(location.id);
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

    // Extract just street name + number from address_components
    const components = place.address_components || [];
    const route = components.find((c) => c.types.includes("route"))?.long_name || "";
    const streetNumber = components.find((c) => c.types.includes("street_number"))?.long_name || "";
    const streetAddress = streetNumber ? `${route} ${streetNumber}` : route;

    setAddress(streetAddress || place.name || "");
    setGeoLat(String(geo.lat));
    setGeoLong(String(geo.lng));
    setPlaceSelected(true);
  }, []);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 2:
        if (!typeId || !selectedLocation || !address || !placeSelected) return false;
        if ((typeId === 2 || typeId === 13) && (!piso || !depto)) return false;
        return true;
      case 3:
        return !!geoLat && !!geoLong;
      case 4:
        return !!antiguedad && !!superficieCubierta && !!superficieTotal;
      case 5:
        return !!precioMensual && (expensasIncluidas || !!expensas);
      case 6:
        return true; // No validation for photos/videos
      case 7:
        return !!fechaDisponible && !!coordinacionLlaves && diasVisita.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      if (validateStep(currentStep)) {
        setShowErrors(false);
        setCurrentStep(currentStep + 1);
      } else {
        setShowErrors(true);
      }
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
        suite_amount: dormitorios,
        bathroom_amount: banos,
        parking_lot_amount: cocheras,
        roofed_surface: superficieCubierta ? String(superficieCubierta) : null,
        total_surface: superficieTotal ? String(superficieTotal) : null,
        unroofed_surface: (superficieTotal && superficieCubierta)
          ? String(Math.max(0, (Number(superficieTotal) || 0) - (Number(superficieCubierta) || 0)))
          : null,
        age: antiguedad ? parseInt(antiguedad) : null,
        disposition: disposicion || null,
        floor: piso || null,
        apartment_door: depto || null,
        price: precioMensual ? Number(precioMensual) : null,
        currency: moneda,
        expenses: !expensasIncluidas && expensas ? Number(expensas) : null,
        duration_months: duracionContrato,
        ipc_adjustment: ipcEnabled ? ipcPeriodo : null,
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

      // Step 2: Tipo de propiedad + Ubicación
      case 2:
        return (
          <div className="max-w-xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="font-display text-xl sm:text-3xl font-bold">
                ¿Qué tipo de propiedad es?
              </h1>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {propertyTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setTypeId(type.id)}
                    className={cn(
                      "py-3 sm:py-4 px-2 sm:px-6 rounded-2xl border-2 text-xs sm:text-sm font-semibold transition-all",
                      typeId === type.id
                        ? "border-primary bg-accent text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {type.label.toUpperCase()}
                  </button>
                ))}
              </div>
              {showErrors && !typeId && (
                <p className="text-sm text-red-500">Seleccioná un tipo de propiedad</p>
              )}
            </div>

            <AnimateHeight show={!!typeId}>
              <div className="space-y-6 pt-8">
                <h2 className="font-display text-2xl font-bold">
                  ¿Dónde está ubicada?
                </h2>

                {/* Barrio search */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                    Barrio / Localidad
                  </label>
                  <LocationSearchInput
                    selectedLocation={selectedLocation}
                    onSelect={handleLocationSelect}
                    onClear={handleLocationClear}
                  />
                  {showErrors && !selectedLocation && (
                    <p className="text-sm text-red-500 mt-1">Seleccioná un barrio o localidad</p>
                  )}
                </div>

                {/* Google Address Autocomplete — only after barrio selected */}
                <AnimateHeight show={!!selectedLocation}>
                  <div className="pt-1">
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
                          fields: ["geometry", "formatted_address", "name", "address_components"],
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
                    {showErrors && !address && (
                      <p className="text-sm text-red-500 mt-2">Ingresá una dirección</p>
                    )}
                  </div>
                </AnimateHeight>

                {/* Piso / Depto — only for Departamento (2) or PH (13), after address selected */}
                <AnimateHeight show={!!selectedLocation && placeSelected && (typeId === 2 || typeId === 13)}>
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                        Piso
                      </label>
                      <Input
                        inputMode="numeric"
                        value={piso}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^\d+$/.test(val)) {
                            setPiso(val);
                          }
                        }}
                        placeholder="Ej: 4"
                        className={cn(
                          "h-14 rounded-xl border-2 text-base ring-0 ring-offset-0 focus-visible:ring-0 focus-visible:border-primary",
                          showErrors && !piso && "border-red-500"
                        )}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                        Depto
                      </label>
                      <Input
                        value={depto}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^[A-Za-z]+$/.test(val)) {
                            setDepto(val.toUpperCase());
                          }
                        }}
                        placeholder="Ej: B"
                        className={cn(
                          "h-14 rounded-xl border-2 text-base ring-0 ring-offset-0 focus-visible:ring-0 focus-visible:border-primary",
                          showErrors && !depto && "border-red-500"
                        )}
                      />
                    </div>
                  </div>
                </AnimateHeight>
              </div>
            </AnimateHeight>
          </div>
        );

      // Step 4: Detalles del espacio
      case 4:
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
                  className={cn("h-14 rounded-xl text-base", showErrors && !antiguedad && "border-red-500")}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                  Sup. cubierta (m²)
                </label>
                <Input
                  value={superficieCubierta}
                  onChange={(e) => setSuperficieCubierta(e.target.value)}
                  placeholder="0"
                  type="number"
                  className={cn("h-14 rounded-xl text-base", showErrors && !superficieCubierta && "border-red-500")}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                  Sup. total (m²)
                </label>
                <Input
                  value={superficieTotal}
                  onChange={(e) => setSuperficieTotal(e.target.value)}
                  placeholder="0"
                  type="number"
                  className={cn("h-14 rounded-xl text-base", showErrors && !superficieTotal && "border-red-500")}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                Disposición
              </label>
              <div className="grid grid-cols-2 gap-3">
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

      // Step 5: Precio y características
      case 5:
        return (
          <div className="max-w-xl mx-auto space-y-8">
            <h1 className="font-display text-3xl font-bold">
              Precio y características
            </h1>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                Precio mensual
              </label>
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <CurrencyInput
                    value={precioMensual}
                    onChange={setPrecioMensual}
                    currency={moneda}
                    placeholder={moneda === "USD" ? "US$ 0" : "AR$ 0"}
                    className={cn("h-14 rounded-xl text-base", showErrors && !precioMensual && "border-red-500")}
                  />
                </div>
                <div className="flex items-center p-1 rounded-xl border border-border bg-secondary/30 shrink-0">
                  <button
                    onClick={() => setMoneda("ARS")}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                      moneda === "ARS"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    ARS
                  </button>
                  <button
                    onClick={() => setMoneda("USD")}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                      moneda === "USD"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    USD
                  </button>
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

              <AnimateHeight show={!expensasIncluidas}>
                <div className="pt-1 pb-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                    Expensas
                  </label>
                  <CurrencyInput
                    value={expensas}
                    onChange={setExpensas}
                    currency="ARS"
                    placeholder="$ 0"
                    className={cn("h-14 rounded-xl text-base", showErrors && !expensasIncluidas && !expensas && "border-red-500")}
                  />
                </div>
              </AnimateHeight>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-border">
                <span className="font-medium">¿Está amoblado?</span>
                <Switch checked={amoblado} onCheckedChange={setAmoblado} />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                Duración de contrato
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { months: 12, label: "1 año" },
                  { months: 24, label: "2 años" },
                  { months: 36, label: "3 años" },
                ].map((opt) => (
                  <button
                    key={opt.months}
                    onClick={() => setDuracionContrato(opt.months)}
                    className={cn(
                      "py-4 px-6 rounded-2xl border-2 text-sm font-semibold transition-all",
                      duracionContrato === opt.months
                        ? "border-primary bg-accent text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {opt.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border">
                <span className="font-medium">Actualización por IPC (inflación)</span>
                <Switch checked={ipcEnabled} onCheckedChange={setIpcEnabled} />
              </div>

              <AnimateHeight show={ipcEnabled}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                  {["trimestral", "cuatrimestral", "semestral", "anual"].map((periodo) => (
                    <button
                      key={periodo}
                      onClick={() => setIpcPeriodo(periodo)}
                      className={cn(
                        "py-3 px-3 rounded-2xl border-2 text-sm font-semibold transition-all capitalize",
                        ipcPeriodo === periodo
                          ? "border-primary bg-accent text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {periodo}
                    </button>
                  ))}
                </div>
              </AnimateHeight>
            </div>

            {TAG_SECTIONS.map((section) => (
              <div key={section.title}>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                  {section.title}
                </label>
                <div className="flex flex-wrap gap-2">
                  {section.tags.map((tag) => (
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
            ))}
          </div>
        );

      // Step 6: Fotos y videos (placeholder)
      case 6:
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

      // Step 7: Logística y disponibilidad
      case 7:
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
                  className={cn("h-14 rounded-xl text-base pr-12", showErrors && !fechaDisponible && "border-red-500")}
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                Coordinación de llaves
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Las manejo yo",
                  "Entrega el portero",
                  "Quiero que las maneje mob",
                ].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCoordinacionLlaves(coordinacionLlaves === option ? "" : option)}
                    className={cn(
                      "py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all text-left",
                      coordinacionLlaves === option
                        ? "border-primary bg-accent text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {showErrors && !coordinacionLlaves && (
                <p className="text-sm text-red-500">Seleccioná una opción</p>
              )}
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
              {showErrors && diasVisita.length === 0 && (
                <p className="text-sm text-red-500">Seleccioná al menos un día de visita</p>
              )}
            </div>
          </div>
        );

      // Step 8: Resumen
      case 8:
        return (
          <div className="max-w-xl mx-auto space-y-6">
            <h1 className="font-display text-3xl font-bold">
              Revisá tu publicación
            </h1>
            <p className="text-muted-foreground">
              Verificá que toda la información sea correcta antes de publicar.
            </p>

            {/* Tipo de propiedad + Ubicación */}
            <SummarySection title="Tipo de propiedad y ubicación" onEdit={() => setCurrentStep(2)}>
              <p className="font-medium">{getPropertyTypeLabel()}</p>
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
            <SummarySection title="Detalles del espacio" onEdit={() => setCurrentStep(4)}>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>{ambientes} ambientes</span>
                <span>{dormitorios} dormitorios</span>
                <span>{banos} baños</span>
                <span>{cocheras} cocheras</span>
                {antiguedad && <span>{antiguedad} años</span>}
                {superficieCubierta && <span>{superficieCubierta} m² cubierta</span>}
                {superficieTotal && <span>{superficieTotal} m² total</span>}
                <span>{disposicion}</span>
              </div>
            </SummarySection>

            {/* Precio */}
            <SummarySection title="Precio y características" onEdit={() => setCurrentStep(5)}>
              <div className="space-y-1 text-sm">
                {precioMensual && (
                  <p className="font-medium">
                    {moneda === "USD" ? "US$" : "$"} {Number(precioMensual).toLocaleString("es-AR")} {moneda}
                  </p>
                )}
                <p className="text-muted-foreground">
                  {expensasIncluidas
                    ? "Expensas incluidas"
                    : expensas
                      ? `Expensas: $ ${Number(expensas).toLocaleString("es-AR")} ARS`
                      : "Sin expensas informadas"}
                </p>
                <p className="text-muted-foreground">
                  Contrato: {duracionContrato / 12} {duracionContrato === 12 ? "año" : "años"}
                </p>
                {ipcEnabled && (
                  <p className="text-muted-foreground capitalize">
                    Actualización IPC: {ipcPeriodo}
                  </p>
                )}
                {amoblado && <p className="text-muted-foreground">Amoblado</p>}
                {selectedTagIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedTagIds.map((tagId) => {
                      const tag = ALL_TAGS.find((t) => t.id === tagId);
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
            <SummarySection title="Logística y disponibilidad" onEdit={() => setCurrentStep(7)}>
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
    <div className="h-dvh bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-border">
        <div className="container flex items-center h-16">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-4 p-2 -ml-2 hover:bg-secondary rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <button onClick={() => router.push("/")} className="ml-2">
            <img src={mobLogo} alt="MOB" className="h-6" />
          </button>
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      {/* Content — scrollable area between sticky header and footer */}
      <main className="flex-1 overflow-y-auto">
        <div className="container py-12">
          {renderStep()}
          {/* Map — always in DOM to prevent Google Maps orphaned elements.
              Hidden when not on step 3; visible only on map confirmation step. */}
          <div className={cn(currentStep !== 3 && "hidden", "max-w-xl mx-auto space-y-6")}>
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
        </div>
      </main>

      {/* Footer — always pinned to bottom */}
      <footer className="shrink-0 border-t border-border">
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
