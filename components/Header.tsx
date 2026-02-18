"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User, LogOut, Search, ChevronDown, MapPin, Menu, BadgeCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublishModal from "./PublishModal";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMockUser } from "@/contexts/MockUserContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

  // Search bar visibility on scroll
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);

  // Rooms dropdown state
  const [headerRoomsOpen, setHeaderRoomsOpen] = useState(false);
  const [dormitoriosMin, setDormitoriosMin] = useState<string>("sin-minimo");
  const [dormitoriosMax, setDormitoriosMax] = useState<string>("sin-minimo");
  const [ambientesMin, setAmbientesMin] = useState<string>("sin-minimo");
  const [ambientesMax, setAmbientesMax] = useState<string>("sin-minimo");

  // Price popover state
  const [priceOpen, setPriceOpen] = useState(false);
  const [priceType, setPriceType] = useState<"total" | "alquiler">("total");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleClearRooms = () => {
    setDormitoriosMin("sin-minimo");
    setDormitoriosMax("sin-minimo");
    setAmbientesMin("sin-minimo");
    setAmbientesMax("sin-minimo");
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

  
  const getPriceLabel = () => {
    if (minPrice || maxPrice) {
      if (minPrice && maxPrice) return `$${parseInt(minPrice).toLocaleString()} - $${parseInt(maxPrice).toLocaleString()}`;
      if (minPrice) return `Desde $${parseInt(minPrice).toLocaleString()}`;
      return `Hasta $${parseInt(maxPrice).toLocaleString()}`;
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
                <div className="flex items-center gap-2 px-4 border-r border-border flex-1">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input type="text" placeholder="Provincia, barrio..." className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground" />
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
                  <PopoverContent className="w-72 p-4 bg-background z-50" align="center">
                    <div className="space-y-4">
                      <div className="flex rounded-full border border-border p-1">
                        <button onClick={() => setPriceType("total")} className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-colors ${priceType === "total" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                          Valor total
                        </button>
                        <button onClick={() => setPriceType("alquiler")} className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-colors ${priceType === "alquiler" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                          Alquiler
                        </button>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground mb-1 block">Mínimo</label>
                          <Input type="number" placeholder="$0" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="rounded-lg h-9" />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground mb-1 block">Máximo</label>
                          <Input type="number" placeholder="$1.000.000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="rounded-lg h-9" />
                        </div>
                      </div>

                      <Button onClick={() => setPriceOpen(false)} className="w-full rounded-full h-9 text-sm">
                        Aplicar
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Link href="/buscar" className="h-8 w-8 m-1 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors">
                  <Search className="h-4 w-4 text-primary-foreground" />
                </Link>
              </div>
            </div>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0 ml-auto">
            {isAuthenticated && <Button variant="outline" className="rounded-full px-6 font-medium" asChild>
                <Link href="/gestion">Gestión</Link>
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
                        <Link href="/gestion">Ir a Gestión</Link>
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