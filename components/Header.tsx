"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, Search, ChevronDown, MapPin, Menu, BadgeCheck, ArrowRight, Loader2, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublishModal from "./PublishModal";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMockUser } from "@/contexts/MockUserContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLocationSearch, LocationResult } from "@/hooks/useLocationSearch";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { CurrencyInput } from "@/components/ui/currency-input";
import { createClient } from "@/lib/supabase/client";
const mobLogo = "/assets/mob-logo-new.png";

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

interface HeaderProps {
  hideSearch?: boolean;
}

const Header = ({ hideSearch = false }: HeaderProps) => {
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    isAuthenticated,
    user,
    logout,
    openAuthModal
  } = useAuth();
  const { isVerified } = useMockUser();
  const pathname = usePathname();
  const isHome = pathname === "/";

  // User role detection for dynamic "Gestión" label
  const [userRoles, setUserRoles] = useState<{ hasProperties: boolean; hasTenantOps: boolean }>({ hasProperties: false, hasTenantOps: false });

  useEffect(() => {
    if (!isAuthenticated) {
      setUserRoles({ hasProperties: false, hasTenantOps: false });
      return;
    }
    const supabase = createClient();
    const checkRoles = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const [propResult, tenantResult] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("user_id", authUser.id),
        supabase.from("operaciones").select("id", { count: "exact", head: true }).eq("tenant_id", authUser.id),
      ]);
      setUserRoles({
        hasProperties: (propResult.count ?? 0) > 0,
        hasTenantOps: (tenantResult.count ?? 0) > 0,
      });
    };
    checkRoles();
  }, [isAuthenticated]);

  const getGestionLabel = () => {
    if (userRoles.hasProperties && userRoles.hasTenantOps) return "Gestionar";
    if (userRoles.hasProperties) return "Gestionar propiedades";
    if (userRoles.hasTenantOps) return "Gestionar alquileres";
    return "Gestión";
  };

  // Search bar visibility on scroll
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);

  // Rooms dropdown state
  const [headerRoomsOpen, setHeaderRoomsOpen] = useState(false);
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

  // Location search state
  const router = useRouter();
  const [headerLocationQuery, setHeaderLocationQuery] = useState("");
  const [headerSelectedLocation, setHeaderSelectedLocation] = useState<LocationResult | null>(null);
  const [showHeaderLocationDropdown, setShowHeaderLocationDropdown] = useState(false);
  const headerLocationInputRef = useRef<HTMLInputElement>(null);
  const headerLocationDropdownRef = useRef<HTMLDivElement>(null);
  const { results: headerLocationResults, isLoading: headerLocationLoading } = useLocationSearch(headerLocationQuery, {
    enabled: !headerSelectedLocation && showHeaderLocationDropdown,
  });

  // Price popover state
  const [priceOpen, setPriceOpen] = useState(false);
  const [priceType, setPriceType] = useState<"total" | "alquiler">("total");
  const [priceCurrency, setPriceCurrency] = useState<"ARS" | "USD">("ARS");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const { rate: usdRate } = useExchangeRate();

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

  // Handle scroll to show/hide header search bar
  useEffect(() => {
    if (!isHome) return;
    const handleScroll = () => {
      const searchBar = document.querySelector('.search-bar-mob');
      if (searchBar) {
        const rect = searchBar.getBoundingClientRect();
        setShowHeaderSearch(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  // Close header location dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        headerLocationDropdownRef.current &&
        !headerLocationDropdownRef.current.contains(e.target as Node) &&
        headerLocationInputRef.current &&
        !headerLocationInputRef.current.contains(e.target as Node)
      ) {
        setShowHeaderLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHeaderLocationSelect = (loc: LocationResult) => {
    setHeaderSelectedLocation(loc);
    setHeaderLocationQuery(loc.name);
    setShowHeaderLocationDropdown(false);
  };

  const handleHeaderLocationInputChange = (value: string) => {
    setHeaderLocationQuery(value);
    setHeaderSelectedLocation(null);
    setShowHeaderLocationDropdown(value.length >= 2);
  };

  const handleHeaderSearch = () => {
    const params = new URLSearchParams();
    if (headerSelectedLocation) {
      params.set("location", headerSelectedLocation.name);
      params.set("locationId", String(headerSelectedLocation.id));
    } else if (headerLocationQuery.trim()) {
      params.set("location", headerLocationQuery.trim());
    }
    if (dormitoriosMin !== "sin-minimo") params.set("minRooms", dormitoriosMin.replace("+", ""));
    if (dormitoriosMax !== "sin-minimo") params.set("maxRooms", dormitoriosMax.replace("+", ""));
    if (ambientesMin !== "sin-minimo") params.set("minAmbientes", ambientesMin.replace("+", ""));
    if (ambientesMax !== "sin-minimo") params.set("maxAmbientes", ambientesMax.replace("+", ""));
    const priceARS = getPriceARS();
    if (priceARS.min) params.set("minPrice", priceARS.min);
    if (priceARS.max) params.set("maxPrice", priceARS.max);
    const qs = params.toString();
    router.push(qs ? `/buscar?${qs}` : "/buscar");
  };

  const handlePriceCurrencySwitch = (newCurrency: "ARS" | "USD") => {
    if (newCurrency === priceCurrency || !usdRate) {
      setPriceCurrency(newCurrency);
      return;
    }
    if (newCurrency === "USD") {
      setMinPrice(minPrice ? String(Math.round(parseFloat(minPrice) / usdRate)) : "");
      setMaxPrice(maxPrice ? String(Math.round(parseFloat(maxPrice) / usdRate)) : "");
    } else {
      setMinPrice(minPrice ? String(Math.round(parseFloat(minPrice) * usdRate)) : "");
      setMaxPrice(maxPrice ? String(Math.round(parseFloat(maxPrice) * usdRate)) : "");
    }
    setPriceCurrency(newCurrency);
  };

  // Abbreviate large numbers: 1500000 → "$1,5M", 500000 → "$500K"
  const abbreviatePrice = (val: string, cur: "ARS" | "USD"): string => {
    const n = parseInt(val);
    if (isNaN(n)) return "";
    const sym = cur === "USD" ? "US$" : "$";
    if (n >= 1_000_000_000) return `${sym}${(n / 1_000_000_000).toLocaleString("es-AR", { maximumFractionDigits: 1 })}B`;
    if (n >= 1_000_000) return `${sym}${(n / 1_000_000).toLocaleString("es-AR", { maximumFractionDigits: 1 })}M`;
    if (n >= 1_000) return `${sym}${(n / 1_000).toLocaleString("es-AR", { maximumFractionDigits: 0 })}K`;
    return `${sym}${n.toLocaleString("es-AR")}`;
  };

  // Get min/max in ARS for the search (auto-swaps if min > max)
  const getPriceARS = () => {
    let min = minPrice;
    let max = maxPrice;
    if (priceCurrency === "USD" && usdRate) {
      if (min) min = String(Math.round(parseFloat(min) * usdRate));
      if (max) max = String(Math.round(parseFloat(max) * usdRate));
    }
    if (min && max && parseInt(min) > parseInt(max)) {
      [min, max] = [max, min];
    }
    return { min, max };
  };

  const getPriceLabel = () => {
    if (minPrice || maxPrice) {
      const abbrevMin = minPrice ? abbreviatePrice(minPrice, priceCurrency) : "";
      const abbrevMax = maxPrice ? abbreviatePrice(maxPrice, priceCurrency) : "";
      if (abbrevMin && abbrevMax) return `${abbrevMin} - ${abbrevMax}`;
      if (abbrevMin) return `Desde ${abbrevMin}`;
      return `Hasta ${abbrevMax}`;
    }
    return "Precio";
  };

  const handlePublishClick = () => {
    setMobileMenuOpen(false);
    setShowPublishModal(true);
  };

  return <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container relative flex h-14 md:h-16 items-center gap-4">
          <Link href="/" className="flex items-center shrink-0">
            <Image alt="mob" width={112} height={28} className="h-6 md:h-7 w-auto" src={mobLogo} />
          </Link>

          {/* Compact Search Bar - Desktop only - Completely unmount on home until scrolled */}
          {!hideSearch && (!isHome || showHeaderSearch) && (
            <div className={`hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2 transition-all duration-300 ${isHome && !showHeaderSearch ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex items-center h-10 rounded-full border border-border bg-background shadow-sm">
                <div className="flex items-center gap-2 px-4 border-r border-border flex-1 relative">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    ref={headerLocationInputRef}
                    type="text"
                    placeholder="Provincia, barrio..."
                    value={headerLocationQuery}
                    onChange={(e) => handleHeaderLocationInputChange(e.target.value)}
                    onFocus={() => headerLocationQuery.length >= 2 && !headerSelectedLocation && setShowHeaderLocationDropdown(true)}
                    onKeyDown={(e) => e.key === "Enter" && handleHeaderSearch()}
                    className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                  />
                  {showHeaderLocationDropdown && (
                    <div
                      ref={headerLocationDropdownRef}
                      className="absolute left-0 right-0 top-full mt-2 bg-background border border-border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto min-w-[280px]"
                    >
                      {headerLocationLoading ? (
                        <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Buscando...
                        </div>
                      ) : headerLocationResults.length > 0 ? (
                        headerLocationResults.map((loc) => (
                          <button
                            key={loc.id}
                            onClick={() => handleHeaderLocationSelect(loc)}
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
                      ) : headerLocationQuery.length >= 2 ? (
                        <div className="px-4 py-3 text-sm text-muted-foreground">
                          No se encontraron ubicaciones
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
                
                <Popover open={headerRoomsOpen} onOpenChange={setHeaderRoomsOpen} modal={true}>
                  <PopoverTrigger asChild>
                    <button type="button" className="flex items-center gap-1 px-3 h-10 text-sm text-muted-foreground hover:text-foreground border-r border-border">
                      <span className={dormitoriosMin !== "sin-minimo" || dormitoriosMax !== "sin-minimo" || ambientesMin !== "sin-minimo" || ambientesMax !== "sin-minimo" ? "text-foreground" : ""}>
                        {getRoomsLabel()}
                      </span>
                      <ChevronDown className={`h-3 w-3 transition-transform ${headerRoomsOpen ? "rotate-180" : ""}`} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 bg-background z-50" align="center">
                    <div className="space-y-5">
                      {/* Dormitorios */}
                      <div>
                        <label className="text-sm font-semibold text-foreground block mb-3">Dormitorios</label>
                        <div className="flex gap-3">
                          <Select value={dormitoriosMin} onValueChange={setDormitoriosMin}>
                            <SelectTrigger className="flex-1 rounded-xl h-10">
                              <SelectValue placeholder="Sin mínimo" />
                            </SelectTrigger>
                            <SelectContent className="bg-background z-[100]">
                              {dormitoriosOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={dormitoriosMax} onValueChange={setDormitoriosMax}>
                            <SelectTrigger className="flex-1 rounded-xl h-10">
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
                            <SelectTrigger className="flex-1 rounded-xl h-10">
                              <SelectValue placeholder="Sin mínimo" />
                            </SelectTrigger>
                            <SelectContent className="bg-background z-[100]">
                              {ambientesOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={ambientesMax} onValueChange={setAmbientesMax}>
                            <SelectTrigger className="flex-1 rounded-xl h-10">
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
                          onClick={() => setHeaderRoomsOpen(false)}
                          className="rounded-xl px-6"
                        >
                          Ver resultados
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Popover open={priceOpen} onOpenChange={setPriceOpen}>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1 px-3 h-10 text-sm text-muted-foreground hover:text-foreground border-r border-border">
                      <span className={minPrice || maxPrice ? "text-foreground" : ""}>
                        {getPriceLabel()}
                      </span>
                      <ChevronDown className={`h-3 w-3 transition-transform ${priceOpen ? "rotate-180" : ""}`} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[340px] p-4 bg-background z-50" align="center">
                    <div className="space-y-4">
                      {/* Valor total / Alquiler toggle */}
                      <div className="flex rounded-full border border-border p-1">
                        <button onClick={() => setPriceType("total")} className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-colors ${priceType === "total" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                          Valor total
                        </button>
                        <button onClick={() => setPriceType("alquiler")} className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-colors ${priceType === "alquiler" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                          Alquiler
                        </button>
                      </div>

                      {/* Pesos / Dólares toggle */}
                      <div className="flex rounded-full border border-border p-1">
                        <button onClick={() => handlePriceCurrencySwitch("ARS")} className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-colors ${priceCurrency === "ARS" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                          Pesos
                        </button>
                        <button onClick={() => handlePriceCurrencySwitch("USD")} className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-colors ${priceCurrency === "USD" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                          Dólares
                        </button>
                      </div>

                      {/* Exchange rate badge */}
                      {usdRate && (
                        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground bg-muted/30 rounded-lg py-1.5 px-2">
                          <ArrowRightLeft className="h-3 w-3" />
                          <span>1 USD = ${usdRate.toLocaleString("es-AR")} ARS</span>
                        </div>
                      )}

                      {/* Min / Max inputs */}
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground mb-1 block">Mínimo</label>
                          <CurrencyInput
                            value={minPrice}
                            onChange={setMinPrice}
                            currency={priceCurrency}
                            placeholder={priceCurrency === "USD" ? "US$ 0" : "$ 0"}
                            className="rounded-xl h-10 text-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground mb-1 block">Máximo</label>
                          <CurrencyInput
                            value={maxPrice}
                            onChange={setMaxPrice}
                            currency={priceCurrency}
                            placeholder={priceCurrency === "USD" ? "US$ 5.000" : "$ 1.000.000"}
                            className="rounded-xl h-10 text-sm"
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <button
                          onClick={() => { setMinPrice(""); setMaxPrice(""); setPriceCurrency("ARS"); setPriceType("total"); }}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Limpiar
                        </button>
                        <Button onClick={() => setPriceOpen(false)} className="rounded-xl px-6">
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <button onClick={handleHeaderSearch} className="h-8 w-8 m-1 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors">
                  <Search className="h-4 w-4 text-primary-foreground" />
                </button>
              </div>
            </div>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0 ml-auto">
            {isAuthenticated && <Button variant="outline" className="rounded-full px-6 font-medium" asChild>
                <Link href="/gestion">{getGestionLabel()}</Link>
              </Button>}
            
            {isAuthenticated ? (
              <Button onClick={() => window.location.href = '/subir-propiedad'} className="rounded-full px-6 font-bold">
                Publicar mi propiedad
              </Button>
            ) : (
              <Button onClick={() => setShowPublishModal(true)} className="rounded-full px-6 font-bold">
                Quiero publicar
              </Button>
            )}

            {isAuthenticated ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-background">
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {user?.email}
                  </div>
                  <DropdownMenuSeparator />
                  {/* CTA de verificación si no está verificado */}
                  {!isVerified && (
                    <>
                      <div className="p-3">
                        <Link href="/verificacion" className="block">
                          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors border border-primary/10">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <BadgeCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground">Verificarme</p>
                              <p className="text-xs text-muted-foreground">Menos de 2 minutos</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                          </div>
                        </Link>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <Button variant="outline" size="icon" className="rounded-full" onClick={openAuthModal}>
                  <User className="h-5 w-5" />
              </Button>}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden ml-auto">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="p-2">
                  <Menu className="h-6 w-6 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto rounded-t-3xl px-6 pb-8 pt-6">
                <div className="flex flex-col gap-4">
                  {isAuthenticated ? (
                    <Button 
                      onClick={() => { setMobileMenuOpen(false); window.location.href = '/subir-propiedad'; }}
                      className="w-full rounded-full h-12 font-bold text-base"
                    >
                      Publicar mi propiedad
                    </Button>
                  ) : (
                    <Button 
                      onClick={handlePublishClick}
                      className="w-full rounded-full h-12 font-bold text-base"
                    >
                      Quiero publicar
                    </Button>
                  )}
                  
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-3 bg-secondary/30 rounded-xl">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                          <p className="text-xs text-muted-foreground">Mi cuenta</p>
                        </div>
                      </div>
                      
                      {/* CTA de verificación mobile */}
                      {!isVerified && (
                        <Link
                          href="/verificacion"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors border border-primary/10"
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <BadgeCheck className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">Verificarme</p>
                            <p className="text-xs text-muted-foreground">Menos de 2 minutos</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                        </Link>
                      )}
                      
                      <Button 
                        variant="outline" 
                        className="w-full rounded-full h-12 font-medium"
                        asChild
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href="/gestion">Ir a {getGestionLabel()}</Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                        className="w-full rounded-full h-12 text-muted-foreground hover:text-foreground"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar sesión
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full rounded-full h-12 font-medium"
                      onClick={() => { setMobileMenuOpen(false); openAuthModal(); }}
                    >
                        <User className="mr-2 h-4 w-4" />
                        Iniciar sesión
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <PublishModal open={showPublishModal} onOpenChange={setShowPublishModal} />
    </>;
};
export default Header;