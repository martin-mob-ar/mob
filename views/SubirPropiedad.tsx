"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLoadScript } from "@react-google-maps/api";
import {
  Calendar,
  Loader2,
  Pencil,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getGeometryFromPlace } from "@/lib/google-maps/places";
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
import PhotoUploader, { UploadedPhoto } from "@/components/PhotoUploader";
import PlanSelector, { PlanType } from "@/components/pricing/PlanSelector";

const mobLogo = "/assets/mob-logo-new.png";

const TOTAL_STEPS = 9;
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
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
];

const hours = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DraftData = Record<string, any> | null;

interface SubirPropiedadProps {
  userId: string;
  draftData?: DraftData;
}

const SubirPropiedad = ({ userId, draftData }: SubirPropiedadProps) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  // Draft tracking
  const [draftPropertyId, setDraftPropertyId] = useState<number | null>(null);

  // Step 2: Tipo de propiedad
  const [typeId, setTypeId] = useState<number | null>(null);

  // Step 2: Ubicación
  const [locationId, setLocationId] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [placeSelected, setPlaceSelected] = useState(false);
  const [address, setAddress] = useState("");
  const [geoLat, setGeoLat] = useState("");
  const [geoLong, setGeoLong] = useState("");
  const [piso, setPiso] = useState("");
  const [depto, setDepto] = useState("");

  // Step 3: Map
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  // Step 4: Detalles
  const [ambientes, setAmbientes] = useState(0);
  const [dormitorios, setDormitorios] = useState(0);
  const [banos, setBanos] = useState(0);
  const [toilettes, setToilettes] = useState(0);
  const [cocheras, setCocheras] = useState(0);
  const [antiguedad, setAntiguedad] = useState("");
  const [superficieCubierta, setSuperficieCubierta] = useState("");
  const [superficieTotal, setSuperficieTotal] = useState("");
  const [disposicion, setDisposicion] = useState("");

  // Step 5: Precio y características
  const [precioMensual, setPrecioMensual] = useState("");
  const [moneda, setMoneda] = useState<"ARS" | "USD">("ARS");
  const [expensas, setExpensas] = useState("");
  const [expensasIncluidas, setExpensasIncluidas] = useState(false);
  const [amoblado, setAmoblado] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [duracionContrato, setDuracionContrato] = useState<number | null>(12);
  const [customDuracion, setCustomDuracion] = useState("");
  const [showDuracionHint, setShowDuracionHint] = useState(false);
  const [ipcEnabled, setIpcEnabled] = useState(true);
  const [ipcPeriodo, setIpcPeriodo] = useState<string>("trimestral");

  // Step 6: Fotos y descripción
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [descripcion, setDescripcion] = useState("");
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  // Step 7: Logística
  const [fechaDisponible, setFechaDisponible] = useState("");
  const [diasVisita, setDiasVisita] = useState<string[]>(["lunes", "miercoles", "jueves"]);
  const [horariosVisita, setHorariosVisita] = useState<Record<string, { start: string; end: string }>>({
    lunes: { start: "09:00", end: "18:00" },
    martes: { start: "09:00", end: "18:00" },
    miercoles: { start: "09:00", end: "18:00" },
    jueves: { start: "09:00", end: "18:00" },
    viernes: { start: "09:00", end: "18:00" },
    sabado: { start: "10:00", end: "14:00" },
    domingo: { start: "10:00", end: "14:00" },
  });

  // Step 8: Plan
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

  // Google Maps
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const progress = (currentStep / TOTAL_STEPS) * 100;

  // Restore draft data on mount
  useEffect(() => {
    if (!draftData) return;
    setDraftPropertyId(draftData.id);
    setCurrentStep(draftData.draft_step ?? 2);
    if (draftData.type_id) setTypeId(draftData.type_id);
    if (draftData.address) {
      setAddress(draftData.address);
      setPlaceSelected(true);
    }
    if (draftData.geo_lat) setGeoLat(String(draftData.geo_lat));
    if (draftData.geo_long) setGeoLong(String(draftData.geo_long));
    if (draftData.location_id) setLocationId(draftData.location_id);
    if (draftData.floor) setPiso(String(draftData.floor));
    if (draftData.apartment_door) setDepto(String(draftData.apartment_door));
    if (draftData.room_amount != null) setAmbientes(draftData.room_amount);
    if (draftData.bathroom_amount != null) setBanos(draftData.bathroom_amount);
    if (draftData.toilet_amount != null) setToilettes(draftData.toilet_amount);
    if (draftData.suite_amount != null) setDormitorios(draftData.suite_amount);
    if (draftData.parking_lot_amount != null) setCocheras(draftData.parking_lot_amount);
    if (draftData.roofed_surface) setSuperficieCubierta(String(draftData.roofed_surface));
    if (draftData.total_surface) setSuperficieTotal(String(draftData.total_surface));
    if (draftData.age != null) setAntiguedad(String(draftData.age));
    if (draftData.disposition) setDisposicion(draftData.disposition);
    if (draftData.available_date) setFechaDisponible(draftData.available_date);
    if (draftData.visit_days) setDiasVisita(draftData.visit_days);
    if (draftData.description) setDescripcion(draftData.description);

    // Restore extra_attributes.draft
    const extra = draftData.extra_attributes?.draft ?? {};
    if (extra.amoblado != null) setAmoblado(extra.amoblado);
    if (extra.precioMensual) setPrecioMensual(extra.precioMensual);
    if (extra.moneda) setMoneda(extra.moneda);
    if (extra.expensas) setExpensas(extra.expensas);
    if (extra.expensasIncluidas != null) setExpensasIncluidas(extra.expensasIncluidas);
    if (extra.duracionContrato != null) setDuracionContrato(extra.duracionContrato);
    if (extra.customDuracion) setCustomDuracion(extra.customDuracion);
    if (extra.ipcEnabled != null) setIpcEnabled(extra.ipcEnabled);
    if (extra.ipcPeriodo) setIpcPeriodo(extra.ipcPeriodo);
    if (extra.selectedPlan) setSelectedPlan(extra.selectedPlan);

    // Restore photos
    if (draftData.tokko_property_photo?.length) {
      setUploadedPhotos(
        draftData.tokko_property_photo.map((p: { image: string; storage_path: string; order: number; is_front_cover: boolean }) => ({
          publicUrl: p.image,
          storagePath: p.storage_path,
          order: p.order,
          isCover: p.is_front_cover,
        }))
      );
    }

    // Restore tags
    if (draftData.tokko_property_property_tag?.length) {
      setSelectedTagIds(draftData.tokko_property_property_tag.map((t: { tag_id: number }) => t.tag_id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset validation errors when step changes
  useEffect(() => {
    setShowErrors(false);
  }, [currentStep]);

  // Default IPC based on currency: ON for ARS, OFF for USD
  useEffect(() => {
    setIpcEnabled(moneda === "ARS");
  }, [moneda]);

  // Initialize/update map on Step 3 (map confirmation)
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
          draggable: false,
          title: address || "Ubicación",
        });
        markerRef.current = marker;
      }
    }
  }, [currentStep, isLoaded, geoLat, geoLong, address]);

  const handleLocationSelect = (location: LocationResult) => {
    setSelectedLocation(location);
    setLocationId(location.id);
    setShowErrors(false);
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

    const components = place.address_components || [];
    const route = components.find((c) => c.types.includes("route"))?.long_name || "";
    const streetNumber = components.find((c) => c.types.includes("street_number"))?.long_name || "";
    const streetAddress = streetNumber ? `${route} ${streetNumber}` : route;

    setAddress(streetAddress || place.name || "");
    setGeoLat(String(geo.lat));
    setGeoLong(String(geo.lng));
    setPlaceSelected(true);
    setShowErrors(false);
  }, []);

  const getTomorrowDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split("T")[0];
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 2:
        if (!typeId || !selectedLocation || !address || !placeSelected) return false;
        if ((typeId === 2 || typeId === 13) && (!piso || !depto)) return false;
        return true;
      case 3:
        return !!geoLat && !!geoLong;
      case 4:
        if (!antiguedad || !superficieCubierta || !superficieTotal) return false;
        if (Number(superficieTotal) < Number(superficieCubierta)) return false;
        return true;
      case 5:
        return !!precioMensual && (expensasIncluidas || !!expensas);
      case 6: {
        if (uploadedPhotos.length < 5) return false;
        const urls = uploadedPhotos.map((p) => p.publicUrl);
        return new Set(urls).size === urls.length;
      }
      case 7: {
        if (!fechaDisponible || diasVisita.length === 0) return false;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return new Date(fechaDisponible) >= tomorrow;
      }
      case 8:
        return !!selectedPlan;
      default:
        return true;
    }
  };

  // Build visit hours array for API
  const buildVisitHoursArr = () =>
    diasVisita.map((dia) => {
      const h = horariosVisita[dia];
      return `${dia} ${h?.start || "09:00"}-${h?.end || "18:00"}`;
    });

  const saveDraft = useCallback(async (nextStep: number) => {
    try {
      const res = await fetch("/api/properties/save-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: userId,
          draftId: draftPropertyId,
          draft_step: nextStep,
          type_id: typeId,
          address: address || null,
          geo_lat: geoLat || null,
          geo_long: geoLong || null,
          location_id: locationId,
          floor: piso || null,
          apartment_door: depto || null,
          room_amount: ambientes,
          bathroom_amount: banos,
          toilet_amount: toilettes,
          suite_amount: dormitorios,
          parking_lot_amount: cocheras,
          roofed_surface: superficieCubierta || null,
          total_surface: superficieTotal || null,
          age: antiguedad ? parseInt(antiguedad) : null,
          disposition: disposicion || null,
          available_date: fechaDisponible || null,
          visit_days: diasVisita,
          visit_hours: buildVisitHoursArr(),
          description: descripcion.trim() || null,
          tagIds: selectedTagIds,
          photos: uploadedPhotos,
          draftExtra: {
            amoblado,
            precioMensual,
            moneda,
            expensas,
            expensasIncluidas,
            duracionContrato,
            customDuracion,
            ipcEnabled,
            ipcPeriodo,
            selectedPlan,
          },
        }),
      });
      if (res.ok) {
        const { id } = await res.json();
        if (!draftPropertyId) setDraftPropertyId(id);
      }
    } catch {
      // Non-blocking — draft save failure should not interrupt user flow
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userId, draftPropertyId, typeId, address, geoLat, geoLong, locationId,
    piso, depto, ambientes, banos, toilettes, dormitorios, cocheras,
    superficieCubierta, superficieTotal, antiguedad, disposicion,
    fechaDisponible, diasVisita, horariosVisita, descripcion, selectedTagIds,
    uploadedPhotos, amoblado, precioMensual, moneda, expensas, expensasIncluidas,
    duracionContrato, customDuracion, ipcEnabled, ipcPeriodo, selectedPlan,
  ]);

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS) {
      if (validateStep(currentStep)) {
        setShowErrors(false);
        const nextStep = currentStep + 1;
        if (currentStep >= 2) await saveDraft(nextStep);
        setCurrentStep(nextStep);
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

  const handleSaveAndExit = async () => {
    if (currentStep >= 2) await saveDraft(currentStep);
    router.push("/gestion");
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

  const handleGenerateDescription = async () => {
    setIsGeneratingDesc(true);
    try {
      const tagLabels = selectedTagIds
        .map((id) => ALL_TAGS.find((t) => t.id === id)?.label)
        .filter(Boolean) as string[];

      const res = await fetch("/api/ai/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyType: propertyTypes.find((t) => t.id === typeId)?.label || "",
          location: selectedLocation
            ? `${selectedLocation.name}${selectedLocation.display ? `, ${selectedLocation.display}` : ""}`
            : "",
          address,
          piso,
          depto,
          ambientes,
          dormitorios,
          banos,
          toilettes,
          cocheras,
          superficieCubierta,
          superficieTotal,
          antiguedad,
          disposicion,
          amoblado,
          tags: tagLabels,
        }),
      });

      if (!res.ok) {
        toast.error("No se pudo generar la descripción. Intentá de nuevo.");
        return;
      }

      const { description } = await res.json();
      if (description) {
        setDescripcion(description);
      }
    } catch {
      toast.error("No se pudo generar la descripción. Intentá de nuevo.");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const propertyTypeLabel = propertyTypes.find((t) => t.id === typeId)?.label || "";
      const locationName = selectedLocation?.name || "";
      const autoTitle = `${propertyTypeLabel} en ${locationName}`.trim();

      const visitHoursArr = buildVisitHoursArr();

      const body = {
        profile_id: userId,
        draftId: draftPropertyId,
        type_id: typeId,
        address: address || null,
        geo_lat: geoLat || null,
        geo_long: geoLong || null,
        location_id: locationId,
        room_amount: ambientes,
        suite_amount: dormitorios,
        bathroom_amount: banos,
        toilet_amount: toilettes,
        parking_lot_amount: cocheras,
        roofed_surface: superficieCubierta ? String(superficieCubierta) : null,
        total_surface: superficieTotal ? String(superficieTotal) : null,
        unroofed_surface:
          superficieTotal && superficieCubierta
            ? String(Math.max(0, Number(superficieTotal) - Number(superficieCubierta)))
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
        photos: uploadedPhotos,
        publication_title: autoTitle,
        description: descripcion.trim() || null,
        available_date: fechaDisponible || null,
        visit_days: diasVisita,
        visit_hours: visitHoursArr,
        selectedPlan,
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

      router.push(`/propiedad/${result.id}`);
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
    <div className="flex items-center justify-between p-4 rounded-xl border border-border">
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
      // Step 1: Intro
      case 1:
        return (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-[3.25rem] md:leading-[1.15] font-bold leading-tight mb-4 sm:mb-6">
                Publicar tu propiedad es fácil
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg">
                Te guiamos paso a paso para que tu inmueble luzca increíble y llegue a los mejores inquilinos verificados.
              </p>
            </div>
            <div className="divide-y divide-border">
              {[
                {
                  num: "1",
                  title: "Contanos acerca de tu propiedad",
                  desc: "Compartí la ubicación, tipo y características principales.",
                  img: "/assets/subir-propiedad-1.png",
                },
                {
                  num: "2",
                  title: "Hacé que se destaque",
                  desc: "Subí fotos y elegí el plan que mejor se adapte a vos.",
                  img: "/assets/subir-propiedad-2.png",
                },
                {
                  num: "3",
                  title: "Terminá todo y publicá tu anuncio",
                  desc: "Revisá los detalles y publicá en minutos.",
                  img: "/assets/subir-propiedad-3.png",
                },
              ].map((item) => (
                <div key={item.num} className="flex items-center gap-5 py-8 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <span className="font-display font-bold text-lg mt-0.5">{item.num}</span>
                    <div>
                      <p className="font-semibold text-base sm:text-lg">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  </div>
                  <img
                    src={item.img}
                    alt=""
                    className="w-28 h-28 sm:w-32 sm:h-32 object-contain shrink-0"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      // Step 2: Barrio + Calle + Tipo
      case 2:
        return (
          <div className="max-w-xl mx-auto space-y-5 sm:space-y-8">
            <div className="space-y-4">
              <h1 className="font-display text-xl sm:text-3xl font-bold">
                ¿Qué tipo de propiedad es?
              </h1>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {propertyTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => { setTypeId(type.id); setShowErrors(false); }}
                    className={cn(
                      "py-3 sm:py-4 px-1.5 sm:px-6 rounded-xl border-2 text-[11px] sm:text-sm font-semibold transition-all truncate min-w-0",
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
              <div className="space-y-6 pt-5 sm:pt-8">
                <h2 className="font-display text-xl sm:text-2xl font-bold">
                  ¿En qué barrio está?
                </h2>

                <div>
                  <LocationSearchInput
                    selectedLocation={selectedLocation}
                    onSelect={handleLocationSelect}
                    onClear={handleLocationClear}
                    placeholder="Ejemplo: Palermo, Recoleta, Belgrano…"
                  />
                  {showErrors && !selectedLocation && (
                    <p className="text-sm text-red-500 mt-1">Seleccioná un barrio o localidad</p>
                  )}
                </div>

                <AnimateHeight show={!!selectedLocation}>
                  <div className="pt-1 space-y-2">
                    <h2 className="font-display text-xl sm:text-2xl font-bold">
                      ¿En qué calle está?
                    </h2>
                    <input
                      type="text"
                      defaultValue={address}
                      placeholder="Honduras 5734"
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
                        if ((el as HTMLInputElement & { _autocompleteAttached?: boolean })._autocompleteAttached) return;
                        (el as HTMLInputElement & { _autocompleteAttached?: boolean })._autocompleteAttached = true;
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
                      <p className="text-sm text-red-500">
                        Seleccioná una dirección de las sugerencias de Google Maps
                      </p>
                    )}
                    {showErrors && !address && (
                      <p className="text-sm text-red-500">Ingresá una dirección</p>
                    )}
                  </div>
                </AnimateHeight>

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
                          if (val === "" || /^\d+$/.test(val)) setPiso(val);
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
                          if (val === "" || /^[A-Za-z]+$/.test(val)) setDepto(val.toUpperCase());
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
            <h1 className="font-display text-xl sm:text-3xl font-bold">
              Detalles del espacio
            </h1>

            <div className="space-y-3">
              <CounterInput label="Ambientes" value={ambientes} onChange={setAmbientes} />
              <CounterInput label="Dormitorios" value={dormitorios} onChange={setDormitorios} />
              <CounterInput label="Baños" value={banos} onChange={setBanos} />
              <CounterInput label="Toilettes" value={toilettes} onChange={setToilettes} />
              <CounterInput label="Cocheras" value={cocheras} onChange={setCocheras} />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  className={cn(
                    "h-14 rounded-xl text-base",
                    showErrors && (!superficieTotal || (superficieCubierta && Number(superficieTotal) < Number(superficieCubierta))) && "border-red-500"
                  )}
                />
              </div>
            </div>
            {showErrors && superficieTotal && superficieCubierta && Number(superficieTotal) < Number(superficieCubierta) && (
              <p className="text-sm text-red-500">La superficie total debe ser igual o mayor a la superficie cubierta</p>
            )}
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
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                Disposición
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {disposiciones.map((disp) => (
                  <button
                    key={disp}
                    onClick={() => setDisposicion(disp)}
                    className={cn(
                      "py-4 px-2 rounded-xl border-2 text-xs font-semibold transition-all text-center",
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
          <div className="max-w-xl mx-auto space-y-5 sm:space-y-8">
            <h1 className="font-display text-xl sm:text-3xl font-bold">
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
                      "px-3 py-2 rounded-xl text-sm font-semibold transition-all",
                      moneda === "ARS" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    ARS
                  </button>
                  <button
                    onClick={() => setMoneda("USD")}
                    className={cn(
                      "px-3 py-2 rounded-xl text-sm font-semibold transition-all",
                      moneda === "USD" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    USD
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border">
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

              <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                <span className="font-medium">¿Está amoblado?</span>
                <Switch checked={amoblado} onCheckedChange={setAmoblado} />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                Duración de contrato (meses)
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { months: 12, label: "12 meses" },
                  { months: 24, label: "24 meses" },
                  { months: 36, label: "36 meses" },
                ].map((opt) => (
                  <button
                    key={opt.months}
                    onClick={() => {
                      setDuracionContrato(opt.months);
                      setCustomDuracion("");
                      setShowDuracionHint(false);
                    }}
                    className={cn(
                      "py-4 px-4 rounded-xl border-2 text-sm font-semibold transition-all",
                      duracionContrato === opt.months && !customDuracion
                        ? "border-primary bg-accent text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {opt.label.toUpperCase()}
                  </button>
                ))}
                <Input
                  type="number"
                  inputMode="numeric"
                  min={6}
                  placeholder="Otro"
                  value={customDuracion}
                  onFocus={() => {
                    setDuracionContrato(null);
                    setShowDuracionHint(true);
                  }}
                  onBlur={() => setShowDuracionHint(false)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomDuracion(val);
                    if (val) {
                      const num = Math.max(6, Number(val));
                      setDuracionContrato(num);
                    } else {
                      setDuracionContrato(null);
                    }
                  }}
                  className={cn(
                    "h-full rounded-xl border-2 text-sm text-center font-semibold transition-all focus-visible:ring-0 focus-visible:ring-offset-0",
                    customDuracion
                      ? "border-primary bg-accent text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                />
              </div>
              <AnimateHeight show={showDuracionHint}>
                <p className="text-xs text-muted-foreground mt-2">Mínimo 6 meses</p>
              </AnimateHeight>
            </div>

            <div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border">
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
                        "py-3 px-3 rounded-xl border-2 text-sm font-semibold transition-all capitalize",
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

            {TAG_SECTIONS.map((section) => {
              const title =
                section.title === "Amenities del edificio" && typeId === 3
                  ? "Amenities"
                  : section.title;
              return (
                <div key={section.title}>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                    {title}
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
              );
            })}
          </div>
        );

      // Step 6: Fotos y descripción
      case 6:
        return (
          <div className="max-w-xl mx-auto space-y-8">
            <PhotoUploader
              photos={uploadedPhotos}
              onChange={setUploadedPhotos}
              propertyId={draftPropertyId ?? undefined}
            />
            {showErrors && uploadedPhotos.length < 5 && (
              <p className="text-sm text-red-500">Necesitás al menos 5 fotos</p>
            )}
            {showErrors && uploadedPhotos.length >= 5 && (() => {
              const urls = uploadedPhotos.map((p) => p.publicUrl);
              return new Set(urls).size !== urls.length;
            })() && (
              <p className="text-sm text-red-500">Hay fotos duplicadas</p>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Descripción (opcional)
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateDescription}
                  disabled={isGeneratingDesc}
                  className="gap-1.5 text-xs"
                >
                  {isGeneratingDesc ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Crear descripción con IA
                    </>
                  )}
                </Button>
              </div>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Contá lo mejor de tu propiedad: luminosidad, vistas, estado, cercanía a transporte..."
                rows={5}
                className="flex w-full rounded-xl border border-border bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {descripcion.length > 0 ? `${descripcion.length} caracteres` : "Una buena descripción ayuda a conseguir más consultas"}
              </p>
            </div>
          </div>
        );

      // Step 7: Logística y disponibilidad
      case 7:
        return (
          <div className="max-w-xl mx-auto space-y-5 sm:space-y-8">
            <h1 className="font-display text-xl sm:text-3xl font-bold">
              Logística y disponibilidad
            </h1>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                ¿Cuándo está disponible?
              </label>
              <div className="relative">
                <Input
                  type="date"
                  min={getTomorrowDateString()}
                  max="9999-12-31"
                  value={fechaDisponible}
                  onChange={(e) => setFechaDisponible(e.target.value)}
                  className={cn("h-14 rounded-xl text-base pr-12", showErrors && !fechaDisponible && "border-red-500")}
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
              {showErrors && fechaDisponible && new Date(fechaDisponible) < new Date(getTomorrowDateString()) && (
                <p className="text-sm text-red-500 mt-1">La fecha debe ser a partir de mañana</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                ¿Cuándo se puede visitar?
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
                        <SelectTrigger className="w-24 h-9 rounded-xl text-sm">
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
                        <SelectTrigger className="w-24 h-9 rounded-xl text-sm">
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
                <p className="text-sm text-red-500 mt-1">Seleccioná al menos un día de visita</p>
              )}
            </div>
          </div>
        );

      // Step 8: Elegí tu plan
      case 8:
        return (
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="font-display text-xl sm:text-3xl font-bold">Elegí tu plan</h1>
              <p className="text-muted-foreground mt-2">
                Seleccioná el nivel de acompañamiento que mejor se adapte a tus necesidades.
              </p>
            </div>
            {showErrors && !selectedPlan && (
              <p className="text-sm text-red-500">Seleccioná un plan para continuar</p>
            )}
            <PlanSelector selectedPlan={selectedPlan} onSelectPlan={setSelectedPlan} />
          </div>
        );

      // Step 9: Resumen
      case 9:
        return (
          <div className="max-w-xl mx-auto space-y-6">
            <h1 className="font-display text-xl sm:text-3xl font-bold">
              Revisá tu publicación
            </h1>
            <p className="text-muted-foreground">
              Verificá que toda la información sea correcta antes de publicar.
            </p>

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

            <SummarySection title="Detalles de la propiedad" onEdit={() => setCurrentStep(4)}>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>{ambientes} ambientes</span>
                <span>{dormitorios} dormitorios</span>
                <span>{banos} baños</span>
                <span>{toilettes} toilettes</span>
                <span>{cocheras} cocheras</span>
                {antiguedad && <span>{antiguedad} años</span>}
                {superficieCubierta && <span>{superficieCubierta} m² cubierta</span>}
                {superficieTotal && <span>{superficieTotal} m² total</span>}
                {disposicion && <span>{disposicion}</span>}
              </div>
            </SummarySection>

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
                <p className="text-muted-foreground">Contrato: {duracionContrato} meses</p>
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

            <SummarySection title="Fotos y descripción" onEdit={() => setCurrentStep(6)}>
              {uploadedPhotos.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{uploadedPhotos.length} {uploadedPhotos.length === 1 ? "foto" : "fotos"}</p>
                  <div className="flex gap-2 overflow-x-auto">
                    {uploadedPhotos.slice(0, 5).map((photo, i) => (
                      <div key={photo.storagePath} className={cn("relative shrink-0 w-16 h-12 rounded-xl overflow-hidden border", photo.isCover ? "border-primary" : "border-border")}>
                        <img src={photo.publicUrl} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {uploadedPhotos.length > 5 && (
                      <div className="shrink-0 w-16 h-12 rounded-xl bg-secondary flex items-center justify-center">
                        <span className="text-xs font-medium text-muted-foreground">+{uploadedPhotos.length - 5}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin fotos</p>
              )}
              {descripcion.trim() ? (
                <p className="text-sm text-muted-foreground line-clamp-3 mt-2">{descripcion}</p>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">Sin descripción</p>
              )}
            </SummarySection>

            <SummarySection title="Logística y disponibilidad" onEdit={() => setCurrentStep(7)}>
              <div className="space-y-1 text-sm">
                {fechaDisponible && (
                  <p>Disponible desde: {new Date(fechaDisponible + "T12:00:00").toLocaleDateString("es-AR")}</p>
                )}
                {diasVisita.length > 0 && (
                  <p className="text-muted-foreground">
                    Visitas: {diasVisita.map((d) => weekDays.find((w) => w.id === d)?.label).join(", ")}
                  </p>
                )}
              </div>
            </SummarySection>

            <SummarySection title="Plan elegido" onEdit={() => setCurrentStep(8)}>
              {selectedPlan ? (
                <p className="font-medium capitalize">{selectedPlan === "acompanado" ? "Acompañado" : selectedPlan === "experiencia" ? "Experiencia mob" : "Básico"}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No seleccionado</p>
              )}
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
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={cn(
                "p-1.5 rounded-full transition-colors",
                currentStep === 1
                  ? "text-muted-foreground/30 cursor-not-allowed"
                  : "text-muted-foreground hover:bg-secondary"
              )}
              aria-label="Atrás"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={() => router.push("/")}>
              <img src={mobLogo} alt="MOB" className="h-6" />
            </button>
          </div>
          <button
            onClick={handleSaveAndExit}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Guardar y salir
          </button>
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      {/* Content — scrollable area between sticky header and footer */}
      <main className="flex-1 overflow-y-auto">
        <div className={cn(
          "container py-6 sm:py-12",
          currentStep === 1 ? "min-h-full flex flex-col justify-center" : "min-h-[700px]"
        )}>
          {renderStep()}
          {/* Map — always in DOM to prevent Google Maps orphaned elements.
              Hidden when not on step 3; visible only on map confirmation step. */}
          <div className={cn(currentStep !== 3 && "hidden", "max-w-xl mx-auto space-y-6")}>
            <div>
              <h1 className="font-display text-xl sm:text-3xl font-bold mb-2">
                Confirmá la ubicación exacta
              </h1>
            </div>
            <div
              ref={mapRef}
              className="w-full aspect-square max-w-lg mx-auto rounded-xl overflow-hidden border border-border"
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
        <div className="container flex items-center justify-end h-20">
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
              {currentStep === 1 ? "Comenzar" : "Siguiente"}
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
    <div className="p-4 rounded-xl border border-border space-y-2">
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
