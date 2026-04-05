"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, Search, ChevronDown, MapPin, Menu, BadgeCheck, ArrowRight, Loader2, ArrowRightLeft, Building2, Heart, Home, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublishModal from "./PublishModal";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useLocationSearch, LocationResult } from "@/hooks/useLocationSearch";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  sticky?: boolean;
  landingCta?: string;
}

const Header = ({ hideSearch = false, sticky = true, landingCta }: HeaderProps) => {
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    isAuthenticated,
    isLoading: authLoading,
    user,
    logout,
    openAuthModal
  } = useAuth();
  const isVerified = user?.isVerified ?? false;
  const pathname = usePathname();
  const isHome = pathname === "/";

  // User role detection for dynamic "Gestión" label
  const [userRoles, setUserRoles] = useState<{ hasProperties: boolean; hasTenantOps: boolean }>({ hasProperties: false, hasTenantOps: false });

  useEffect(() => {
    if (!isAuthenticated || !user?.publicUserId) {
      setUserRoles({ hasProperties: false, hasTenantOps: false });
      return;
    }
    const supabase = createClient();
    const publicUserId = user.publicUserId;
    let cancelled = false;
    const checkRoles = async () => {
      const [propResult, tenantResult] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("user_id", publicUserId).eq("status", 2),
        supabase.from("operaciones").select("id", { count: "exact", head: true }).eq("tenant_id", publicUserId).in("status", ["available", "rented"]),
      ]);
      if (cancelled) return;
      setUserRoles({
        hasProperties: (propResult.count ?? 0) > 0,
        hasTenantOps: (tenantResult.count ?? 0) > 0,
      });
    };
    checkRoles();
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.publicUserId]);

  // Returns label + icon for gestión link, or null if neither/both roles
  const getGestionInfo = (): { label: string; icon: typeof Building2 } | null => {
    if (userRoles.hasProperties && userRoles.hasTenantOps) return null;
    if (userRoles.hasProperties) return { label: "Mis propiedades", icon: Building2 };
    if (userRoles.hasTenantOps) return { label: "Mis alquileres", icon: Home };
    return null;
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

  // Landing CTA scroll detection — change button color when scrolled past hero
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    if (!landingCta) return;
    const handleScroll = () => {
      const hero = document.querySelector('.landing-hero');
      if (hero) {
        const rect = hero.getBoundingClientRect();
        setScrolledPastHero(rect.bottom < 80);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [landingCta]);

  const handleLandingCTA = () => {
    if (pathname === "/propietarios") {
      router.push("/subir-propiedad?from=propietarios");
      return;
    }
    if (isAuthenticated) {
      router.push("/perfil");
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set("redirect", "/perfil");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    openAuthModal();
  };

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
    // Build extra filter params
    const params = new URLSearchParams();
    if (dormitoriosMin !== "sin-minimo") params.set("minRooms", dormitoriosMin.replace("+", ""));
    if (dormitoriosMax !== "sin-minimo") params.set("maxRooms", dormitoriosMax.replace("+", ""));
    if (ambientesMin !== "sin-minimo") params.set("minAmbientes", ambientesMin.replace("+", ""));
    if (ambientesMax !== "sin-minimo") params.set("maxAmbientes", ambientesMax.replace("+", ""));
    const priceARS = getPriceARS();
    if (priceARS.min) params.set("minPrice", priceARS.min);
    if (priceARS.max) params.set("maxPrice", priceARS.max);
    const hasExtraFilters = params.size > 0;
    const qs = params.toString();

    // Use SEO-friendly URL when a location with slug data is selected
    if (headerSelectedLocation?.slug && headerSelectedLocation.stateSlug) {
      if (headerSelectedLocation.type === "state") {
        const base = `/alquileres/${headerSelectedLocation.stateSlug}`;
        router.push(qs ? `${base}?${qs}` : base);
      } else {
        const base = `/alquileres/${headerSelectedLocation.stateSlug}/${headerSelectedLocation.slug}`;
        router.push(qs ? `${base}?${qs}` : base);
      }
      return;
    }

    // Fallback: query-param search (free-text search without slug data)
    if (headerSelectedLocation) {
      params.set("location", headerSelectedLocation.name);
      if (headerSelectedLocation.type === "state") {
        params.set("stateId", String(headerSelectedLocation.id));
      } else {
        params.set("locationId", String(headerSelectedLocation.id));
      }
    } else if (headerLocationQuery.trim()) {
      params.set("location", headerLocationQuery.trim());
    }
    const fallbackQs = params.toString();
    router.push(fallbackQs ? `/alquileres?${fallbackQs}` : "/alquileres");
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
    const sym = cur === "USD" ? "USD" : "$";
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
      <header className={`${sticky ? 'sticky top-0' : 'relative'} z-50 w-full border-b border-border/40 bg-background`}>
        <div className="container relative flex h-16 md:h-20 items-center gap-4">
          <div className="flex items-center xl:flex-1">
            <Link href="/" className="flex items-center shrink-0">
              <Image alt="mob" width={112} height={44} className="h-7 md:h-11 w-auto" src={mobLogo} />
            </Link>
          </div>

          {/* Compact Search Bar - Desktop only - Completely unmount on home until scrolled */}
          {!hideSearch && (!isHome || showHeaderSearch) && (
            <div className={`hidden min-[900px]:flex items-center justify-center flex-1 min-w-0 transition-all duration-300 ${isHome && !showHeaderSearch ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex items-center h-10 rounded-full border border-border bg-background shadow-sm">
                <div className="flex items-center gap-2 px-4 border-r border-border flex-1 relative">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    ref={headerLocationInputRef}
                    type="text"
                    placeholder="Ciudad, barrio..."
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
                        <label className="font-display font-semibold text-sm uppercase tracking-wider text-foreground block mb-3">Dormitorios</label>
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
                        <label className="font-display font-semibold text-sm uppercase tracking-wider text-foreground block mb-3">Ambientes</label>
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
                
                <button onClick={handleHeaderSearch} aria-label="Buscar propiedades" className="h-8 w-8 m-1 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Search className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1 lg:gap-3 shrink-0 ml-auto xl:flex-1 xl:justify-end xl:ml-0">
            {authLoading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-40 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
            ) : isAuthenticated ? (
              <>
                {landingCta ? (
                  <Button
                    variant={scrolledPastHero ? "default" : "ghost"}
                    onClick={handleLandingCTA}
                    className="rounded-full px-6 font-bold transition-colors duration-300 gap-2"
                  >
                    {landingCta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={() => window.location.href = '/subir-propiedad'} className="rounded-full px-6 font-bold">
                    Publicar<span className="hidden min-[1150px]:inline"> mi propiedad</span>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="h-9 w-9 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                      aria-label="Menú de usuario"
                    >
                      <Avatar className="h-9 w-9">
                        {user?.avatarUrl && (
                          <AvatarImage
                            src={user.avatarUrl}
                            alt={user.name || "Avatar"}
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                          {(user?.name || user?.email)?.charAt(0).toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-background">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {isVerified ? (
                      <>
                        <div className="p-3">
                          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <BadgeCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground">Perfil verificado</p>
                              <p className="text-xs text-muted-foreground">Validación por Mob</p>
                            </div>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                      </>
                    ) : (
                      <>
                        <Link href="/verificate" className="block p-3">
                          <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/30 hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors">
                            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                              <BadgeCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground">No verificado</p>
                              <p className="text-xs text-amber-600 dark:text-amber-400">Verificá tu perfil</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          </div>
                        </Link>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/perfil">
                        <User className="mr-2 h-4 w-4" />
                        Mi perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/mis-busquedas">
                        <Heart className="mr-2 h-4 w-4" />
                        Mis búsquedas
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {landingCta ? (
                  <Button
                    variant={scrolledPastHero ? "default" : "ghost"}
                    onClick={handleLandingCTA}
                    className="rounded-full px-6 font-bold transition-colors duration-300 gap-2"
                  >
                    {landingCta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    {(hideSearch || (isHome && !showHeaderSearch)) && (
                      <>
                        <Button
                          variant="ghost"
                          className="rounded-full px-3 lg:px-5 font-medium text-muted-foreground hover:text-foreground gap-1.5 lg:gap-2"
                          asChild
                        >
                          <Link href="/propietarios">
                            <Home className="h-4 w-4" />
                            Soy propietario
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          className="rounded-full px-3 lg:px-5 font-medium text-muted-foreground hover:text-foreground gap-1.5 lg:gap-2"
                          asChild
                        >
                          <Link href="/inmobiliarias">
                            <Building2 className="h-4 w-4" />
                            Soy inmobiliaria
                          </Link>
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      className="rounded-full px-3 lg:px-5 font-medium text-muted-foreground hover:text-foreground gap-1.5 lg:gap-2"
                      asChild
                    >
                      <Link href="/subir-propiedad">
                        <Megaphone className="h-4 w-4" />
                        Publicá gratis
                      </Link>
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={openAuthModal}
                  className="rounded-full px-3 lg:px-5 font-medium gap-1.5 lg:gap-2"
                >
                  <User className="h-4 w-4" />
                  Iniciá sesión<span className="hidden min-[1080px]:inline"> o registrate</span>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden ml-auto flex items-center gap-2">
            {!authLoading && !isAuthenticated && !landingCta && (
              <Button variant="ghost" size="sm" className="rounded-full px-4 h-9 font-bold text-sm" asChild>
                <Link href="/subir-propiedad">
                  Publicá
                </Link>
              </Button>
            )}
            <Drawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} shouldScaleBackground={false}>
              <DrawerTrigger asChild>
                <button className="relative p-2" aria-label="Abrir menú">
                  {!authLoading && isAuthenticated ? (
                    <div className="relative">
                      <Menu className="h-6 w-6 text-foreground" />
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" aria-hidden="true" />
                    </div>
                  ) : (
                    <Menu className="h-6 w-6 text-foreground" />
                  )}
                </button>
              </DrawerTrigger>
              <DrawerContent className="rounded-t-3xl px-6 pb-8">
                <DrawerTitle className="sr-only">Menu</DrawerTitle>
                <div className="flex flex-col gap-4">
                  {authLoading ? (
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ) : isAuthenticated ? (
                    <>
                      {/* User identity card */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-secondary/30 rounded-xl">
                        <Avatar className="h-10 w-10 shrink-0">
                          {user?.avatarUrl && (
                            <AvatarImage
                              src={user.avatarUrl}
                              alt={user.name || "Avatar"}
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                            {(user?.name || user?.email)?.charAt(0).toUpperCase() ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </div>

                      <Button
                        onClick={() => { setMobileMenuOpen(false); if (landingCta) { router.push("/perfil"); } else { window.location.href = '/subir-propiedad'; } }}
                        className="w-full rounded-full h-12 font-bold text-base"
                      >
                        {landingCta || "Publicar mi propiedad"}
                      </Button>

                      {/* CTA de verificación mobile */}
                      {isVerified ? (
                        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <BadgeCheck className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">Perfil verificado</p>
                            <p className="text-xs text-muted-foreground">Validación por Mob</p>
                          </div>
                        </div>
                      ) : (
                        <Link href="/verificate" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/30 hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors">
                          <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                            <BadgeCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">No verificado</p>
                            <p className="text-xs text-amber-600 dark:text-amber-400">Verificá tu perfil</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        </Link>
                      )}

                      <div className="border-t border-border" />

                      {/* Alquilá online section */}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pb-1">Alquilá online</p>
                        <Button
                          variant="ghost"
                          className="w-full justify-start rounded-xl h-12 font-medium text-foreground gap-3 px-4"
                          asChild
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Link href="/alquileres">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            Buscar propiedades
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start rounded-xl h-12 font-medium text-foreground gap-3 px-4"
                          asChild
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Link href="/mis-busquedas">
                            <Heart className="h-4 w-4 text-muted-foreground" />
                            Favoritos
                          </Link>
                        </Button>
                      </div>

                      <div className="border-t border-border" />

                      {/* Mi cuenta section */}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pb-1">Mi cuenta</p>
                        <Button
                          variant="ghost"
                          className="w-full justify-start rounded-xl h-12 font-medium text-foreground gap-3 px-4"
                          asChild
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Link href="/perfil">
                            <User className="h-4 w-4 text-muted-foreground" />
                            Mi perfil
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => { logout(); setMobileMenuOpen(false); }}
                          className="w-full justify-start rounded-xl h-12 font-medium text-muted-foreground gap-3 px-4"
                        >
                          <LogOut className="h-4 w-4" />
                          Cerrar sesión
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center py-2">
                        <p className="text-base font-semibold text-foreground">Bienvenido a mob</p>

                      </div>
                      {landingCta ? (
                        <>
                          <Button
                            className="w-full rounded-full h-12 font-bold text-base"
                            onClick={() => { setMobileMenuOpen(false); handleLandingCTA(); }}
                          >
                            {landingCta}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => { setMobileMenuOpen(false); openAuthModal(); }}
                            className="w-full rounded-full h-12 font-medium"
                          >
                            Iniciá sesión o registrate
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            className="w-full rounded-full h-12 font-bold text-base"
                            onClick={() => { setMobileMenuOpen(false); openAuthModal(); }}
                          >
                            Iniciá sesión o registrate
                          </Button>

                          {/* Alquilá online section */}
                          <div className="space-y-1 pt-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pb-1">Alquilá online</p>
                            <Button
                              variant="ghost"
                              className="w-full justify-start rounded-xl h-12 font-medium text-foreground gap-3 px-4"
                              asChild
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Link href="/alquileres">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                Buscar propiedades
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start rounded-xl h-12 font-medium text-foreground gap-3 px-4"
                              asChild
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Link href="/mis-busquedas">
                                <Heart className="h-4 w-4 text-muted-foreground" />
                                Favoritos
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start rounded-xl h-12 font-medium text-foreground gap-3 px-4"
                              asChild
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Link href="/verificate">
                                <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                                Verificate
                              </Link>
                            </Button>
                          </div>

                          <div className="border-t border-border" />

                          {/* Publicá gratis section */}
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pb-1">Publicá gratis</p>
                            <Button
                              variant="ghost"
                              className="w-full justify-start rounded-xl h-12 font-medium text-foreground gap-3 px-4"
                              asChild
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Link href="/propietarios">
                                <Home className="h-4 w-4 text-muted-foreground" />
                                Soy propietario
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start rounded-xl h-12 font-medium text-foreground gap-3 px-4"
                              asChild
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Link href="/inmobiliarias">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                Soy inmobiliaria
                              </Link>
                            </Button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </header>

      <PublishModal open={showPublishModal} onOpenChange={setShowPublishModal} />
    </>;
};
export default Header;