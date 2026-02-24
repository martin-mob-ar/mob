"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLoadScript } from "@react-google-maps/api";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Plus,
  Minus,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { getGeometryFromPlace } from "@/lib/google-maps/places";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const GOOGLE_MAPS_LIBRARIES: ("places" | "geometry")[] = ["places"];

const propertyTypes = [
  { id: 2, label: "Departamento" },
  { id: 3, label: "Casa" },
  { id: 13, label: "PH" },
];

const disposiciones = ["Frente", "Contrafrente", "Lateral", "Interior"];

interface PropertyEditFormProps {
  propertyId: number;
  property: any;
  operacion: any | null;
  photos: { id: number; image: string; original: string; thumb: string; order: number; is_front_cover: boolean }[];
  videos: { id: number; url: string; order: number }[];
  tagIds: number[];
  propertyTypes: { id: number; name: string }[];
  tags: { id: number; name: string; type: number }[];
  currentLocation: { id: number; name: string; parentName: string } | null;
  googleMapsApiKey: string;
}

export default function PropertyEditForm({
  propertyId,
  property,
  operacion,
  photos,
  videos,
  tagIds: initialTagIds,
  currentLocation,
  googleMapsApiKey,
}: PropertyEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // ─── Tipo y Precio ──────────────────────────────────────────────────
  const [typeId, setTypeId] = useState<number | null>(property.type_id);
  const [price, setPrice] = useState(
    operacion?.price != null ? String(Math.round(Number(operacion.price))) : ""
  );
  const [currency, setCurrency] = useState<"ARS" | "USD">(
    (operacion?.currency as "ARS" | "USD") || "ARS"
  );
  const [expenses, setExpenses] = useState(
    operacion?.expenses != null ? String(operacion.expenses) : ""
  );
  const [durationMonths, setDurationMonths] = useState<number | null>(
    operacion?.duration_months ?? null
  );
  const [showDurationHint, setShowDurationHint] = useState(false);
  const [ipcAdjustment, setIpcAdjustment] = useState<string | null>(
    operacion?.ipc_adjustment ?? null
  );
  const [fechaDisponible, setFechaDisponible] = useState(property.available_date || "");

  // ─── Ubicacion ──────────────────────────────────────────────────────
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(
    currentLocation
      ? { id: currentLocation.id, name: currentLocation.name, depth: 0, display: currentLocation.parentName }
      : null
  );
  const [locationId, setLocationId] = useState<number | null>(property.location_id);
  const [address, setAddress] = useState(property.address || "");
  const [geoLat, setGeoLat] = useState(property.geo_lat || "");
  const [geoLong, setGeoLong] = useState(property.geo_long || "");
  const [piso, setPiso] = useState(property.floor || "");
  const [depto, setDepto] = useState(property.apartment_door || "");
  const [placeSelected, setPlaceSelected] = useState(!!property.geo_lat);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Google Maps
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [showMap, setShowMap] = useState(!!property.geo_lat);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // ─── Caracteristicas ───────────────────────────────────────────────
  const [ambientes, setAmbientes] = useState(property.room_amount ?? 0);
  const [dormitorios, setDormitorios] = useState(property.suite_amount ?? 0);
  const [banos, setBanos] = useState(property.bathroom_amount ?? 0);
  const [cocheras, setCocheras] = useState(property.parking_lot_amount ?? 0);
  const [toilets, setToilets] = useState(property.toilet_amount ?? 0);
  const [antiguedad, setAntiguedad] = useState(property.age != null ? String(property.age) : "");
  const [superficieCubierta, setSuperficieCubierta] = useState(property.roofed_surface || "");
  const [superficieTotal, setSuperficieTotal] = useState(property.total_surface || "");
  const [disposicion, setDisposicion] = useState(property.disposition || "");

  // ─── Multimedia ─────────────────────────────────────────────────────
  const [photoUrls, setPhotoUrls] = useState<string[]>(
    photos.length > 0 ? photos.map((p) => p.image || p.original) : [""]
  );
  const [videoUrls, setVideoUrls] = useState<string[]>(
    videos.length > 0 ? videos.map((v) => v.url) : [""]
  );

  // ─── Extras ─────────────────────────────────────────────────────────
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(initialTagIds);

  // ─── Section open states ────────────────────────────────────────────
  const [openSections, setOpenSections] = useState({
    precio: true,
    tipoUbicacion: true,
    caracteristicas: true,
    multimedia: true,
    extras: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ─── Map initialization ────────────────────────────────────────────
  useEffect(() => {
    if (!showMap || !isLoaded || !mapRef.current || typeof google === "undefined") return;

    const lat = geoLat ? parseFloat(geoLat) : -34.6037;
    const lng = geoLong ? parseFloat(geoLong) : -58.3816;
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
  }, [showMap, isLoaded, geoLat, geoLong, address]);

  // ─── Handlers ──────────────────────────────────────────────────────

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
    setShowMap(false);
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
    setShowMap(true);
  }, []);

  const toggleTagId = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const needsPisoDepto = typeId === 2 || typeId === 13;

  const handleSubmit = async () => {
    if (needsPisoDepto && (!piso || !depto)) {
      setShowErrors(true);
      toast.error("Completá piso y departamento para este tipo de propiedad");
      return;
    }

    setIsSubmitting(true);

    try {
      const body = {
        type_id: typeId,
        price: price ? Number(price) : null,
        currency,
        expenses: expenses ? Number(expenses) : null,
        duration_months: durationMonths,
        ipc_adjustment: ipcAdjustment,
        address: address || null,
        address_complement: null,
        geo_lat: geoLat || null,
        geo_long: geoLong || null,
        location_id: locationId,
        gm_location_type: null,
        room_amount: ambientes || null,
        bathroom_amount: banos || null,
        toilet_amount: toilets || null,
        suite_amount: dormitorios || null,
        parking_lot_amount: cocheras || null,
        total_surface: superficieTotal || null,
        roofed_surface: superficieCubierta || null,
        semiroofed_surface: null,
        unroofed_surface: (superficieTotal && superficieCubierta)
          ? String(Math.max(0, (Number(superficieTotal) || 0) - (Number(superficieCubierta) || 0)))
          : null,
        age: antiguedad ? parseInt(antiguedad) : null,
        floors_amount: null,
        disposition: disposicion || null,
        floor: piso || null,
        apartment_door: depto || null,
        photoUrls: photoUrls.filter((u) => u.trim()),
        videoUrls: videoUrls.filter((u) => u.trim()),
        tagIds: selectedTagIds,
        description: null,
        rich_description: null,
        publication_title: null,
        reference_code: null,
        available_date: fechaDisponible || null,
        key_coordination: property.key_coordination || null,
        visit_days: property.visit_days || null,
        visit_hours: property.visit_hours || null,
      };

      const res = await fetch(`/api/properties/${propertyId}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Error al guardar los cambios");
        return;
      }

      toast.success("Cambios guardados correctamente");
      router.push(`/gestion/propiedad/${propertyId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Shared sub-components ─────────────────────────────────────────

  const CounterInput = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
  }) => (
    <div className="flex items-center justify-between p-3 rounded-xl border border-border">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <Minus className="h-3 w-3 text-muted-foreground" />
        </button>
        <span className="w-6 text-center font-bold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <Plus className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    </div>
  );

  const SectionHeader = ({
    title,
    sectionKey,
  }: {
    title: string;
    sectionKey: keyof typeof openSections;
  }) => (
    <CollapsibleTrigger
      className="flex items-center justify-between w-full"
      onClick={() => toggleSection(sectionKey)}
    >
      <h3 className="font-display font-semibold text-lg">{title}</h3>
      <ChevronDown
        className={cn(
          "h-5 w-5 text-muted-foreground transition-transform",
          openSections[sectionKey] && "rotate-180"
        )}
      />
    </CollapsibleTrigger>
  );

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-24">
      {/* Back link */}
      <Link
        href={`/gestion/propiedad/${propertyId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al detalle
      </Link>

      <h1 className="font-display text-2xl font-bold">Editar propiedad</h1>

      {/* ═══ Section: Precio y contrato ═══ */}
      <Collapsible open={openSections.precio} className="bg-card rounded-2xl border border-border p-6">
        <SectionHeader title="Precio y contrato" sectionKey="precio" />
        <CollapsibleContent className="pt-6 space-y-6">
          {/* Price + Currency */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
              Precio mensual
            </label>
            <div className="flex gap-2">
              <div className="flex-1 min-w-0">
                <CurrencyInput
                  value={price}
                  onChange={setPrice}
                  currency={currency}
                  className="h-11 rounded-xl text-sm"
                />
              </div>
              <div className="flex items-center p-1 rounded-xl border border-border bg-secondary/30 shrink-0">
                <button
                  type="button"
                  onClick={() => setCurrency("ARS")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-semibold transition-all",
                    currency === "ARS"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  ARS
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-semibold transition-all",
                    currency === "USD"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  USD
                </button>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
              Expensas
            </label>
            <CurrencyInput
              value={expenses}
              onChange={setExpenses}
              currency="ARS"
              placeholder="$ 0"
              className="h-11 rounded-xl text-sm"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
              Duración de contrato (meses)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { months: 12, label: "12 meses" },
                { months: 24, label: "24 meses" },
                { months: 36, label: "36 meses" },
              ].map((opt) => (
                <button
                  key={opt.months}
                  type="button"
                  onClick={() => { setDurationMonths(durationMonths === opt.months ? null : opt.months); setShowDurationHint(false); }}
                  className={cn(
                    "py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all",
                    durationMonths === opt.months
                      ? "border-primary bg-accent text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
              <Input
                type="number"
                min={6}
                placeholder="Meses"
                value={durationMonths && ![12, 24, 36].includes(durationMonths) ? durationMonths : ""}
                onFocus={() => { setDurationMonths(null); setShowDurationHint(true); }}
                onBlur={() => setShowDurationHint(false)}
                onChange={(e) => {
                  const val = e.target.value;
                  setDurationMonths(val ? Math.max(6, Number(val)) : null);
                }}
                className="h-auto rounded-xl border-2 text-sm text-center"
              />
            </div>
            <AnimateHeight show={showDurationHint}>
              <p className="text-xs text-muted-foreground mt-2">Mínimo 6 meses</p>
            </AnimateHeight>
          </div>

          {/* IPC */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
              Actualización IPC
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["trimestral", "cuatrimestral", "semestral", "anual"].map((periodo) => (
                <button
                  key={periodo}
                  type="button"
                  onClick={() => setIpcAdjustment(ipcAdjustment === periodo ? null : periodo)}
                  className={cn(
                    "py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all capitalize",
                    ipcAdjustment === periodo
                      ? "border-primary bg-accent text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {periodo}
                </button>
              ))}
            </div>
          </div>

          {/* Available date */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
              Disponible a partir de
            </label>
            <div className="relative">
              <Input
                type="date"
                value={fechaDisponible}
                onChange={(e) => setFechaDisponible(e.target.value)}
                className="h-11 rounded-xl text-sm pr-12"
              />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* ═══ Section: Tipo y ubicación ═══ */}
      <Collapsible open={openSections.tipoUbicacion} className="bg-card rounded-2xl border border-border p-6">
        <SectionHeader title="Tipo y ubicación" sectionKey="tipoUbicacion" />
        <CollapsibleContent className="pt-6 space-y-6">
          {/* Property type */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
              Tipo de propiedad
            </label>
            <div className="grid grid-cols-3 gap-2">
              {propertyTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setTypeId(type.id)}
                  className={cn(
                    "py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all",
                    typeId === type.id
                      ? "border-primary bg-accent text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          {/* Location search */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
              Barrio / Localidad
            </label>
            <LocationSearchInput
              selectedLocation={selectedLocation}
              onSelect={handleLocationSelect}
              onClear={handleLocationClear}
            />
          </div>

          {/* Address autocomplete */}
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
                  "flex h-11 w-full rounded-xl border bg-background px-4 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  !placeSelected && address ? "border-red-500" : "border-border"
                )}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setPlaceSelected(false);
                  setShowMap(false);
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
            </div>
          </AnimateHeight>

          {/* Piso / Depto */}
          <AnimateHeight show={needsPisoDepto}>
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
                    "h-11 rounded-xl text-sm",
                    showErrors && needsPisoDepto && !piso && "border-red-500"
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
                    "h-11 rounded-xl text-sm",
                    showErrors && needsPisoDepto && !depto && "border-red-500"
                  )}
                />
              </div>
            </div>
          </AnimateHeight>

          {/* Map preview */}
          <AnimateHeight show={showMap && !!geoLat && !!geoLong}>
            <div className="pt-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                Ubicación en el mapa
              </label>
              <div
                ref={mapRef}
                className="w-full aspect-video rounded-xl overflow-hidden border border-border"
                style={{ minHeight: "250px" }}
              >
                {!isLoaded && (
                  <div className="flex items-center justify-center h-full bg-secondary/30">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Podés arrastrar el marcador para ajustar la ubicación.
              </p>
            </div>
          </AnimateHeight>
        </CollapsibleContent>
      </Collapsible>

      {/* ═══ Section: Caracteristicas ═══ */}
      <Collapsible open={openSections.caracteristicas} className="bg-card rounded-2xl border border-border p-6">
        <SectionHeader title="Características" sectionKey="caracteristicas" />
        <CollapsibleContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <CounterInput label="Ambientes" value={ambientes} onChange={setAmbientes} />
            <CounterInput label="Dormitorios" value={dormitorios} onChange={setDormitorios} />
            <CounterInput label="Baños" value={banos} onChange={setBanos} />
            <CounterInput label="Toilettes" value={toilets} onChange={setToilets} />
            <CounterInput label="Cocheras" value={cocheras} onChange={setCocheras} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Antigüedad (años)
              </label>
              <Input
                value={antiguedad}
                onChange={(e) => setAntiguedad(e.target.value)}
                placeholder="0"
                type="number"
                min={0}
                className="h-11 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Sup. cubierta (m²)
              </label>
              <Input
                value={superficieCubierta}
                onChange={(e) => setSuperficieCubierta(e.target.value)}
                placeholder="0"
                type="number"
                min={0}
                className="h-11 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Sup. total (m²)
              </label>
              <Input
                value={superficieTotal}
                onChange={(e) => setSuperficieTotal(e.target.value)}
                placeholder="0"
                type="number"
                min={0}
                className="h-11 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Disposition */}
          <div className="pt-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
              Disposición
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {disposiciones.map((disp) => (
                <button
                  key={disp}
                  type="button"
                  onClick={() => setDisposicion(disposicion === disp ? "" : disp)}
                  className={cn(
                    "py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all",
                    disposicion === disp
                      ? "border-primary bg-accent text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {disp}
                </button>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* ═══ Section: Multimedia ═══ */}
      <Collapsible open={openSections.multimedia} className="bg-card rounded-2xl border border-border p-6">
        <SectionHeader title="Multimedia" sectionKey="multimedia" />
        <CollapsibleContent className="pt-6 space-y-6">
          {/* Photos */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
              Fotos (URLs) — máx. 20
            </label>
            <div className="space-y-2">
              {photoUrls.map((url, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => {
                      const updated = [...photoUrls];
                      updated[i] = e.target.value;
                      setPhotoUrls(updated);
                    }}
                    placeholder={i === 0 ? "URL de la foto principal (portada)" : "URL de la foto"}
                    className="h-11 rounded-xl text-sm"
                  />
                  {photoUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0 h-11 w-11 rounded-xl"
                      onClick={() => setPhotoUrls(photoUrls.filter((_, j) => j !== i))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {photoUrls.length < 20 && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl gap-2 text-sm"
                  onClick={() => setPhotoUrls([...photoUrls, ""])}
                >
                  <Plus className="h-4 w-4" />
                  Agregar foto
                </Button>
              )}
            </div>
          </div>

          {/* Videos */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
              Videos (URLs) — máx. 10
            </label>
            <div className="space-y-2">
              {videoUrls.map((url, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => {
                      const updated = [...videoUrls];
                      updated[i] = e.target.value;
                      setVideoUrls(updated);
                    }}
                    placeholder="URL del video"
                    className="h-11 rounded-xl text-sm"
                  />
                  {videoUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0 h-11 w-11 rounded-xl"
                      onClick={() => setVideoUrls(videoUrls.filter((_, j) => j !== i))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {videoUrls.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl gap-2 text-sm"
                  onClick={() => setVideoUrls([...videoUrls, ""])}
                >
                  <Plus className="h-4 w-4" />
                  Agregar video
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* ═══ Section: Extras ═══ */}
      <Collapsible open={openSections.extras} className="bg-card rounded-2xl border border-border p-6">
        <SectionHeader title="Extras" sectionKey="extras" />
        <CollapsibleContent className="pt-6 space-y-6">
          {/* Tags */}
          {TAG_SECTIONS.map((section) => (
            <div key={section.title}>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                {section.title}
              </label>
              <div className="flex flex-wrap gap-2">
                {section.tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTagId(tag.id)}
                    className={cn(
                      "px-3 py-2 rounded-full border text-sm font-medium transition-all",
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

        </CollapsibleContent>
      </Collapsible>

      {/* ═══ Sticky footer ═══ */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm z-50">
        <div className="container flex items-center justify-between h-16 max-w-screen-lg mx-auto px-6">
          <Link
            href={`/gestion/propiedad/${propertyId}`}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full px-8 h-10 gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
