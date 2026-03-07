"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

const LOCAL_STORAGE_KEY = "mob_guest_favorites";

function readLocalFavorites(): Set<number> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr.filter((n: unknown) => typeof n === "number"));
  } catch {
    // corrupted — ignore
  }
  return new Set();
}

function writeLocalFavorites(ids: Set<number>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // storage full or blocked — ignore
  }
}

function clearLocalFavorites() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // ignore
  }
}

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
  const prevAuthRef = useRef(isAuthenticated);

  // Load favorites on mount and auth changes
  useEffect(() => {
    const wasAuthenticated = prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;

    if (isAuthenticated) {
      // User is logged in — fetch from API
      const guestFavs = readLocalFavorites();

      if (!wasAuthenticated && guestFavs.size > 0) {
        // Just became authenticated with pending guest favorites → migrate
        fetch('/api/favoritos/migrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyIds: [...guestFavs] }),
        })
          .then((res) => {
            if (res.ok) clearLocalFavorites();
            // Fetch full list from API after migration
            return fetch('/api/favoritos');
          })
          .then((res) => res.json())
          .then((data) => {
            if (data.propertyIds) {
              setFavorites(new Set(data.propertyIds.map(Number)));
            }
          })
          .catch(() => {});
      } else {
        // Already authenticated or no guest favorites — just fetch
        fetch('/api/favoritos')
          .then((res) => res.json())
          .then((data) => {
            if (data.propertyIds) {
              setFavorites(new Set(data.propertyIds.map(Number)));
            }
          })
          .catch(() => {});
      }
    } else {
      // Guest — load from localStorage
      setFavorites(readLocalFavorites());
    }
  }, [isAuthenticated]);

  const isFavorite = useCallback((id: number) => favorites.has(id), [favorites]);

  const toggleFavorite = useCallback(async (id: number) => {
    if (!isAuthenticated) {
      // Guest: toggle in localStorage
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        writeLocalFavorites(next);
        return next;
      });
      return;
    }

    // Authenticated: optimistic update + API call
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
  }, [isAuthenticated]);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
