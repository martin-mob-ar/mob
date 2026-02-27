"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface FavoritesContextValue {
  favorites: Set<number>;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: new Set(),
  isFavorite: () => false,
  toggleFavorite: async () => {},
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      setFavorites(new Set());
      return;
    }

    fetch('/api/favoritos')
      .then((res) => res.json())
      .then((data) => {
        if (data.propertyIds) {
          setFavorites(new Set(data.propertyIds.map(Number)));
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const isFavorite = useCallback((id: number) => favorites.has(id), [favorites]);

  const toggleFavorite = useCallback(async (id: number) => {
    // Optimistic update
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    try {
      const res = await fetch('/api/favoritos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: id }),
      });
      if (!res.ok) throw new Error('API error');
    } catch {
      // Revert optimistic update on failure
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    }
  }, []);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
