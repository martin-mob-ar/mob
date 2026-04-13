"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { claritySet } from "@/lib/analytics/clarity";
import { useLoadScript } from "@react-google-maps/api";
import {
  Calendar,
  Loader2,
  Pencil,
  Plus,
  Minus,
  Sparkles,
  Trash2,
  Wand2,
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
import { generateFakeAddress } from "@/lib/utils/fake-address";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LocationSearchInput from "@/components/LocationSearchInput";
import { InfoTooltip } from "@/components/InfoTooltip";
import { LocationResult } from "@/hooks/useLocationSearch";
import { AnimateHeight } from "@/components/ui/animate-height";
import { TAG_SECTIONS, ALL_TAGS } from "@/lib/constants/tags";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PhotoUploader, { UploadedPhoto } from "@/components/PhotoUploader";
import PlanSelector, { PlanType, pricingCost } from "@/components/pricing/PlanSelector";
import { useAuth } from "@/contexts/AuthContext";
import { COUNTRY_CODES } from "@/lib/constants/country-codes";

const mobLogo = "/assets/mob-logo-new.png";
const SUBIR_DRAFT_KEY = "mob_subir_propiedad_guest";
const GUEST_STORAGE_KEY = "mob_guest_contact";

const TOTAL_STEPS = 9;
const GOOGLE_MAPS_LIBRARIES: ("places" | "geometry")[] = ["places"];

const propertyTypes = [
  { id: 2, label: "Departamento", icon: "/icons/property-types/depto.png" },
  { id: 3, label: "Casa", icon: "/icons/property-types/casa.png" },
  { id: 13, label: "PH", icon: "/icons/property-types/ph.png" },
  { id: 7, label: "Local comercial", icon: "/icons/property-types/local.png" },
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

interface DraftProperty {
  id: number;
  type_id: number | null;
  address: string | null;
  location_id: number | null;
  draft_step: number | null;
  updated_at: string | null;
  tokko_property_type: { name: string }[] | { name: string } | null;
  tokko_location: { name: string }[] | { name: string } | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EditData = Record<string, any> | null;

interface SubirPropiedadProps {
  userId: string | null;
  draftData?: DraftData;
  editData?: EditData;
  existingDrafts?: DraftProperty[];
  fromPropietarios?: boolean;
  resumeAfterAuth?: boolean;
}

const SubirPropiedad = ({ userId, draftData, editData, existingDrafts = [], fromPropietarios = false, resumeAfterAuth = false }: SubirPropiedadProps) => {
  const router = useRouter();
  const pathname = "/subir-propiedad";
  const { isAuthenticated, isLoading: authLoading, user: authUser, login, register, authError, clearError, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    claritySet('publish_step', String(currentStep));
  }, [currentStep]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  // Draft / edit tracking
  const [draftPropertyId, setDraftPropertyId] = useState<number | null>(null);
  const draftPropertyIdRef = useRef<number | null>(null);
  const maxStepReachedRef = useRef<number>(1);
  const saveDraftPromiseRef = useRef<Promise<void> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAndExiting, setIsSavingAndExiting] = useState(false);
  const isEditMode = !!editData && !draftData;

  // Draft prompt (step 1) — delete flow
  const [deletingDraftId, setDeletingDraftId] = useState<number | null>(null);
  const [confirmDeleteDraftId, setConfirmDeleteDraftId] = useState<number | null>(null);

  const showDraftPrompt = currentStep === 1 && existingDrafts.length > 0 && !draftData && !editData;

  const handleDeleteDraft = async (id: number) => {
    setConfirmDeleteDraftId(null);
    setDeletingDraftId(id);
    try {
      await fetch(`/api/properties/${id}/delete`, { method: "POST" });
      router.refresh();
    } finally {
      setDeletingDraftId(null);
    }
  };

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
  const [hideAddress, setHideAddress] = useState(false);
  const [fakeAddress, setFakeAddress] = useState("");
  const [missingAltura, setMissingAltura] = useState(false);

  // Step 3: Detalles
  const [ambientes, setAmbientes] = useState(0);
  const [dormitorios, setDormitorios] = useState(0);
  const [banos, setBanos] = useState(0);
  const [toilettes, setToilettes] = useState(0);
  const [cocheras, setCocheras] = useState(0);
  const [antiguedad, setAntiguedad] = useState("");
  const [superficieCubierta, setSuperficieCubierta] = useState("");
  const [superficieTotal, setSuperficieTotal] = useState("");
  const [disposicion, setDisposicion] = useState("");

  // Step 4: Precio y características
  const [precioMensual, setPrecioMensual] = useState("");
  const [moneda, setMoneda] = useState<"ARS" | "USD">("ARS");
  const [expensas, setExpensas] = useState("");
  const [expensasIncluidas, setExpensasIncluidas] = useState(false);
  const [amoblado, setAmoblado] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [duracionContrato, setDuracionContrato] = useState<number | null>(24);
  const [customDuracion, setCustomDuracion] = useState("");
  const [showDuracionHint, setShowDuracionHint] = useState(false);
  const [expandedTagSections, setExpandedTagSections] = useState<Set<string>>(new Set());
  const [ipcEnabled, setIpcEnabled] = useState(true);
  const [ipcPeriodo, setIpcPeriodo] = useState<string>("trimestral");

  // Step 5: Fotos y descripción
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");
  const [showDescComparison, setShowDescComparison] = useState(false);

  // Step 7: Logística
  const [noPuedeDefinirHorarios, setNoPuedeDefinirHorarios] = useState(false);
  const [fechaDisponible, setFechaDisponible] = useState(() => {
    const now = new Date();
    const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return firstOfNextMonth.toISOString().split("T")[0];
  });
  const [diasVisita, setDiasVisita] = useState<string[]>(["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]);
  const [horariosVisita, setHorariosVisita] = useState<Record<string, { start: string; end: string }>>({
    lunes: { start: "08:00", end: "20:00" },
    martes: { start: "08:00", end: "20:00" },
    miercoles: { start: "08:00", end: "20:00" },
    jueves: { start: "08:00", end: "20:00" },
    viernes: { start: "08:00", end: "20:00" },
    sabado: { start: "08:00", end: "20:00" },
    domingo: { start: "08:00", end: "20:00" },
  });

  // Step 8: Plan elegido
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

  // Guest phone (unauthenticated users, step 2)
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCountryCode, setGuestCountryCode] = useState("+54");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Inline auth gate (shown between step 2 and 3 for unauthenticated users)
  const [showInlineAuth, setShowInlineAuth] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authStep, setAuthStep] = useState<"initial" | "password">("initial");
  const [authIsExisting, setAuthIsExisting] = useState<boolean | null>(null);
  const [authLocalError, setAuthLocalError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Scrollable main area
  const mainRef = useRef<HTMLDivElement>(null);

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
    draftPropertyIdRef.current = draftData.id;
    // Compute the first incomplete step from draft data
    {
      const draftExtra = draftData.extra_attributes?.draft ?? {};
      let targetStep = 2;
      const hasStep2 = draftData.type_id && draftData.location_id && draftData.address
        && ((draftData.type_id !== 2 && draftData.type_id !== 13) || (draftData.floor && draftData.apartment_door));
      if (hasStep2) {
        targetStep = 3;
        const hasStep3 = draftData.age != null && draftData.roofed_surface && draftData.total_surface;
        if (hasStep3) {
          targetStep = 4;
          const hasStep4 = draftExtra.precioMensual && (draftExtra.expensasIncluidas || draftExtra.expensas) && draftExtra.duracionContrato != null;
          if (hasStep4) {
            targetStep = 5;
            const hasStep5 = draftData.tokko_property_photo?.length >= 5;
            if (hasStep5) {
              targetStep = 7; // Step 6 (description) is optional
              const hasStep7 = draftData.available_date && (draftExtra.noPuedeDefinirHorarios || (draftData.visit_days?.length > 0));
              if (hasStep7) {
                targetStep = 8;
                if (draftExtra.selectedPlan) {
                  targetStep = 9;
                }
              }
            }
          }
        }
      }
      setCurrentStep(targetStep);
      maxStepReachedRef.current = targetStep;
    }
    if (draftData.type_id) setTypeId(draftData.type_id);
    if (draftData.address) {
      setAddress(draftData.address);
      setPlaceSelected(true);
    }
    if (draftData.geo_lat) setGeoLat(String(draftData.geo_lat));
    if (draftData.geo_long) setGeoLong(String(draftData.geo_long));
    if (draftData.location_id) {
      setLocationId(draftData.location_id);
      if (draftData.tokko_location) {
        setSelectedLocation({
          id: draftData.tokko_location.id,
          name: draftData.tokko_location.name,
          depth: draftData.tokko_location.depth,
          display: "",
          type: "location",
          slug: null,
          stateSlug: null,
        });
      }
    }
    if (draftData.floor) setPiso(String(draftData.floor));
    if (draftData.apartment_door) setDepto(String(draftData.apartment_door));
    if (draftData.fake_address) {
      setHideAddress(true);
      setFakeAddress(draftData.fake_address);
    }
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
    if (extra.noPuedeDefinirHorarios != null) setNoPuedeDefinirHorarios(extra.noPuedeDefinirHorarios);

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

  // Restore edit data on mount (published property editing)
  useEffect(() => {
    if (!editData || draftData) return;
    setDraftPropertyId(editData.id);
    draftPropertyIdRef.current = editData.id;
    setCurrentStep(9);
    maxStepReachedRef.current = 9;
    if (editData.type_id) setTypeId(editData.type_id);
    if (editData.address) {
      setAddress(editData.address);
      setPlaceSelected(true);
    }
    if (editData.geo_lat) setGeoLat(String(editData.geo_lat));
    if (editData.geo_long) setGeoLong(String(editData.geo_long));
    if (editData.location_id) {
      setLocationId(editData.location_id);
      if (editData.tokko_location) {
        const loc = Array.isArray(editData.tokko_location) ? editData.tokko_location[0] : editData.tokko_location;
        if (loc) {
          setSelectedLocation({
            id: loc.id,
            name: loc.name,
            depth: loc.depth ?? 0,
            display: "",
            type: "location",
            slug: null,
            stateSlug: null,
          });
        }
      }
    }
    if (editData.floor) setPiso(String(editData.floor));
    if (editData.apartment_door) setDepto(String(editData.apartment_door));
    if (editData.fake_address) {
      setHideAddress(true);
      setFakeAddress(editData.fake_address);
    }
    if (editData.room_amount != null) setAmbientes(editData.room_amount);
    if (editData.bathroom_amount != null) setBanos(editData.bathroom_amount);
    if (editData.toilet_amount != null) setToilettes(editData.toilet_amount);
    if (editData.suite_amount != null) setDormitorios(editData.suite_amount);
    if (editData.parking_lot_amount != null) setCocheras(editData.parking_lot_amount);
    if (editData.roofed_surface) setSuperficieCubierta(String(editData.roofed_surface));
    if (editData.total_surface) setSuperficieTotal(String(editData.total_surface));
    if (editData.age != null) setAntiguedad(String(editData.age));
    if (editData.disposition) setDisposicion(editData.disposition);
    if (editData.available_date) setFechaDisponible(editData.available_date);
    if (editData.visit_days) setDiasVisita(editData.visit_days);
    if (editData.description) setDescripcion(editData.description);

    // Restore pricing from operacion
    const op = editData.operacion;
    if (op) {
      if (op.price != null) setPrecioMensual(String(Math.round(Number(op.price))));
      if (op.currency) setMoneda(op.currency as "ARS" | "USD");
      if (op.expenses != null) {
        setExpensas(String(op.expenses));
        setExpensasIncluidas(false);
      } else if (op.price != null) {
        setExpensasIncluidas(true);
      }
      if (op.duration_months != null) setDuracionContrato(op.duration_months);
      if (op.ipc_adjustment) {
        setIpcEnabled(true);
        setIpcPeriodo(op.ipc_adjustment);
      } else {
        setIpcEnabled(false);
      }
      if (op.planMobElegido) setSelectedPlan(op.planMobElegido as PlanType);
    }

    // Parse visit_hours strings (format: "lunes 09:00-18:00") → horariosVisita
    if (editData.visit_hours?.length) {
      const parsed: Record<string, { start: string; end: string }> = {};
      for (const entry of editData.visit_hours as string[]) {
        const match = entry.match(/^(\w+)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
        if (match) {
          parsed[match[1]] = { start: match[2], end: match[3] };
        }
      }
      if (Object.keys(parsed).length > 0) {
        setHorariosVisita((prev) => ({ ...prev, ...parsed }));
      }
    }

    // Restore photos
    if (editData.tokko_property_photo?.length) {
      setUploadedPhotos(
        editData.tokko_property_photo
          .filter((p: { storage_path: string | null }) => p.storage_path)
          .map((p: { image: string; storage_path: string; order: number; is_front_cover: boolean }) => ({
            publicUrl: p.image,
            storagePath: p.storage_path,
            order: p.order,
            isCover: p.is_front_cover,
          }))
      );
    }

    // Restore tags
    if (editData.tokko_property_property_tag?.length) {
      setSelectedTagIds(editData.tokko_property_property_tag.map((t: { tag_id: number }) => t.tag_id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resume after auth: restore form data from localStorage
  useEffect(() => {
    if (!resumeAfterAuth || !userId) return;
    // Apply guest phone to profile only if the account doesn't already have one
    const guestRaw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (guestRaw) {
      (async () => {
        try {
          const guest = JSON.parse(guestRaw);
          if (guest?.phone) {
            const profileRes = await fetch("/api/users/profile");
            const profileData = profileRes.ok ? await profileRes.json() : null;
            if (!profileData?.user?.telefono) {
              await fetch("/api/users/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  telefono: guest.phone,
                  telefono_country_code: guest.country_code || "+54",
                }),
              });
              refreshUser();
            }
          }
        } catch { /* ignore */ }
      })();
      localStorage.removeItem(GUEST_STORAGE_KEY);
    }
    const raw = localStorage.getItem(SUBIR_DRAFT_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.typeId) setTypeId(data.typeId);
      if (data.locationId) setLocationId(data.locationId);
      if (data.selectedLocation) setSelectedLocation(data.selectedLocation);
      if (data.address) { setAddress(data.address); setPlaceSelected(!!data.placeSelected); }
      if (data.geoLat) setGeoLat(data.geoLat);
      if (data.geoLong) setGeoLong(data.geoLong);
      if (data.piso) setPiso(data.piso);
      if (data.depto) setDepto(data.depto);
      setCurrentStep(3);
      maxStepReachedRef.current = 3;
    } catch { /* ignore parse errors */ }
    localStorage.removeItem(SUBIR_DRAFT_KEY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset validation errors when step changes
  useEffect(() => {
    setShowErrors(false);
  }, [currentStep]);

  // Auto-advance past inline auth gate when user authenticates (email/password flow)
  useEffect(() => {
    if (showInlineAuth && isAuthenticated && !authLoading) {
      setShowInlineAuth(false);
      // Apply guest phone to profile only if the account doesn't already have one
      const guestRaw = localStorage.getItem(GUEST_STORAGE_KEY);
      if (guestRaw) {
        try {
          const guest = JSON.parse(guestRaw);
          if (guest?.phone && !authUser?.phone) {
            fetch("/api/users/profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                telefono: guest.phone,
                telefono_country_code: guest.country_code || "+54",
              }),
            }).then(() => refreshUser()).catch(() => {});
          }
        } catch { /* ignore */ }
        localStorage.removeItem(GUEST_STORAGE_KEY);
      }
      // Auto-set account type to propietario
      fetch("/api/users/account-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_type: 2 }),
      }).then(() => refreshUser()).catch(() => {});
      // Advance to step 3
      const nextStep = 3;
      maxStepReachedRef.current = Math.max(maxStepReachedRef.current, nextStep);
      setCurrentStep(nextStep);
      mainRef.current?.scrollTo({ top: 0 });
    }
  }, [showInlineAuth, isAuthenticated, authLoading, refreshUser]);

  // Default IPC based on currency: ON for ARS, OFF for USD
  useEffect(() => {
    setIpcEnabled(moneda === "ARS");
  }, [moneda]);

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
    setMissingAltura(false);
    setHideAddress(false);
    setFakeAddress("");
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

    const finalAddress = streetAddress || place.name || "";
    setAddress(finalAddress);
    setGeoLat(String(geo.lat));
    setGeoLong(String(geo.lng));

    if (!streetNumber) {
      // Address has no altura — keep placeSelected false so user can't advance
      setPlaceSelected(false);
      setMissingAltura(true);
      return;
    }

    setPlaceSelected(true);
    setMissingAltura(false);
    setShowErrors(false);
    // Recompute fake address if checkbox was already checked
    if (hideAddress && finalAddress) {
      setFakeAddress(generateFakeAddress(finalAddress));
    }
  }, [hideAddress]);

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
        // Require phone for unauthenticated users
        if (!isAuthenticated && guestPhone.length < 6) return false;
        return true;
      case 3:
        if (!antiguedad || !superficieCubierta || !superficieTotal) return false;
        return true;
      case 4:
        return !!precioMensual && (expensasIncluidas || !!expensas) && !!duracionContrato;
      case 5: {
        if (uploadedPhotos.length < 5) return false;
        const urls = uploadedPhotos.map((p) => p.publicUrl);
        return new Set(urls).size === urls.length;
      }
      case 6:
        return true; // Description is optional
      case 7: {
        if (!fechaDisponible || (!noPuedeDefinirHorarios && diasVisita.length === 0)) return false;
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

  const saveDraft = useCallback((nextStep: number) => {
    const doSave = async () => {
      setIsSaving(true);
      try {
        // Chain: wait for any previous save to complete (ensures draftPropertyId is set)
        if (saveDraftPromiseRef.current) {
          await saveDraftPromiseRef.current;
        }

        const effectiveDraftStep = Math.max(maxStepReachedRef.current, nextStep);

        const res = await fetch("/api/properties/save-draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile_id: userId,
            draftId: draftPropertyIdRef.current,
            draft_step: effectiveDraftStep,
            type_id: typeId,
            address: address || null,
            fake_address: hideAddress ? fakeAddress || null : null,
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
              noPuedeDefinirHorarios,
            },
          }),
        });
        if (res.ok) {
          const { id } = await res.json();
          if (!draftPropertyIdRef.current) {
            draftPropertyIdRef.current = id;
            setDraftPropertyId(id);
          }
        }
      } catch {
        // Non-blocking — draft save failure should not interrupt user flow
      } finally {
        setIsSaving(false);
      }
    };

    const promise = doSave();
    saveDraftPromiseRef.current = promise;
    return promise;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userId, typeId, address, hideAddress, fakeAddress, geoLat, geoLong, locationId,
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

        // Check phone uniqueness before advancing from step 2
        if (currentStep === 2 && !isAuthenticated && guestPhone) {
          setPhoneError(null);
          try {
            // Normalize: strip leading '9' for Argentine numbers
            const normalizedPhone = guestCountryCode === "+54"
              ? guestPhone.replace(/^9/, "")
              : guestPhone;
            const phonesToCheck = guestCountryCode === "+54"
              ? [normalizedPhone, "9" + normalizedPhone]
              : [normalizedPhone];
            const res = await fetch(`/api/auth/check-phone?phones=${phonesToCheck.join(",")}&country_code=${encodeURIComponent(guestCountryCode)}`);
            if (res.ok) {
              const data = await res.json();
              if (data.exists) {
                setPhoneError("Este teléfono ya está en uso.");
                return;
              }
            }
          } catch { /* allow to proceed if check fails */ }
        }

        // Auth gate: show inline auth before advancing to step 3
        if (currentStep === 2 && !isAuthenticated) {
          // Persist form data to localStorage for resume after Google auth redirect
          localStorage.setItem(SUBIR_DRAFT_KEY, JSON.stringify({
            typeId, locationId, selectedLocation, address, geoLat, geoLong,
            piso, depto, placeSelected, guestPhone, guestCountryCode,
          }));
          // Save phone for applyGuestContactToProfile() after auth
          localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify({
            phone: guestPhone,
            country_code: guestCountryCode,
          }));
          setShowInlineAuth(true);
          mainRef.current?.scrollTo({ top: 0 });
          return;
        }

        const nextStep = currentStep + 1;
        maxStepReachedRef.current = Math.max(maxStepReachedRef.current, nextStep);

        if (currentStep >= 2 && !isEditMode) {
          if (!draftPropertyIdRef.current) {
            // First save: must await to get the draftPropertyId
            await saveDraft(nextStep);
          } else {
            // Subsequent saves: fire-and-forget (optimistic advance)
            saveDraft(nextStep);
          }
        }

        setCurrentStep(nextStep);
        mainRef.current?.scrollTo({ top: 0 });
      } else {
        setShowErrors(true);
        setTimeout(() => {
          const el = mainRef.current?.querySelector('.border-red-500, .text-red-500');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      mainRef.current?.scrollTo({ top: 0 });
    }
  };

  // Inline auth handlers
  const handleInlineEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSubmitting(true);
    setAuthLocalError(null);
    clearError();
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthLocalError("Error al verificar el email. Intentá de nuevo.");
        return;
      }
      setAuthIsExisting(data.exists);
      setAuthStep("password");
    } catch {
      setAuthLocalError("Error de conexión. Intentá de nuevo.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleInlinePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSubmitting(true);
    setAuthLocalError(null);
    try {
      if (authIsExisting) {
        await login(authEmail, authPassword);
        // isAuthenticated effect will handle advancing
      } else {
        const { confirmed } = await register(authEmail, authPassword, false);
        if (!confirmed) {
          setAuthLocalError("Revisá tu email para confirmar tu cuenta.");
          return;
        }
        // isAuthenticated effect will handle advancing
      }
    } catch {
      // Error is set in AuthContext
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleInlineGoogleAuth = () => {
    const redirectUri = `${window.location.origin}/api/auth/callback/google`;
    const state = encodeURIComponent("/subir-propiedad?resume=true");
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "offline",
      prompt: "select_account",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const handleSaveAndExit = async () => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    if (isEditMode) {
      router.push(`/gestion/propiedad/${draftPropertyId}`);
      return;
    }
    if (currentStep >= 2) {
      setIsSavingAndExiting(true);
      await saveDraft(maxStepReachedRef.current);
      setIsSavingAndExiting(false);
    }
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
    const isImproveMode = descripcion.trim().length > 0;
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
          ...(isImproveMode && {
            mode: "improve" as const,
            existingDescription: descripcion,
          }),
        }),
      });

      if (!res.ok) {
        toast.error("No se pudo generar la descripción. Intentá de nuevo.");
        return;
      }

      const { description } = await res.json();
      if (description) {
        if (isImproveMode) {
          setOriginalDescription(descripcion);
          setAiDescription(description);
          setShowDescComparison(true);
        } else {
          setDescripcion(description);
        }
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
      // Resolve auth user ID: prefer server prop, fall back to client session
      let effectiveUserId = userId;
      if (!effectiveUserId) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        effectiveUserId = sessionUser?.id ?? null;
      }
      if (!effectiveUserId) {
        setSubmitError("No se pudo identificar al usuario. Intentá recargar la página.");
        setIsSubmitting(false);
        return;
      }

      const propertyTypeLabel = propertyTypes.find((t) => t.id === typeId)?.label || "";
      const locationName = selectedLocation?.name || "";
      const autoTitle = `${propertyTypeLabel} en ${locationName}`.trim();

      const visitHoursArr = buildVisitHoursArr();

      if (isEditMode && draftPropertyId) {
        // Edit mode: update existing published property
        const body = {
          type_id: typeId,
          address: address || null,
          fake_address: hideAddress ? fakeAddress || null : null,
          address_complement: null,
          geo_lat: geoLat || null,
          geo_long: geoLong || null,
          location_id: locationId,
          gm_location_type: null,
          room_amount: ambientes || null,
          bathroom_amount: banos || null,
          toilet_amount: toilettes || null,
          suite_amount: dormitorios || null,
          parking_lot_amount: cocheras || null,
          roofed_surface: superficieCubierta || null,
          total_surface: superficieTotal || null,
          semiroofed_surface: null,
          unroofed_surface: null,
          age: antiguedad ? parseInt(antiguedad) : null,
          floors_amount: null,
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
          rich_description: null,
          reference_code: null,
          available_date: fechaDisponible || null,
          key_coordination: null,
          visit_days: noPuedeDefinirHorarios ? [] : diasVisita,
          visit_hours: noPuedeDefinirHorarios ? [] : visitHoursArr,
          no_puede_definir_horarios: noPuedeDefinirHorarios,
        };

        const res = await fetch(`/api/properties/${draftPropertyId}/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const result = await res.json();

        if (!res.ok) {
          setSubmitError(result.error || "Error al guardar los cambios.");
          setIsSubmitting(false);
          return;
        }

        toast.success("Cambios guardados correctamente");
        router.push(`/gestion/propiedad/${draftPropertyId}`);
      } else {
        // Create mode (new or from draft)
        const body = {
          profile_id: effectiveUserId,
          draftId: draftPropertyId,
          type_id: typeId,
          address: address || null,
          fake_address: hideAddress ? fakeAddress || null : null,
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
          unroofed_surface: null,
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
          visit_days: noPuedeDefinirHorarios ? [] : diasVisita,
          visit_hours: noPuedeDefinirHorarios ? [] : visitHoursArr,
          no_puede_definir_horarios: noPuedeDefinirHorarios,
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

        // Fire Truora outbound for identity verification (fire-and-forget)
        // Skip if user is already verified
        if (authUser?.phone && !authUser?.isVerified) {
          fetch("/api/truora/outbound", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: authUser.phone,
              country_code: authUser.phoneCountryCode || "+54",
              name: authUser.name || "",
              accountType: authUser.accountType || 2,
            }),
          }).catch(() => {});
        }

        // Redirect to property detail — show verification modal only if not yet verified
        router.push(`/propiedad/${result.id}${authUser?.isVerified ? "" : "?verification=true"}`);
      }
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
      // Step 1: Intro (or draft prompt if user has unfinished drafts)
      case 1:
        if (showDraftPrompt) {
          return (
            <div className="max-w-3xl mx-auto space-y-8">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
                  Tus publicaciones en progreso
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg mt-2">
                  Tenés {existingDrafts.length === 1 ? "una publicación" : `${existingDrafts.length} publicaciones`} sin terminar. Podés continuar donde dejaste o empezar una nueva.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {existingDrafts.map((draft) => {
                  const typeObj = Array.isArray(draft.tokko_property_type) ? draft.tokko_property_type[0] : draft.tokko_property_type;
                  const locObj = Array.isArray(draft.tokko_location) ? draft.tokko_location[0] : draft.tokko_location;
                  const typeName = typeObj?.name || null;
                  const locationName = locObj?.name || null;
                  const title =
                    typeName && locationName
                      ? `${typeName} en ${locationName}`
                      : typeName || draft.address || "Nueva propiedad";
                  const rawStep = draft.draft_step ?? 2;
                  const step = rawStep <= 2 ? rawStep : rawStep === 3 ? 2 : Math.min(rawStep - 1, TOTAL_STEPS);
                  const updatedAt = draft.updated_at
                    ? new Date(draft.updated_at).toLocaleDateString("es-AR")
                    : null;

                  return (
                    <div
                      key={draft.id}
                      className="bg-card rounded-xl border border-border/60 p-5 space-y-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-sm leading-snug">{title}</p>
                        <p className="text-xs text-muted-foreground">
                          Paso {step} de {TOTAL_STEPS}
                          {updatedAt && ` · Guardado el ${updatedAt}`}
                        </p>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/subir-propiedad?draftId=${draft.id}`)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Continuar
                        </button>
                        <button
                          onClick={() => setConfirmDeleteDraftId(draft.id)}
                          disabled={deletingDraftId === draft.id}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border text-muted-foreground hover:text-red-500 hover:border-red-300 transition-colors"
                        >
                          {deletingDraftId === draft.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  maxStepReachedRef.current = Math.max(maxStepReachedRef.current, 2);
                  setCurrentStep(2);
                }}
                className="w-full p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors text-center group"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-semibold text-base">Crear nueva propiedad</span>
                  <span className="text-sm text-muted-foreground">Empezar desde cero</span>
                </div>
              </button>

              <AlertDialog
                open={confirmDeleteDraftId !== null}
                onOpenChange={(open) => { if (!open) setConfirmDeleteDraftId(null); }}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminás este borrador?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se va a eliminar el borrador de forma permanente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => confirmDeleteDraftId && handleDeleteDraft(confirmDeleteDraftId)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          );
        }

        return (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-[3.25rem] md:leading-[1.15] font-bold leading-tight mb-4 sm:mb-6">
                Alquila tu propiedad con seguridad
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg">
                Recibí solo inquilinos calificados, aprobados para una garantía. Ahorra tiempo y dinero.
              </p>
            </div>
            <div className="divide-y divide-border">
              {[
                {
                  num: "1",
                  title: "Contanos acerca de la propiedad",
                  desc: "Comparti los datos y subi las fotos.",
                  img: "/assets/subir-propiedad-1.png",
                },
                {
                  num: "2",
                  title: "Elegí como queres publicarlo. Planes gratis y hasta USD 299.",
                  desc: "Sin costo inicial (pagas al alquilar)",
                  img: "/assets/subir-propiedad-2.png",
                },
                {
                  num: "3",
                  title: "Alquila tu propiedad en dias",
                  desc: "Recibi interesados calificados, y firmá el contrato online. Tu inquilino tiene 50% off en su garantía y vos tu cobro asegurado todos los meses.",
                  img: "/assets/subir-propiedad-3.png",
                },
              ].map((item) => (
                <div key={item.num} className="flex items-center gap-4 sm:gap-5 py-5 sm:py-8 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <span className="font-display font-bold text-lg mt-0.5">{item.num}</span>
                    <div>
                      <p className="font-semibold text-base sm:text-lg">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  </div>
                  <Image
                    src={item.img}
                    alt=""
                    width={128}
                    height={128}
                    className="w-20 h-20 sm:w-32 sm:h-32 object-contain shrink-0"
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
            {/* WhatsApp phone input for unauthenticated users */}
            <AnimateHeight show={!isAuthenticated}>
              <div className="space-y-4 pb-2">
                <h1 className="font-display text-xl sm:text-3xl font-bold">
                  Decinos tu WhatsApp
                </h1>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                  WhatsApp
                </label>
                <div className="flex gap-2">
                  <Select value={guestCountryCode} onValueChange={setGuestCountryCode}>
                    <SelectTrigger className="h-12 rounded-xl text-sm w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {COUNTRY_CODES.map((code) => (
                        <SelectItem key={code.value} value={code.value}>
                          {code.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder="Ej: 1126373290"
                    autoComplete="tel-national"
                    value={guestPhone}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "");
                      setGuestPhone(cleaned);
                      if (phoneError) setPhoneError(null);
                    }}
                    className={cn(
                      "h-12 rounded-xl flex-1",
                      (phoneError || (showErrors && !isAuthenticated && guestPhone.length < 6)) && "border-red-500"
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Sin 0 y sin 15. Ej: 1126373290</p>
                {showErrors && !isAuthenticated && guestPhone.length < 6 && (
                  <p className="text-sm text-red-500">Ingresá tu número de WhatsApp</p>
                )}
                {phoneError && (
                  <p className="text-sm text-red-500">{phoneError}</p>
                )}
              </div>
            </AnimateHeight>

            <div className="space-y-4">
              <h1 className="font-display text-xl sm:text-3xl font-bold">
                ¿Qué tipo de propiedad es?
              </h1>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {propertyTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => { setTypeId(type.id); setShowErrors(false); if (type.id === 3) setDisposicion(""); }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 sm:gap-2 py-3 sm:py-4 px-1.5 sm:px-6 rounded-xl border-2 text-[11px] sm:text-sm font-semibold transition-all min-w-0",
                      typeId === type.id
                        ? "border-primary bg-accent text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    <Image
                      src={type.icon}
                      alt={type.label}
                      width={80}
                      height={80}
                      className="w-14 h-14 sm:w-20 sm:h-20 object-contain"
                    />
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
                        setMissingAltura(false);
                      }}
                      ref={(el) => {
                        if (!el || !isLoaded || typeof google === "undefined") return;
                        if ((el as HTMLInputElement & { _autocompleteAttached?: boolean })._autocompleteAttached) return;
                        (el as HTMLInputElement & { _autocompleteAttached?: boolean })._autocompleteAttached = true;
                        const autocomplete = new google.maps.places.Autocomplete(el, {
                          types: ["address"],
                          componentRestrictions: { country: "ar" },
                          fields: ["geometry", "formatted_address", "name", "address_components"],
                          bounds: new google.maps.LatLngBounds(
                            { lat: -34.705, lng: -58.531 },
                            { lat: -34.527, lng: -58.335 },
                          ),
                        });
                        autocomplete.addListener("place_changed", onPlaceSelect);
                        autocompleteRef.current = autocomplete;
                      }}
                    />
                    {!placeSelected && address && (
                      <p className="text-sm text-red-500">
                        {missingAltura
                          ? "La dirección que seleccionaste no tiene altura. Ingresá la calle con altura (ej: Honduras 5734)"
                          : "Seleccioná una dirección de las sugerencias de Google Maps"}
                      </p>
                    )}
                    {showErrors && !address && (
                      <p className="text-sm text-red-500">Ingresá una dirección</p>
                    )}

                    <AnimateHeight show={placeSelected}>
                      <div className="flex items-start gap-3 mt-4 p-3 rounded-xl bg-muted/50">
                        <Checkbox
                          id="hide-address"
                          checked={hideAddress}
                          onCheckedChange={(checked) => {
                            const val = !!checked;
                            setHideAddress(val);
                            if (val && address) {
                              setFakeAddress(generateFakeAddress(address));
                            } else {
                              setFakeAddress("");
                            }
                          }}
                          className="mt-0.5"
                        />
                        <label htmlFor="hide-address" className="text-sm cursor-pointer select-none">
                          ¿Querés ocultar la dirección real?
                        </label>
                      </div>
                      <AnimateHeight show={hideAddress && !!fakeAddress}>
                        <p className="text-sm text-muted-foreground mt-2 ml-1">
                          Los usuarios verán: <span className="font-medium text-foreground">{fakeAddress}</span>
                        </p>
                      </AnimateHeight>
                    </AnimateHeight>
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
                        onChange={(e) => setDepto(e.target.value.toUpperCase())}
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

      // Step 3: Detalles del espacio
      case 3:
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
                  inputMode="numeric"
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
                  inputMode="numeric"
                  className={cn(
                    "h-14 rounded-xl text-base",
                    showErrors && !superficieTotal && "border-red-500"
                  )}
                />
              </div>
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
                  inputMode="numeric"
                  className={cn("h-14 rounded-xl text-base", showErrors && !antiguedad && "border-red-500")}
                />
              </div>
            </div>

            <AnimateHeight show={typeId !== 3}>
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
            </AnimateHeight>

            {TAG_SECTIONS.map((section) => {
              const title =
                section.title === "Amenities del edificio" && typeId === 3
                  ? "Amenities"
                  : section.title;
              const isExpanded = expandedTagSections.has(section.title);
              const selectedCount = section.tags.filter((t) => selectedTagIds.includes(t.id)).length;
              return (
                <div key={section.title}>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedTagSections((prev) => {
                        const next = new Set(prev);
                        if (next.has(section.title)) next.delete(section.title);
                        else next.add(section.title);
                        return next;
                      })
                    }
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <span className="font-medium text-sm">
                      {title}
                      {selectedCount > 0 && (
                        <span className="ml-2 text-xs text-primary font-semibold">({selectedCount})</span>
                      )}
                    </span>
                    <svg
                      className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimateHeight show={isExpanded}>
                    <div className="flex flex-wrap gap-2 pt-3 pb-1">
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
                  </AnimateHeight>
                </div>
              );
            })}
          </div>
        );

      // Step 4: Precio y características
      case 4:
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

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                Expensas
              </label>
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
                    <CurrencyInput
                      value={expensas}
                      onChange={setExpensas}
                      currency="ARS"
                      placeholder="$ 0"
                      className={cn("h-14 rounded-xl text-base", showErrors && !expensasIncluidas && !expensas && "border-red-500")}
                    />
                  </div>
                </AnimateHeight>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border">
              <span className="font-medium">¿Está amoblado?</span>
              <Switch checked={amoblado} onCheckedChange={setAmoblado} />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
                Duración de contrato (meses)
              </label>
              <p className="text-xs text-muted-foreground mb-3">Usamos esta información para redactar el contrato de alquiler.</p>
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
                      : showErrors && !duracionContrato
                        ? "border-red-500 text-muted-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                />
              </div>
              <AnimateHeight show={showDuracionHint}>
                <p className="text-xs text-muted-foreground mt-2 text-right">Mínimo 6 meses</p>
              </AnimateHeight>
              <AnimateHeight show={showErrors && !duracionContrato}>
                <p className="text-sm text-red-500 mt-2">Completá la duración del contrato</p>
              </AnimateHeight>
            </div>

            <div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                <span className="font-medium flex items-center gap-1.5">
                  Actualización por IPC
                  <InfoTooltip text="El Índice de Precios al Consumidor (IPC) permite ajustar el alquiler periódicamente según la inflación publicada por el INDEC." size={14} />
                </span>
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

          </div>
        );

      // Step 5: Fotos y descripción
      case 5:
        return (
          <div className="max-w-xl mx-auto space-y-8">
            <PhotoUploader
              photos={uploadedPhotos}
              onChange={setUploadedPhotos}
              onUploadingChange={setIsUploadingPhotos}
              propertyId={draftPropertyId ?? undefined}
            />
            <p className="text-sm text-muted-foreground">
              Si elegís <em>experiencia <span className="font-ubuntu font-medium text-primary">mob</span></em>, luego mandamos al fotógrafo y cambiamos las fotos.
            </p>
            {showErrors && uploadedPhotos.length < 5 && (
              <p className="text-sm text-red-500">Necesitás al menos 5 fotos</p>
            )}
            {showErrors && uploadedPhotos.length >= 5 && (() => {
              const urls = uploadedPhotos.map((p) => p.publicUrl);
              return new Set(urls).size !== urls.length;
            })() && (
              <p className="text-sm text-red-500">Hay fotos duplicadas</p>
            )}

          </div>
        );

      // Step 6: Describí tu propiedad
      case 6:
        return (
          <div className={cn(
            "mx-auto space-y-6",
            showDescComparison ? "max-w-3xl" : "max-w-xl"
          )}>
            <h1 className="font-display text-xl sm:text-3xl font-bold">
              Describí tu propiedad
            </h1>

            <AnimateHeight show={!showDescComparison}>
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
                    disabled={isGeneratingDesc || showDescComparison}
                    className="gap-1.5 text-xs"
                  >
                    {isGeneratingDesc ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Generando...
                      </>
                    ) : descripcion.trim().length > 0 ? (
                      <>
                        <Wand2 className="h-3.5 w-3.5" />
                        Mejorar descripción con IA
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
                  ref={(el) => {
                    if (el) {
                      el.style.height = "auto";
                      el.style.height = `${Math.max(el.scrollHeight, 120)}px`;
                    }
                  }}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Contá lo mejor de tu propiedad: luminosidad, vistas, estado, cercanía a transporte..."
                  rows={3}
                  className="flex w-full rounded-xl border border-border bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none overflow-hidden"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {descripcion.length > 0 ? `${descripcion.length} caracteres` : "Una buena descripción ayuda a conseguir más consultas"}
                </p>
              </div>
            </AnimateHeight>

            {/* Side-by-side comparison after AI improve */}
            <AnimateHeight show={showDescComparison}>
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Podés editar cualquiera de las dos antes de elegir.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-[calc(100dvh-20rem)] sm:h-[calc(100dvh-22rem)] min-h-48">
                  {/* Original description card */}
                  <div className="flex flex-col rounded-xl border border-border bg-background p-4 min-h-0">
                    <div className="flex items-center gap-2 mb-3">
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Tu descripción
                      </span>
                    </div>
                    <textarea
                      value={originalDescription}
                      onChange={(e) => setOriginalDescription(e.target.value)}
                      onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 300)}
                      rows={3}
                      className="flex-1 min-h-0 w-full overflow-y-auto rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm leading-relaxed ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        {originalDescription.length} caracteres
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => {
                          setDescripcion(originalDescription);
                          setShowDescComparison(false);
                          setAiDescription("");
                          setOriginalDescription("");
                        }}
                      >
                        Elegir descripción original
                      </Button>
                    </div>
                  </div>

                  {/* AI-improved description card */}
                  <div className="flex flex-col rounded-xl border border-primary/30 bg-accent/30 p-4 min-h-0">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary uppercase tracking-wider">
                        Mejorada con IA
                      </span>
                    </div>
                    <textarea
                      value={aiDescription}
                      onChange={(e) => setAiDescription(e.target.value)}
                      onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 300)}
                      rows={3}
                      className="flex-1 min-h-0 w-full overflow-y-auto rounded-lg border border-primary/20 bg-background px-3 py-2.5 text-sm leading-relaxed ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        {aiDescription.length} caracteres
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => {
                          setDescripcion(aiDescription);
                          setShowDescComparison(false);
                          setAiDescription("");
                          setOriginalDescription("");
                        }}
                      >
                        Elegir descripción con IA
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateHeight>
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
                ¿Desde cuándo se puede alquilar?
              </label>
              <div className="relative">
                <Input
                  id="fecha-disponible-input"
                  type="date"
                  min={getTomorrowDateString()}
                  max="9999-12-31"
                  value={fechaDisponible}
                  onChange={(e) => setFechaDisponible(e.target.value)}
                  className={cn("h-14 rounded-xl text-base pr-12", showErrors && !fechaDisponible && "border-red-500")}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => {
                    const input = document.getElementById("fecha-disponible-input") as HTMLInputElement;
                    input?.showPicker?.();
                    input?.focus();
                  }}
                  aria-label="Abrir calendario"
                >
                  <Calendar className="h-5 w-5" />
                </button>
              </div>
              {showErrors && fechaDisponible && new Date(fechaDisponible) < new Date(getTomorrowDateString()) && (
                <p className="text-sm text-red-500 mt-1">La fecha debe ser a partir de mañana</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                ¿Cuándo se puede visitar?
              </label>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border mb-3">
                <span className="font-medium flex items-center gap-1.5">
                  No puedo definir horarios
                  <InfoTooltip text="Te vamos a mandar WhatsApp con propuestas de horarios para coordinar las visitas." size={14} />
                </span>
                <Switch checked={noPuedeDefinirHorarios} onCheckedChange={setNoPuedeDefinirHorarios} />
              </div>

              <AnimateHeight show={!noPuedeDefinirHorarios}>
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
              </AnimateHeight>
              {showErrors && !noPuedeDefinirHorarios && diasVisita.length === 0 && (
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
              {showErrors && !selectedPlan && (
                <p className="text-sm text-red-500 mt-2">Seleccioná un plan para continuar</p>
              )}
            </div>
            <PlanSelector selectedPlan={selectedPlan} onSelectPlan={setSelectedPlan} variant="wizard" />
          </div>
        );

      // Step 9: Resumen
      case 9:
        return (
          <div className="max-w-xl mx-auto space-y-6">
            <h1 className="font-display text-xl sm:text-3xl font-bold">
              {isEditMode ? "Editá tu publicación" : "Revisá tu publicación"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Modificá los datos que necesites y guardá los cambios."
                : "Verificá que toda la información sea correcta antes de publicar."}
            </p>

            <SummarySection title="Tipo de propiedad y ubicación" onEdit={() => { setCurrentStep(2); mainRef.current?.scrollTo({ top: 0 }); }}>
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
              {geoLat && geoLong && (
                <div className="mt-3 rounded-xl overflow-hidden border border-border">
                  <img
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${geoLat},${geoLong}&zoom=16&size=600x200&scale=2&markers=color:red%7C${geoLat},${geoLong}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                    alt="Ubicación de la propiedad"
                    className="w-full h-auto"
                  />
                </div>
              )}
            </SummarySection>

            <SummarySection title="Detalles de la propiedad" onEdit={() => { setCurrentStep(3); mainRef.current?.scrollTo({ top: 0 }); }}>
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

            <SummarySection title="Precio y características" onEdit={() => { setCurrentStep(4); mainRef.current?.scrollTo({ top: 0 }); }}>
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

            <SummarySection title="Fotos" onEdit={() => { setCurrentStep(5); mainRef.current?.scrollTo({ top: 0 }); }}>
              {uploadedPhotos.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{uploadedPhotos.length} {uploadedPhotos.length === 1 ? "foto" : "fotos"}</p>
                  <div className="flex gap-2 overflow-x-auto">
                    {uploadedPhotos.slice(0, 5).map((photo, i) => (
                      <div key={photo.storagePath} className={cn("relative shrink-0 w-16 h-12 rounded-xl overflow-hidden border", photo.isCover ? "border-primary" : "border-border")}>
                        <img src={photo.publicUrl} alt={`Foto ${i + 1}`} className="block w-full h-full object-cover" />
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
            </SummarySection>

            <SummarySection title="Descripción" onEdit={() => { setCurrentStep(6); mainRef.current?.scrollTo({ top: 0 }); }}>
              {descripcion.trim() ? (
                <p className="text-sm text-muted-foreground line-clamp-3">{descripcion}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Sin descripción</p>
              )}
            </SummarySection>

            <SummarySection title="Logística y disponibilidad" onEdit={() => { setCurrentStep(7); mainRef.current?.scrollTo({ top: 0 }); }}>
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

            <SummarySection title="Plan elegido" onEdit={() => { setCurrentStep(8); mainRef.current?.scrollTo({ top: 0 }); }}>
              {selectedPlan ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{selectedPlan === "acompanado" ? "Acompañado" : selectedPlan === "experiencia" ? "Experiencia mob" : "Básico"}</p>
                    <p className="text-sm font-medium text-foreground">{pricingCost[selectedPlan]}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">El costo se cobra únicamente cuando la operación se concreta.</p>
                </div>
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
          <button onClick={() => router.push("/")}>
            <img src={mobLogo} alt="MOB" className="h-6" />
          </button>
          <div className="flex items-center gap-3">
            <AnimateHeight show={isSaving && !isSavingAndExiting}>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Guardando...
              </span>
            </AnimateHeight>
            <button
              onClick={handleSaveAndExit}
              disabled={isSavingAndExiting}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {isSavingAndExiting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Guardando...
                </span>
              ) : (
                isEditMode ? "Cancelar" : !isAuthenticated || currentStep === 1 || showInlineAuth ? "Salir" : "Guardar y salir"
              )}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      {/* Content — scrollable area between sticky header and footer */}
      <main ref={mainRef} className="flex-1 overflow-y-auto">
        <div className={cn(
          "container py-6 sm:py-12",
          currentStep === 1 || showInlineAuth ? "min-h-full flex flex-col justify-center" : "min-h-[700px]"
        )}>
          {showInlineAuth ? (
            <div className="max-w-sm mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold">
                  Creá tu cuenta para continuar
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Necesitás una cuenta para publicar tu propiedad
                </p>
              </div>

              {(authLocalError || authError) && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl text-center">
                  {authLocalError || authError}
                </div>
              )}

              <AnimateHeight show={authStep === "initial"}>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl font-medium justify-center gap-3"
                    onClick={handleInlineGoogleAuth}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuar con Google
                  </Button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-sm text-muted-foreground">o</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <form onSubmit={handleInlineEmailContinue} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Ingresá tu e-mail"
                      value={authEmail}
                      onChange={(e) => { setAuthEmail(e.target.value); setAuthLocalError(null); }}
                      required
                      autoComplete="email"
                      spellCheck={false}
                      className="h-12 rounded-xl"
                    />
                    <Button
                      type="submit"
                      className="w-full h-12 rounded-xl font-semibold"
                      disabled={authSubmitting}
                    >
                      {authSubmitting ? "Verificando..." : "Continuar con e-mail"}
                    </Button>
                  </form>
                </div>
              </AnimateHeight>

              <AnimateHeight show={authStep === "password"}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="email"
                      value={authEmail}
                      disabled
                      className="h-12 rounded-xl flex-1 opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => { setAuthStep("initial"); setAuthPassword(""); setAuthIsExisting(null); setAuthLocalError(null); clearError(); }}
                      className="text-sm text-primary hover:underline font-medium shrink-0"
                    >
                      Cambiar
                    </button>
                  </div>

                  <form onSubmit={handleInlinePasswordSubmit} className="space-y-4">
                    <Input
                      type="password"
                      placeholder={authIsExisting ? "Contraseña" : "Creá una contraseña"}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                      autoComplete={authIsExisting ? "current-password" : "new-password"}
                      className="h-12 rounded-xl"
                    />
                    <Button
                      type="submit"
                      className="w-full h-12 rounded-xl font-semibold"
                      disabled={authSubmitting}
                    >
                      {authSubmitting
                        ? (authIsExisting ? "Entrando..." : "Creando cuenta...")
                        : (authIsExisting ? "Entrar" : "Crear cuenta")
                      }
                    </Button>
                  </form>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { setAuthStep("initial"); setAuthPassword(""); setAuthIsExisting(null); setAuthLocalError(null); clearError(); }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ← Volver
                    </button>
                  </div>
                </div>
              </AnimateHeight>
            </div>
          ) : renderStep()}
        </div>
      </main>

      {/* Footer — always pinned to bottom */}
      <footer className="shrink-0 border-t border-border">
        <div className="container flex items-center justify-between h-20">
          {/* Back button — hidden on step 1 and draft prompt */}
          {!showDraftPrompt && (currentStep > 1 || showInlineAuth) ? (
            <Button
              variant="ghost"
              onClick={() => {
                if (showInlineAuth) {
                  setShowInlineAuth(false);
                  setAuthStep("initial");
                  setAuthEmail("");
                  setAuthPassword("");
                  setAuthLocalError(null);
                  clearError();
                } else {
                  handleBack();
                }
              }}
              className="rounded-full px-6 h-12"
            >
              Atrás
            </Button>
          ) : (
            <div />
          )}

          {/* Forward / submit button */}
          {showDraftPrompt || showInlineAuth ? null : currentStep === TOTAL_STEPS ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-full px-10 h-12"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isEditMode ? "Guardando..." : "Publicando..."}
                </>
              ) : (
                isEditMode ? "Guardar cambios" : "Publicar propiedad"
              )}
            </Button>
          ) : currentStep === 1 && !isAuthenticated && !fromPropietarios ? (
            /* Role selection buttons for unregistered users on step 1 */
            <div className="flex items-center gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => router.push("/inmobiliarias")}
                className="flex-1 rounded-full h-12 font-semibold"
              >
                Soy inmobiliaria
              </Button>
              <Button
                onClick={() => {
                  maxStepReachedRef.current = Math.max(maxStepReachedRef.current, 2);
                  setCurrentStep(2);
                  mainRef.current?.scrollTo({ top: 0 });
                }}
                className="flex-1 rounded-full h-12 font-semibold"
              >
                Soy propietario
              </Button>
            </div>
          ) : (
            <Button onClick={handleNext} disabled={(isSaving && !draftPropertyIdRef.current) || (currentStep === 5 && isUploadingPhotos)} className="rounded-full px-10 h-12">
              {isSaving && !draftPropertyIdRef.current ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                currentStep === 1 ? "Continuar" : "Siguiente"
              )}
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
