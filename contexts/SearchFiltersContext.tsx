"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Property } from "@/components/PropertyCard";
import { transformPropertyReadList } from "@/lib/transforms/property";

export interface SearchFilters {
  location: string;
  minPrice: string;
  maxPrice: string;
  rooms: string;
  bathrooms: string;
  parking: string;
  minSurface: string;
  maxSurface: string;
  propertyType: string; // "inmobiliaria" | "dueno" | ""
  propertyTypeNames: string[]; // ["Apartment", "House", ...]
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
  minPrice: "",
  maxPrice: "",
  rooms: "",
  bathrooms: "",
  parking: "",
  minSurface: "",
  maxSurface: "",
  propertyType: "",
  propertyTypeNames: [],
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

export function SearchFiltersProvider({
  children,
  initialResults,
  initialTotal,
}: SearchFiltersProviderProps) {
  const [filters, setFiltersState] = useState<SearchFilters>(defaultFilters);
  const [results, setResults] = useState<Property[]>(initialResults || []);
  const [total, setTotal] = useState(initialTotal || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  const setFilter = useCallback((key: keyof SearchFilters, value: string) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setFilters = useCallback((updates: Partial<SearchFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters);
    setPage(1);
  }, []);

  const search = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.location) params.set("location", filters.location);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.rooms) params.set("rooms", filters.rooms);
      if (filters.bathrooms) params.set("bathrooms", filters.bathrooms);
      if (filters.parking) params.set("parking", filters.parking);
      if (filters.minSurface) params.set("minSurface", filters.minSurface);
      if (filters.maxSurface) params.set("maxSurface", filters.maxSurface);
      if (filters.propertyType) params.set("propertyType", filters.propertyType);
      if (filters.propertyTypeNames.length > 0) params.set("propertyTypeNames", filters.propertyTypeNames.join(","));
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
  }, [filters, page]);

  // Auto-search when filters or page change (skip initial if we have initialResults)
  const [hasSearched, setHasSearched] = useState(false);
  useEffect(() => {
    if (!hasSearched && initialResults && initialResults.length > 0) {
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
