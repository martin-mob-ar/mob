"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Property } from "@/components/PropertyCard";

type PhotosMap = Record<string, string[]>;

async function fetchPropertyPhotos(ids: string[]): Promise<PhotosMap> {
  if (ids.length === 0) return {};
  const res = await fetch(`/api/properties/photos?ids=${ids.join(",")}`);
  if (!res.ok) return {};
  const json = await res.json();
  return json.data || {};
}

/**
 * Background-loads additional photos for property cards.
 *
 * - Fetches up to 4 additional thumbnail URLs per property after render.
 * - Prepends the existing cover photo (property.image) as the first element.
 * - Returns the original array unchanged until photos load.
 * - Skips properties that already have images[] populated (e.g. mock data).
 * - Uses React Query for caching (5min stale time).
 */
export function usePropertyPhotos(properties: Property[]): Property[] {
  // Only fetch for real DB properties that don't already have images
  const idsToFetch = useMemo(
    () =>
      properties
        .filter((p) => /^\d+$/.test(p.id) && (!p.images || p.images.length <= 1))
        .map((p) => p.id),
    [properties]
  );

  // Stable query key from sorted IDs
  const queryKey = useMemo(() => {
    const sorted = [...idsToFetch].sort();
    return ["property-photos", sorted.join(",")];
  }, [idsToFetch]);

  const { data: photosMap } = useQuery<PhotosMap>({
    queryKey,
    queryFn: () => fetchPropertyPhotos(idsToFetch),
    enabled: idsToFetch.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Merge: [existing cover photo, ...additional thumbs]
  return useMemo(() => {
    if (!photosMap) return properties;
    return properties.map((p) => {
      const additionalPhotos = photosMap[p.id];
      if (additionalPhotos && additionalPhotos.length > 0) {
        return { ...p, images: [p.image, ...additionalPhotos] };
      }
      return p;
    });
  }, [properties, photosMap]);
}
