"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ArrowRightLeft, DollarSign } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useSearchFilters } from "@/contexts/SearchFiltersContext";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { CurrencyInput } from "@/components/ui/currency-input";

const PriceFilter = () => {
  const [open, setOpen] = useState(false);
  const { filters, setFilters } = useSearchFilters();
  const { rate: usdRate } = useExchangeRate();
  const [priceType, setPriceType] = useState<"total" | "alquiler">(filters.priceType || "total");
  const [currency, setCurrency] = useState<"ARS" | "USD">(filters.currency || "ARS");
  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);

  // Sync local state when filters change externally
  useEffect(() => {
    setCurrency(filters.currency || "ARS");
    setPriceType(filters.priceType || "total");
    setMinPrice(filters.minPrice);
    setMaxPrice(filters.maxPrice);
  }, [filters.minPrice, filters.maxPrice, filters.currency, filters.priceType]);

  // Auto-convert values when switching currency
  const handleCurrencySwitch = (newCurrency: "ARS" | "USD") => {
    if (newCurrency === currency || !usdRate) {
      setCurrency(newCurrency);
      return;
    }

    if (newCurrency === "USD" && currency === "ARS") {
      // ARS → USD: divide by rate
      setMinPrice(minPrice ? String(Math.round(parseFloat(minPrice) / usdRate)) : "");
      setMaxPrice(maxPrice ? String(Math.round(parseFloat(maxPrice) / usdRate)) : "");
    } else {
      // USD → ARS: multiply by rate
      setMinPrice(minPrice ? String(Math.round(parseFloat(minPrice) * usdRate)) : "");
      setMaxPrice(maxPrice ? String(Math.round(parseFloat(maxPrice) * usdRate)) : "");
    }
    setCurrency(newCurrency);
  };

  const handleApply = () => {
    let min = minPrice;
    let max = maxPrice;
    // Auto-swap if min > max
    if (min && max && parseInt(min) > parseInt(max)) {
      [min, max] = [max, min];
    }
    if (min !== filters.minPrice || max !== filters.maxPrice || priceType !== filters.priceType || currency !== filters.currency) {
      setFilters({ minPrice: min, maxPrice: max, priceType, currency });
    }
    setOpen(false);
  };

  const handleClear = () => {
    setMinPrice("");
    setMaxPrice("");
    setCurrency("ARS");
    setPriceType("total");
    setFilters({ minPrice: "", maxPrice: "", priceType: "total", currency: "ARS" });
    setOpen(false);
  };

  const hasActiveFilter = filters.minPrice || filters.maxPrice;

  const getDisplayText = () => {
    if (filters.minPrice || filters.maxPrice) {
      const displayCurrency = filters.currency || "ARS";
      const sym = displayCurrency === "USD" ? "USD " : "$";
      const fmt = (v: string) => {
        const n = Number(v);
        if (n >= 1_000_000_000) return `${sym}${(n / 1_000_000_000).toLocaleString("es-AR", { maximumFractionDigits: 1 })}B`;
        if (n >= 1_000_000) return `${sym}${(n / 1_000_000).toLocaleString("es-AR", { maximumFractionDigits: 1 })}M`;
        if (n >= 1_000) return `${sym}${(n / 1_000).toLocaleString("es-AR", { maximumFractionDigits: 0 })}K`;
        return `${sym}${n.toLocaleString("es-AR")}`;
      };
      if (filters.minPrice && filters.maxPrice) return `${fmt(filters.minPrice)} - ${fmt(filters.maxPrice)}`;
      if (filters.minPrice) return `Desde ${fmt(filters.minPrice)}`;
      if (filters.maxPrice) return `Hasta ${fmt(filters.maxPrice)}`;
    }
    return "Precio";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border hover:border-primary/30 transition-colors bg-background">
          <DollarSign className="h-4 w-4" />
          <span className="text-sm font-medium">{getDisplayText()}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-5 bg-background" align="start">
        <div className="space-y-4">
          {/* Price Type Toggle */}
          <div className="flex rounded-full border border-border p-1 bg-muted/30">
            <button
              onClick={() => setPriceType("total")}
              className={`flex-1 py-1.5 px-3 rounded-full text-sm font-medium transition-all ${
                priceType === "total"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Precio total
            </button>
            <button
              onClick={() => setPriceType("alquiler")}
              className={`flex-1 py-1.5 px-3 rounded-full text-sm font-medium transition-all ${
                priceType === "alquiler"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Alquiler
            </button>
          </div>

          {/* Currency Toggle */}
          <div className="flex rounded-full border border-border p-1 bg-muted/30">
            <button
              onClick={() => handleCurrencySwitch("ARS")}
              className={`flex-1 py-1.5 px-3 rounded-full text-sm font-medium transition-all ${
                currency === "ARS"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pesos
            </button>
            <button
              onClick={() => handleCurrencySwitch("USD")}
              className={`flex-1 py-1.5 px-3 rounded-full text-sm font-medium transition-all ${
                currency === "USD"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dólares
            </button>
          </div>

          {/* Exchange rate badge */}
          {currency === "USD" && usdRate && (
            <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-muted/50 text-xs text-muted-foreground">
              <ArrowRightLeft className="h-3 w-3" />
              <span>1 USD = <span className="font-semibold text-foreground">${usdRate.toLocaleString("es-AR")}</span> ARS</span>
            </div>
          )}

          {/* Inputs */}
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Mínimo</label>
              <CurrencyInput
                value={minPrice}
                onChange={setMinPrice}
                currency={currency}
                placeholder={currency === "USD" ? "USD 0" : "$ 0"}
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Máximo</label>
              <CurrencyInput
                value={maxPrice}
                onChange={setMaxPrice}
                currency={currency}
                placeholder={currency === "USD" ? "USD 1.000" : "$ 1.000.000"}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {hasActiveFilter && (
              <Button
                variant="outline"
                onClick={handleClear}
                className="rounded-full h-10 font-medium px-5"
              >
                Limpiar
              </Button>
            )}
            <Button
              onClick={handleApply}
              className="flex-1 rounded-full h-10 font-medium"
            >
              Actualizar resultados
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PriceFilter;
