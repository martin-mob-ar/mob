"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchFilters } from "@/contexts/SearchFiltersContext";

const PriceFilter = () => {
  const [open, setOpen] = useState(false);
  const { filters, setFilters } = useSearchFilters();
  const [priceType, setPriceType] = useState<"total" | "alquiler">("total");
  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);

  const handleApply = () => {
    setFilters({ minPrice, maxPrice });
    setOpen(false);
  };

  const getDisplayText = () => {
    if (filters.minPrice || filters.maxPrice) {
      if (filters.minPrice && filters.maxPrice) {
        return `$${Number(filters.minPrice).toLocaleString()}-$${Number(filters.maxPrice).toLocaleString()}`;
      }
      if (filters.minPrice) return `Desde $${Number(filters.minPrice).toLocaleString()}`;
      return `Hasta $${Number(filters.maxPrice).toLocaleString()}`;
    }
    return "Precio";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border hover:border-primary/30 transition-colors bg-background">
          <span className="text-sm font-medium">{getDisplayText()}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-background" align="start">
        <div className="space-y-4">
          {/* Toggle */}
          <div className="flex rounded-full border border-border p-1">
            <button
              onClick={() => setPriceType("total")}
              className={`flex-1 py-1.5 px-3 rounded-full text-sm font-medium transition-colors ${
                priceType === "total"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Valor total
            </button>
            <button
              onClick={() => setPriceType("alquiler")}
              className={`flex-1 py-1.5 px-3 rounded-full text-sm font-medium transition-colors ${
                priceType === "alquiler"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Alquiler
            </button>
          </div>

          {/* Inputs */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Mínimo</label>
              <Input
                type="number"
                placeholder="$0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Máximo</label>
              <Input
                type="number"
                placeholder="$1.000.000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={handleApply}
            className="w-full rounded-full"
          >
            Actualizar resultados
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PriceFilter;
