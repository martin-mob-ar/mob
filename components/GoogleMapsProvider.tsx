"use client";

import { createContext, useContext } from "react";
import { useLoadScript } from "@react-google-maps/api";

interface GoogleMapsContextValue {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextValue>({
  isLoaded: false,
  loadError: undefined,
});

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
}

export default function GoogleMapsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}
