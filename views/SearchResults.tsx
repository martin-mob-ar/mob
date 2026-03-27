"use client";

import Header from "@/components/Header";
import PropertyCard from "@/components/PropertyCard";
import { Property } from "@/components/PropertyCard";

import MobileSearchHeader from "@/components/MobileSearchHeader";
import { SlidersHorizontal, ChevronDown, ArrowUpDown, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import LocationFilter from "@/components/filters/LocationFilter";
import PriceFilter from "@/components/filters/PriceFilter";
import PropertyTypeFilter from "@/components/filters/PropertyTypeFilter";
import RoomsFilter from "@/components/filters/RoomsFilter";
import ParkingFilter from "@/components/filters/ParkingFilter";
import SurfaceFilter from "@/components/filters/SurfaceFilter";
import OwnerTypeFilter from "@/components/filters/OwnerTypeFilter";
import MoreFiltersPanel from "@/components/filters/MoreFiltersPanel";
import Footer from "@/components/Footer";
import ExploreRentals from "@/components/ExploreRentals";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchFiltersProvider, useSearchFilters } from "@/contexts/SearchFiltersContext";
import { usePropertyPhotos } from "@/hooks/usePropertyPhotos";
import { useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
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
function PropertyCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-muted rounded-xl w-3/4" />
        <div className="h-3 bg-muted rounded-xl w-1/2" />
        <div className="h-4 bg-muted rounded-xl w-1/3" />
      </div>
    </div>
  );
}

function PropertyGridSkeleton({ count = 8, mobile = false }: { count?: number; mobile?: boolean }) {
  return (
    <div className={mobile
      ? "grid grid-cols-2 gap-3"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    }>
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ───────── Pagination component ───────── */
function SearchPagination() {
  const { page, totalPages } = useSearchFilters();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const getPageUrl = (n: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (n <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(n));
    }
    const qs = params.toString();
    return qs ? `/buscar?${qs}` : "/buscar";
  };

  // Sliding window of up to 5 pages centered on current
  const buildPages = (): number[] => {
    const windowSize = Math.min(5, totalPages);
    let start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pages = buildPages();

  return (
    <div className="py-8">
      <Pagination>
        <PaginationContent>
          {/* Anterior */}
          <PaginationItem>
            <PaginationLink
              href={page > 1 ? getPageUrl(page - 1) : undefined}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
              aria-label="Ir a página anterior"
              aria-disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>

          {/* Page numbers */}
          {pages.map((p) => (
            <PaginationItem key={p}>
              <PaginationLink href={getPageUrl(p)} isActive={p === page}>
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}

          {/* Siguiente */}
          <PaginationItem>
            <PaginationLink
              href={page < totalPages ? getPageUrl(page + 1) : undefined}
              className={page === totalPages ? "pointer-events-none opacity-50" : ""}
              aria-label="Ir a página siguiente"
              aria-disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
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
  const { filters, setFilter, results, total, isLoading } = useSearchFilters();
  const enrichedResults = usePropertyPhotos(results);
  const isMobile = useIsMobile();

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
    filters.ownerType,
  ].filter(Boolean).length;

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <Header hideSearch sticky={false} />

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
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                <ArrowUpDown className="h-5 w-5 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background border border-border shadow-lg rounded-xl p-1">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer ${
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
        <div className="px-4">
          {isLoading ? (
            <PropertyGridSkeleton count={4} mobile />
          ) : enrichedResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {enrichedResults.map((property, index) => (
                <PropertyCard
                  key={`${property.id}-${index}`}
                  property={property}
                  context="search"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron propiedades</p>
            </div>
          )}
        </div>

        {!isLoading && enrichedResults.length > 0 && (
          <div className="px-4">
            <SearchPagination />
          </div>
        )}

        <ExploreRentals title="Más alquileres" />

        <Footer className="mt-0" />

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
      <Header hideSearch sticky={false} />

      {/* Filters Bar */}
      <div className="border-b border-border sticky top-0 bg-background z-40">
        <div className="container py-4">
          <div className="flex flex-wrap items-center gap-3">
            <LocationFilter />
            <PriceFilter />
            <PropertyTypeFilter />
            <RoomsFilter />
            <OwnerTypeFilter />
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
                  context="search"
                />
              ))}
            </div>
            <SearchPagination />
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No se encontraron propiedades</p>
            <p className="text-sm text-muted-foreground mt-2">Probá ajustando los filtros</p>
          </div>
        )}
      </main>

      <ExploreRentals title="Más alquileres" />

      <MoreFiltersPanel
        open={showMoreFilters}
        onClose={() => setShowMoreFilters(false)}
      />

      <Footer className="mt-0" />
    </div>
  );
};

export default SearchResults;
