"use client";

import Header from "@/components/Header";
import PropertyCard from "@/components/PropertyCard";
import { Property } from "@/components/PropertyCard";
import MobilePropertyCard from "@/components/MobilePropertyCard";
import MobileSearchHeader from "@/components/MobileSearchHeader";
import MobileSearchBottomActions from "@/components/MobileSearchBottomActions";
import { SlidersHorizontal, ChevronDown, ArrowUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import LocationFilter from "@/components/filters/LocationFilter";
import PriceFilter from "@/components/filters/PriceFilter";
import PropertyTypeFilter from "@/components/filters/PropertyTypeFilter";
import RoomsFilter from "@/components/filters/RoomsFilter";
import ParkingFilter from "@/components/filters/ParkingFilter";
import SurfaceFilter from "@/components/filters/SurfaceFilter";
import MoreFiltersPanel from "@/components/filters/MoreFiltersPanel";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchFiltersProvider, useSearchFilters } from "@/contexts/SearchFiltersContext";
import { usePropertyPhotos } from "@/hooks/usePropertyPhotos";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sortOptions = [
  { value: "recent", label: "Más recientes" },
  { value: "relevant", label: "Más relevantes" },
  { value: "price-low", label: "Precio: menor a mayor" },
  { value: "price-high", label: "Precio: mayor a menor" },
];

/* ───────── Skeleton card for initial loading ───────── */
function PropertyCardSkeleton({ mobile = false }: { mobile?: boolean }) {
  if (mobile) {
    return (
      <div className="rounded-xl overflow-hidden bg-card border border-border animate-pulse">
        <div className="aspect-[16/10] bg-muted" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-muted rounded-md w-3/4" />
          <div className="h-3 bg-muted rounded-md w-1/2" />
          <div className="h-5 bg-muted rounded-md w-1/3" />
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded-md w-3/4" />
        <div className="h-3 bg-muted rounded-md w-1/2" />
        <div className="flex gap-3 mt-2">
          <div className="h-3 bg-muted rounded-md w-12" />
          <div className="h-3 bg-muted rounded-md w-12" />
          <div className="h-3 bg-muted rounded-md w-12" />
        </div>
        <div className="h-5 bg-muted rounded-md w-1/3 mt-2" />
      </div>
    </div>
  );
}

function PropertyGridSkeleton({ count = 8, mobile = false }: { count?: number; mobile?: boolean }) {
  if (mobile) {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <PropertyCardSkeleton key={i} mobile />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ───────── Loading indicator for infinite scroll ───────── */
function LoadingMoreIndicator() {
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <div className="flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
      </div>
      <span className="text-sm text-muted-foreground">Cargando más propiedades</span>
    </div>
  );
}

interface SearchResultsProps {
  initialProperties?: Property[];
  initialTotal?: number;
}

const SearchResults = ({ initialProperties, initialTotal = 0 }: SearchResultsProps) => {
  return (
    <SearchFiltersProvider
      initialResults={initialProperties}
      initialTotal={initialTotal}
    >
      <SearchResultsInner />
    </SearchFiltersProvider>
  );
};

const SearchResultsInner = () => {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showBottomActions, setShowBottomActions] = useState(true);
  const { filters, setFilter, results, total, isLoading, isLoadingMore, hasMore, loadMore } = useSearchFilters();
  const enrichedResults = usePropertyPhotos(results);
  const isMobile = useIsMobile();
  const footerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Hide bottom actions when footer is visible
  useEffect(() => {
    if (!isMobile) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowBottomActions(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, [isMobile]);

  // Infinite scroll: load more when sentinel becomes visible
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  const handleSortChange = (value: string) => {
    setFilter("sort", value);
  };

  const activeFiltersCount = [
    filters.location,
    filters.minPrice || filters.maxPrice,
    filters.minRooms || filters.maxRooms || filters.minAmbientes || filters.maxAmbientes,
    filters.parking,
    filters.minSurface || filters.maxSurface,
    filters.propertyType,
  ].filter(Boolean).length;

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />

        <MobileSearchHeader
          location={filters.location || "Buenos Aires"}
          filtersApplied={activeFiltersCount}
          onFiltersClick={() => setShowMoreFilters(true)}
        />

        {/* Results Count */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-display font-bold text-lg text-foreground">
              {isLoading ? "Buscando..." : `${total} propiedades`}
            </p>
            {filters.location && (
              <p className="text-sm text-muted-foreground">
                en {filters.location}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                <ArrowUpDown className="h-5 w-5 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background border border-border shadow-lg rounded-lg p-1">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer ${
                    filters.sort === option.value
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <span>{option.label}</span>
                  {filters.sort === option.value && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Property Cards */}
        <div className="px-4 space-y-4">
          {isLoading ? (
            <PropertyGridSkeleton count={4} mobile />
          ) : enrichedResults.length > 0 ? (
            <>
              {enrichedResults.map((property, index) => (
                <MobilePropertyCard
                  key={`${property.id}-${index}`}
                  property={property}
                />
              ))}
              <div ref={loadMoreRef} className="py-1" />
              {isLoadingMore && <LoadingMoreIndicator />}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron propiedades</p>
            </div>
          )}
        </div>

        <div ref={footerRef}>
          <Footer />
        </div>

        <MobileSearchBottomActions
          visible={showBottomActions}
          onAlertClick={() => console.log("Create alert")}
        />

        <MoreFiltersPanel
          open={showMoreFilters}
          onClose={() => setShowMoreFilters(false)}
        />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Filters Bar */}
      <div className="border-b border-border sticky top-16 bg-background z-40">
        <div className="container py-4">
          <div className="flex flex-wrap items-center gap-3">
            <LocationFilter />
            <PriceFilter />
            <PropertyTypeFilter />
            <RoomsFilter />
            <ParkingFilter />
            <SurfaceFilter />

            <Button
              variant="outline"
              className="rounded-full ml-auto"
              onClick={() => setShowMoreFilters(true)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Más filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="container py-8">
        <div className="mb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Resultados de búsqueda
          </p>
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-foreground">
              {isLoading ? "Buscando..." : `${total} propiedades`}
              {filters.location && ` en ${filters.location}`}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Ordenar por:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-sm font-medium text-primary">
                    {sortOptions.find((o) => o.value === filters.sort)?.label}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`flex items-center justify-between cursor-pointer ${
                        filters.sort === option.value ? "font-medium" : ""
                      }`}
                    >
                      <span>{option.label}</span>
                      {filters.sort === option.value && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {isLoading ? (
          <PropertyGridSkeleton count={8} />
        ) : enrichedResults.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {enrichedResults.map((property, index) => (
                <PropertyCard
                  key={`${property.id}-${index}`}
                  property={property}
                  showDetails
                />
              ))}
            </div>
            <div ref={loadMoreRef} className="py-1" />
            {isLoadingMore && <LoadingMoreIndicator />}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No se encontraron propiedades</p>
            <p className="text-sm text-muted-foreground mt-2">Probá ajustando los filtros</p>
          </div>
        )}
      </main>

      <MoreFiltersPanel
        open={showMoreFilters}
        onClose={() => setShowMoreFilters(false)}
      />

      <Footer />
    </div>
  );
};

export default SearchResults;
