"use client";

import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

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

const SearchBar = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [dormitoriosMin, setDormitoriosMin] = useState<string>("sin-minimo");
  const [dormitoriosMax, setDormitoriosMax] = useState<string>("sin-minimo");
  const [ambientesMin, setAmbientesMin] = useState<string>("sin-minimo");
  const [ambientesMax, setAmbientesMax] = useState<string>("sin-minimo");

  const handleSearch = () => {
    router.push("/buscar");
  };

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

  const RoomsPopoverContent = ({ widthClass = "w-80" }: { widthClass?: string }) => (
    <PopoverContent className={`${widthClass} p-4 bg-background z-50`} align="center">
      <div className="space-y-5">
        {/* Dormitorios */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-3">Dormitorios</label>
          <div className="flex gap-3">
            <Select value={dormitoriosMin} onValueChange={setDormitoriosMin}>
              <SelectTrigger className="flex-1 rounded-xl h-11">
                <SelectValue placeholder="Sin mínimo" />
              </SelectTrigger>
              <SelectContent className="bg-background z-[100]">
                {dormitoriosOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dormitoriosMax} onValueChange={setDormitoriosMax}>
              <SelectTrigger className="flex-1 rounded-xl h-11">
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
              <SelectTrigger className="flex-1 rounded-xl h-11">
                <SelectValue placeholder="Sin mínimo" />
              </SelectTrigger>
              <SelectContent className="bg-background z-[100]">
                {ambientesOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ambientesMax} onValueChange={setAmbientesMax}>
              <SelectTrigger className="flex-1 rounded-xl h-11">
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
            onClick={() => setRoomsOpen(false)}
            className="rounded-xl px-6"
          >
            Ver resultados
          </Button>
        </div>
      </div>
    </PopoverContent>
  );

  // Desktop Layout
  if (!isMobile) {
    return (
      <div className="w-full max-w-4xl mx-auto search-bar-mob">
        <div className="flex items-center p-2 bg-card rounded-full border border-border shadow-md">
          <div className="flex-1 grid grid-cols-3 divide-x divide-border">
            <div className="px-6 py-3">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ubicación
              </label>
              <input
                type="text"
                placeholder="Provincia, barrio..."
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none mt-1"
              />
            </div>
            
            <div className="px-6 py-3 relative">
              <Popover open={roomsOpen} onOpenChange={setRoomsOpen} modal={true}>
                <PopoverTrigger asChild>
                  <div className="cursor-pointer">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Dormitorios
                    </label>
                    <button type="button" className="w-full flex items-center justify-between text-foreground mt-1">
                      <span>{getRoomsLabel()}</span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${roomsOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </PopoverTrigger>
                <RoomsPopoverContent widthClass="w-80" />
              </Popover>
            </div>
            
            <div className="px-6 py-3">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Precio (Alq + Exp)
              </label>
              <input
                type="text"
                placeholder="$ 800.000"
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none mt-1"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSearch}
            size="icon" 
            className="h-12 w-12 rounded-full flex-shrink-0"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Mobile Layout
  return (
    <div className="w-full px-4 box-border">
      <div className="bg-background border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-border">
          {/* Ubicación */}
          <div className="px-4 py-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Ubicación
            </label>
            <input
              type="text"
              placeholder="Provincia, barrio..."
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none mt-1 text-base"
            />
          </div>
          
          {/* Dormitorios */}
          <div className="px-4 py-3">
            <Popover open={roomsOpen} onOpenChange={setRoomsOpen} modal={true}>
              <PopoverTrigger asChild>
                <div className="cursor-pointer">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Dormitorios
                  </label>
                  <button type="button" className="w-full flex items-center justify-between text-foreground mt-1">
                    <span className="text-base">{getRoomsLabel()}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${roomsOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </PopoverTrigger>
              <RoomsPopoverContent widthClass="w-[calc(100vw-2rem)] max-w-sm" />
            </Popover>
          </div>
          
          {/* Precio */}
          <div className="px-4 py-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Precio (Alq + Exp)
            </label>
            <input
              type="text"
              placeholder="$ 800.000"
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none mt-1 text-base"
            />
          </div>
        </div>
        
        {/* Search Button - Full width on mobile */}
        <div className="p-4 pt-2">
          <Button 
            onClick={handleSearch}
            className="w-full h-12 rounded-xl font-semibold text-base"
          >
            <Search className="h-5 w-5 mr-2" />
            Buscar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
