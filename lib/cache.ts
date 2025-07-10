"use client"

// Simple key-value cache that survives page navigations (but not full tab reloads)
// by storing the data in `sessionStorage`. Each entry is wrapped with a timestamp
// so we can honour a configurable TTL.
//
// NOTE: This utility only runs in the browser. Calls from server / SSR code will
// simply be ignored and return `null`.

export interface CacheEntry<T = unknown> {
  timestamp: number
  data: T
}

/**
 * Read and parse a cached value.
 *
 * @param key   Storage key
 * @param ttl   Time-to-live in milliseconds. If the cached entry is older than
 *              this, it will be treated as stale and removed.
 * @returns     Parsed value or `null` if missing / expired / malformed.
 */
export function getCache<T = unknown>(key: string, ttl = 10 * 60 * 1000): T | null {
  if (typeof window === "undefined" || !window.sessionStorage) return null

  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null

    const entry: CacheEntry<T> = JSON.parse(raw)
    if (!entry || typeof entry.timestamp !== "number") {
      sessionStorage.removeItem(key)
      return null
    }

    if (Date.now() - entry.timestamp > ttl) {
      // Expired – clear and treat as miss
      sessionStorage.removeItem(key)
      return null
    }

    return entry.data
  } catch {
    // Malformed JSON – clear it just in case
    sessionStorage.removeItem(key)
    return null
  }
}

/**
 * Store a value in the cache.
 */
export function setCache<T = unknown>(key: string, data: T): void {
  if (typeof window === "undefined" || !window.sessionStorage) return

  const entry: CacheEntry<T> = { timestamp: Date.now(), data }
  try {
    sessionStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // If quota exceeded or other error, silently ignore – caching is best-effort
  }
} 