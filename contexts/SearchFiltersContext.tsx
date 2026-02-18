"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Property } from "@/components/PropertyCard";
import { transformPropertyReadList } from "@/lib/transforms/property";

export interface SearchFilters {
  location: string;
  locationId: string;
  minPrice: string;
  maxPrice: string;
  minRooms: string;   // dormitorios min → suite_amount
  maxRooms: string;   // dormitorios max → suite_amount
  minAmbientes: string; // ambientes min → room_amount
  maxAmbientes: string; // ambientes max → room_amount
  bathrooms: string;
  parking: string;
  minSurface: string;
  maxSurface: string;
  surfaceType: string; // "total" | "cubierta"
  propertyType: string; // "inmobiliaria" | "dueno" | ""
  propertyTypeNames: string[]; // ["Apartment", "House", ...]
  tagIds: number[];    // selected tag IDs from tokko_property_tag
  sort: string;
}

interface SearchFiltersContextValue {
  filters: SearchFilters;
  setFilter: (key: keyof SearchFilters, value: string) => void;
  setFilters: (updates: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  results: Property[];
  total: number;
  isLoading: boolean;
  page: number;
  setPage: (page: number) => void;
  search: () => void;
}

const defaultFilters: SearchFilters = {
  location: "",
  locationId: "",
  minPrice: "",
  maxPrice: "",
  minRooms: "",
  maxRooms: "",
  minAmbientes: "",
  maxAmbientes: "",
  bathrooms: "",
  parking: "",
  minSurface: "",
  maxSurface: "",
  surfaceType: "total",
  propertyType: "",
  propertyTypeNames: [],
  tagIds: [],
  sort: "recent",
};

const SearchFiltersContext = createContext<SearchFiltersContextValue | null>(null);

export function useSearchFilters() {
  const ctx = useContext(SearchFiltersContext);
  if (!ctx) throw new Error("useSearchFilters must be used within SearchFiltersProvider");
  return ctx;
}

interface SearchFiltersProviderProps {
  children: ReactNode;
  initialResults?: Property[];
  initialTotal?: number;
}

function getInitialFiltersFromParams(searchParams: URLSearchParams): Partial<SearchFilters> {
  const updates: Partial<SearchFilters> = {};
  const location = searchParams.get("location");
  const locationId = searchParams.get("locationId");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const minRooms = searchParams.get("minRooms");
  const maxRooms = searchParams.get("maxRooms");
  const minAmbientes = searchParams.get("minAmbientes");
  const maxAmbientes = searchParams.get("maxAmbientes");
  const bathrooms = searchParams.get("bathrooms");
  const parking = searchParams.get("parking");
  const minSurface = searchParams.get("minSurface");
  const maxSurface = searchParams.get("maxSurface");
  const surfaceType = searchParams.get("surfaceType");
  const propertyTypeNames = searchParams.get("propertyTypeNames");
  const tagIds = searchParams.get("tagIds");
  const sort = searchParams.get("sort");

  if (location) updates.location = location;
  if (locationId) updates.locationId = locationId;
  if (minPrice) updates.minPrice = minPrice;
  if (maxPrice) updates.maxPrice = maxPrice;
  if (minRooms) updates.minRooms = minRooms;
  if (maxRooms) updates.maxRooms = maxRooms;
  if (minAmbientes) updates.minAmbientes = minAmbientes;
  if (maxAmbientes) updates.maxAmbientes = maxAmbientes;
  if (bathrooms) updates.bathrooms = bathrooms;
  if (parking) updates.parking = parking;
  if (minSurface) updates.minSurface = minSurface;
  if (maxSurface) updates.maxSurface = maxSurface;
  if (surfaceType) updates.surfaceType = surfaceType;
  if (propertyTypeNames) updates.propertyTypeNames = propertyTypeNames.split(",").filter(Boolean);
  if (tagIds) updates.tagIds = tagIds.split(",").map(Number).filter(Boolean);
  if (sort) updates.sort = sort;

  return updates;
}

export function SearchFiltersProvider({
  children,
  initialResults,
  initialTotal,
}: SearchFiltersProviderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const urlUpdates = getInitialFiltersFromParams(searchParams);
  const hasUrlFilters = Object.keys(urlUpdates).length > 0;
  const isInitialMount = useRef(true);

  const [filters, setFiltersState] = useState<SearchFilters>({
    ...defaultFilters,
    ...urlUpdates,
  });
  const [results, setResults] = useState<Property[]>(initialResults || []);
  const [total, setTotal] = useState(initialTotal || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  const setFilter = useCallback((key: keyof SearchFilters, value: string) => {
    setFiltersState((prev) => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
    setPage(1);
  }, []);

  const setFilters = useCallback((updates: Partial<SearchFilters>) => {
    setFiltersState((prev) => {
      const hasChange = Object.entries(updates).some(([k, v]) => {
        const key = k as keyof SearchFilters;
        if (Array.isArray(v) && Array.isArray(prev[key])) {
          return JSON.stringify(v) !== JSON.stringify(prev[key]);
        }
        return prev[key] !== v;
      });
      if (!hasChange) return prev;
      return { ...prev, ...updates };
    });
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState((prev) => {
      const hasChange = (Object.keys(defaultFilters) as (keyof SearchFilters)[]).some((k) => {
        if (Array.isArray(defaultFilters[k]) && Array.isArray(prev[k])) {
          return JSON.stringify(defaultFilters[k]) !== JSON.stringify(prev[k]);
        }
        return prev[k] !== defaultFilters[k];
      });
      if (!hasChange) return prev;
      return defaultFilters;
    });
    setPage(1);
  }, []);

  // Build URL params from filter state (shared by search + URL sync)
  const buildFilterParams = useCallback((f: SearchFilters) => {
    const params = new URLSearchParams();
    if (f.location) params.set("location", f.location);
    if (f.locationId) params.set("locationId", f.locationId);
    if (f.minPrice) params.set("minPrice", f.minPrice);
    if (f.maxPrice) params.set("maxPrice", f.maxPrice);
    if (f.minRooms) params.set("minRooms", f.minRooms);
    if (f.maxRooms) params.set("maxRooms", f.maxRooms);
    if (f.minAmbientes) params.set("minAmbientes", f.minAmbientes);
    if (f.maxAmbientes) params.set("maxAmbientes", f.maxAmbientes);
    if (f.bathrooms) params.set("bathrooms", f.bathrooms);
    if (f.parking) params.set("parking", f.parking);
    if (f.minSurface) params.set("minSurface", f.minSurface);
    if (f.maxSurface) params.set("maxSurface", f.maxSurface);
    if (f.surfaceType && f.surfaceType !== "total") params.set("surfaceType", f.surfaceType);
    if (f.propertyType) params.set("propertyType", f.propertyType);
    if (f.propertyTypeNames.length > 0) params.set("propertyTypeNames", f.propertyTypeNames.join(","));
    if (f.tagIds.length > 0) params.set("tagIds", f.tagIds.join(","));
    if (f.sort && f.sort !== "recent") params.set("sort", f.sort);
    return params;
  }, []);

  const search = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = buildFilterParams(filters);
      params.set("sort", filters.sort);
      params.set("page", String(page));
      params.set("limit", "20");

      const res = await fetch(`/api/properties/search?${params.toString()}`);
      const json = await res.json();

      if (res.ok) {
        setResults(transformPropertyReadList(json.data));
        setTotal(json.total);
      }
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, buildFilterParams]);

  // Sync filters to URL (skip initial mount to avoid loop)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (pathname !== "/buscar") return;

    const params = buildFilterParams(filters);
    const qs = params.toString();
    const newUrl = qs ? `/buscar?${qs}` : "/buscar";
    router.replace(newUrl, { scroll: false });
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-search when filters or page change
  // If URL has filters, always search on mount (don't skip with initialResults)
  const [hasSearched, setHasSearched] = useState(false);
  useEffect(() => {
    if (!hasSearched && !hasUrlFilters && initialResults && initialResults.length > 0) {
      setHasSearched(true);
      return;
    }
    setHasSearched(true);
    search();
  }, [filters, page]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SearchFiltersContext.Provider
      value={{
        filters,
        setFilter,
        setFilters,
        clearFilters,
        results,
        total,
        isLoading,
        page,
        setPage,
        search,
      }}
    >
      {children}
    </SearchFiltersContext.Provider>
  );
}
