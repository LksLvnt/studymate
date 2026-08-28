import { createContext, useContext, useRef, useCallback, type ReactNode } from "react";
import api from "../lib/api";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface DataCacheContextType {
  get: <T>(key: string, endpoint: string, maxAgeMs?: number) => Promise<T>;
  invalidate: (key: string) => void;
  invalidateAll: () => void;
}

const DataCacheContext = createContext<DataCacheContextType | null>(null);

const DEFAULT_MAX_AGE = 60_000; // 1 minute

export function DataCacheProvider({ children }: { children: ReactNode }) {
  const cache = useRef<Map<string, CacheEntry<unknown>>>(new Map());
  const inFlight = useRef<Map<string, Promise<unknown>>>(new Map());

  const get = useCallback(async <T,>(key: string, endpoint: string, maxAgeMs = DEFAULT_MAX_AGE): Promise<T> => {
    const cached = cache.current.get(key);
    if (cached && Date.now() - cached.timestamp < maxAgeMs) {
      return cached.data as T;
    }

    const pending = inFlight.current.get(key);
    if (pending) return pending as Promise<T>;

    const promise = api.get(endpoint)
      .then((res) => {
        cache.current.set(key, { data: res.data, timestamp: Date.now() });
        inFlight.current.delete(key);
        return res.data as T;
      })
      .catch((err) => {
        inFlight.current.delete(key);
        throw err;
      });

    inFlight.current.set(key, promise);
    return promise;
  }, []);

  const invalidate = useCallback((key: string) => {
    cache.current.delete(key);
  }, []);

  const invalidateAll = useCallback(() => {
    cache.current.clear();
  }, []);

  return (
    <DataCacheContext.Provider value={{ get, invalidate, invalidateAll }}>
      {children}
    </DataCacheContext.Provider>
  );
}

export function useDataCache() {
  const ctx = useContext(DataCacheContext);
  if (!ctx) throw new Error("useDataCache must be used within DataCacheProvider");
  return ctx;
}