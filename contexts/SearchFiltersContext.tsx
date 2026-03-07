"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Property } from "@/components/PropertyCard";
import { transformPropertyReadList } from "@/lib/transforms/property";

export interface SearchFilters {
  location: string;
  locationId: string;
  stateId: string;
  priceType: "total" | "alquiler";
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
  propertyTypeNames: string[]; // ["Departamento", "Casa", ...]
  tagIds: number[];    // selected tag IDs from tokko_property_tag
  maxAge: string;      // max property age (0 = a estrenar)
  availabilityFilter: "" | "immediate" | "next-month" | "custom";
  availabilityDate: string;
  sort: string;
}

const ITEMS_PER_PAGE = 20;

interface SearchFiltersContextValue {
  filters: SearchFilters;
  setFilter: (key: keyof SearchFilters, value: string) => void;
  setFilters: (updates: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  results: Property[];
  total: number;
  isLoading: boolean;
  page: number;
  totalPages: number;
  goToPage: (n: number) => void;
  search: () => void;
}

const defaultFilters: SearchFilters = {
  location: "",
  locationId: "",
  stateId: "",
  priceType: "total",
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
  maxAge: "",
  availabilityFilter: "",
  availabilityDate: "",
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
  const stateId = searchParams.get("stateId");
  const priceType = searchParams.get("priceType");
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
  const maxAge = searchParams.get("maxAge");
  const sort = searchParams.get("sort");

  if (location) updates.location = location;
  if (locationId) updates.locationId = locationId;
  if (stateId) updates.stateId = stateId;
  if (priceType) updates.priceType = priceType as "total" | "alquiler";
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
  if (maxAge) updates.maxAge = maxAge;
  const availabilityFilter = searchParams.get("availabilityFilter");
  const availabilityDate = searchParams.get("availabilityDate");
  if (availabilityFilter) updates.availabilityFilter = availabilityFilter as "" | "immediate" | "next-month" | "custom";
  if (availabilityDate) updates.availabilityDate = availabilityDate;
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
  const pageFromUrl = parseInt(searchParams.get("page") || "1") || 1;
  const isInitialMount = useRef(true);

  const [filters, setFiltersState] = useState<SearchFilters>({
    ...defaultFilters,
    ...urlUpdates,
  });
  const [results, setResults] = useState<Property[]>(initialResults || []);
  const [total, setTotal] = useState(initialTotal || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(
    initialTotal ? Math.ceil(initialTotal / ITEMS_PER_PAGE) : 0
  );

  const setFilter = useCallback((key: keyof SearchFilters, value: string) => {
    setFiltersState((prev) => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
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
  }, []);

  // Build URL params from filter state
  const buildFilterParams = useCallback((f: SearchFilters) => {
    const params = new URLSearchParams();
    if (f.location) params.set("location", f.location);
    if (f.locationId) params.set("locationId", f.locationId);
    if (f.stateId) params.set("stateId", f.stateId);
    if (f.priceType && f.priceType !== "total") params.set("priceType", f.priceType);
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
    if (f.maxAge) params.set("maxAge", f.maxAge);
    if (f.availabilityFilter) params.set("availabilityFilter", f.availabilityFilter);
    if (f.availabilityDate) params.set("availabilityDate", f.availabilityDate);
    if (f.sort && f.sort !== "recent") params.set("sort", f.sort);
    return params;
  }, []);

  const fetchPage = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const params = buildFilterParams(filters);
      params.set("sort", filters.sort);
      params.set("page", String(pageNum));
      params.set("limit", String(ITEMS_PER_PAGE));

      const res = await fetch(`/api/properties/search?${params.toString()}`);
      const json = await res.json();

      if (res.ok) {
        const newProperties = transformPropertyReadList(json.data);
        setResults(newProperties);
        setTotal(json.total);
        setTotalPages(Math.ceil(json.total / ITEMS_PER_PAGE));
      }
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setIsLoading(false);
    }
  }, [filters, buildFilterParams]);

  const goToPage = useCallback((n: number) => {
    setPage(n);
    const params = buildFilterParams(filters);
    if (n > 1) params.set("page", String(n));
    const qs = params.toString();
    const newUrl = qs ? `/buscar?${qs}` : "/buscar";
    router.push(newUrl, { scroll: true });
    fetchPage(n);
  }, [filters, buildFilterParams, router, fetchPage]);

  const search = useCallback(() => {
    setPage(1);
    fetchPage(1);
  }, [fetchPage]);

  // Sync filters to URL (skip initial mount to avoid loop); filter changes always reset page to 1
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (pathname !== "/buscar") return;

    const params = buildFilterParams(filters);
    // page param omitted → page 1
    const qs = params.toString();
    const newUrl = qs ? `/buscar?${qs}` : "/buscar";
    router.replace(newUrl, { scroll: false });
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-search when filters change
  // On first mount: if URL has filters or a specific page, use those; otherwise use server initial results
  const [hasSearched, setHasSearched] = useState(false);
  useEffect(() => {
    if (!hasSearched && !hasUrlFilters && pageFromUrl === 1 && initialResults && initialResults.length > 0) {
      setHasSearched(true);
      return;
    }
    setHasSearched(true);
    const targetPage = !hasSearched ? pageFromUrl : 1;
    setPage(targetPage);
    fetchPage(targetPage);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Respond to URL page changes (browser back/forward)
  const urlPage = parseInt(searchParams.get("page") || "1") || 1;
  useEffect(() => {
    if (!hasSearched) return;
    if (urlPage !== page) {
      setPage(urlPage);
      fetchPage(urlPage);
    }
  }, [urlPage]); // eslint-disable-line react-hooks/exhaustive-deps

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
        totalPages,
        goToPage,
        search,
      }}
    >
      {children}
    </SearchFiltersContext.Provider>
  );
}
