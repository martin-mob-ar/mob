"use client";

import { useEffect, useRef, useState } from "react";
import { useGoogleMaps } from "@/components/GoogleMapsProvider";
import { MapPin } from "lucide-react";

interface PropertyMapProps {
  lat: number;
  lng: number;
  className?: string;
}

export default function PropertyMap({ lat, lng, className }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [error, setError] = useState(false);

  const { isLoaded, loadError } = useGoogleMaps();

  useEffect(() => {
    if (!isLoaded || loadError || !mapRef.current || mapInstanceRef.current) return;

    try {
      const center = { lat, lng };

      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 16,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "greedy",
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      });

      new google.maps.Marker({ position: center, map });
      mapInstanceRef.current = map;
    } catch {
      setError(true);
    }
  }, [isLoaded, loadError, lat, lng]);

  if (loadError || error) {
    return (
      <div className={`bg-secondary rounded-xl flex items-center justify-center ${className || ""}`}>
        <MapPin className="h-10 w-10 text-muted-foreground" />
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`bg-secondary rounded-xl flex items-center justify-center ${className || ""}`}>
        <MapPin className="h-10 w-10 text-muted-foreground animate-pulse" />
      </div>
    );
  }

  return <div ref={mapRef} className={`rounded-xl ${className || ""}`} />;
}
