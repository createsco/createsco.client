"use client"

import { useState, useEffect } from "react"
import { apiClient, type Partner, type StatsResponse } from "@/lib/api-client"
import { getCache, setCache } from "@/lib/cache"

// Shared type helpers
type SortOrder = "asc" | "desc"

export interface UsePhotographersParams {
  city?: string
  shootType?: string
  limit?: number
  page?: number
  minRating?: number
  sortBy?: string
  sortOrder?: SortOrder
}

export interface UseStudiosParams {
  city?: string
  limit?: number
  page?: number
  minRating?: number
  sortBy?: string
  sortOrder?: SortOrder
}

export interface UseLocationsParams {
  limit?: number
}

// Add after imports near top
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

// Mapping functions with safe defaults
const mapPartnerToPhotographer = (partner: Partner) => {
  const safePartner = partner || {}
  return {
    id: safePartner._id || "",
    name: safePartner.companyName || "Unknown Photographer",
    image: safePartner.user?.profilePic || safePartner.banner || safePartner.portfolio?.[0] || "/placeholder.svg",
    price: safePartner.services?.[0]?.basePrice
      ? `₹${safePartner.services[0].basePrice.toLocaleString()}`
      : "Contact for pricing",
    location: safePartner.servingLocations?.[0] || "Location not specified",
    specialty:
      safePartner.specializations?.[0]?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Photography",
    experience: `${safePartner.experienceYears || 0} years`,
    rating: safePartner.avgRating?.toFixed(1) || "4.0",
    isFavorite: (safePartner.avgRating || 0) >= 4.5,
    verified: safePartner.verified || false,
    partnerType: safePartner.partnerType || "solo",
  }
}

const mapPartnerToStudio = (partner: Partner) => {
  const safePartner = partner || {}
  return {
    id: safePartner._id || "",
    name: safePartner.companyName || "Unknown Studio",
    image: safePartner.banner || safePartner.portfolio?.[0] || "/placeholder.svg",
    rating: safePartner.avgRating?.toFixed(1) || "4.0",
    location: safePartner.servingLocations?.join(", ") || "Multiple locations",
    specialties:
      safePartner.specializations?.map((spec) => spec.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())) ||
      [],
    photographers: safePartner.projectStats?.total || 0,
    isFavorite: (safePartner.avgRating || 0) >= 4.5,
    price: safePartner.services?.[0]?.basePrice?.toLocaleString(),
  }
}

// Photographers hook
export function usePhotographers(params: UsePhotographersParams = {}) {
  const [photographers, setPhotographers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasNextPage, setHasNextPage] = useState(false)

  // Attempt to serve from cache first for snappy navigation
  useEffect(() => {
    const cacheKey = `photographers:${JSON.stringify(params)}`
    const cached = getCache<{ list: any[]; hasNext: boolean }>(cacheKey, CACHE_TTL)
    if (cached) {
      setPhotographers(cached.list)
      setHasNextPage(cached.hasNext)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function fetchPhotographers() {
      try {
        setLoading(true)
        setError(null)

        const queryParams = {
          page: params.page || 1,
          limit: params.limit || 12,
          location: params.city,
          specialization: params.shootType,
          minRating: params.minRating,
          sortBy: params.sortBy || "avgRating",
          sortOrder: params.sortOrder || "desc",
        }

        const response = await apiClient.getPartners(queryParams)

        if (!cancelled && response.success && response.data?.partners) {
          const mappedPhotographers = response.data.partners
            .filter((p) => p.partnerType !== "studio")
            .map(mapPartnerToPhotographer)

          setPhotographers((prev) => {
            if (queryParams.page === 1) return mappedPhotographers
            // Deduplicate by id to avoid React duplicate key warnings
            const existingIds = new Set(prev.map((p) => p.id))
            const uniqueToAdd = mappedPhotographers.filter((p) => !existingIds.has(p.id))
            return [...prev, ...uniqueToAdd]
          })
          setHasNextPage(response.data.pagination?.hasNext || false)

          // Persist to cache for future navigations
          const cacheKey = `photographers:${JSON.stringify(queryParams)}`
          setCache(cacheKey, { list: mappedPhotographers, hasNext: response.data.pagination?.hasNext || false })
        } else if (!cancelled) {
          setError(response.message || "Failed to load photographers")
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchPhotographers()

    return () => {
      cancelled = true
    }
  }, [params.city, params.shootType, params.limit, params.page, params.minRating, params.sortBy, params.sortOrder])

  return { photographers, loading, error, hasNextPage }
}

// Studios hook
export function useStudios(params: UseStudiosParams = {}) {
  const [studios, setStudios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasNextPage, setHasNextPage] = useState(false)

  // Attempt to serve from cache first for snappy navigation
  useEffect(() => {
    const cacheKey = `studios:${JSON.stringify(params)}`
    const cached = getCache<{ list: any[]; hasNext: boolean }>(cacheKey, CACHE_TTL)
    if (cached) {
      setStudios(cached.list)
      setHasNextPage(cached.hasNext)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function fetchStudios() {
      try {
        setLoading(true)
        setError(null)

        const queryParams = {
          page: params.page || 1,
          limit: params.limit || 12,
          location: params.city,
          partnerType: "studio",
          minRating: params.minRating,
          sortBy: params.sortBy || "avgRating",
          sortOrder: params.sortOrder || "desc",
        }

        const response = await apiClient.getPartners(queryParams)

        if (!cancelled && response.success && response.data?.partners) {
          const mappedStudios = response.data.partners
            .filter((p) => p.partnerType === "studio")
            .map(mapPartnerToStudio)

          setStudios((prev) => {
            if (queryParams.page === 1) return mappedStudios
            const existingIds = new Set(prev.map((s) => s.id))
            const uniqueToAdd = mappedStudios.filter((s) => !existingIds.has(s.id))
            return [...prev, ...uniqueToAdd]
          })
          setHasNextPage(response.data.pagination?.hasNext || false)

          // Persist to cache for future navigations
          const cacheKey = `studios:${JSON.stringify(queryParams)}`
          setCache(cacheKey, { list: mappedStudios, hasNext: response.data.pagination?.hasNext || false })
        } else if (!cancelled) {
          setError(response.message || "Failed to load studios")
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchStudios()

    return () => {
      cancelled = true
    }
  }, [params.city, params.limit, params.page, params.minRating, params.sortBy, params.sortOrder])

  return { studios, loading, error, hasNextPage }
}

// Locations hook
export function useLocations(params: UseLocationsParams = {}) {
  const [locations, setLocations] = useState<{ name: string; photographers: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchLocations() {
      try {
        setLoading(true)
        setError(null)

        const response = await apiClient.getFilterOptions()

        if (!cancelled && response.success && response.data?.filters?.locations) {
          // Only use real data, no placeholder counts
          const uniqueLocations = Array.from(new Set(response.data.filters.locations))
          setLocations(uniqueLocations.map((location: string) => ({ name: location, photographers: 0 })))
        } else if (!cancelled) {
          setError('internal server error')
          setLocations([])
        }
      } catch (err) {
        if (!cancelled) {
          setError('internal server error')
          setLocations([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchLocations()

    return () => {
      cancelled = true
    }
  }, [])

  return { locations, loading, error }
}

// API Health hook
export interface ApiHealthStatus {
  isHealthy: boolean
  isLoading: boolean
  error: string | null
  lastChecked: Date | null
}

export function useApiHealth(pollInterval = 60_000): ApiHealthStatus {
  const [status, setStatus] = useState<ApiHealthStatus>({
    isHealthy: false,
    isLoading: true,
    error: null,
    lastChecked: null,
  })

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    let cancelled = false

    const checkHealth = async () => {
      if (cancelled) return

      try {
        const response = await apiClient.health()

        if (!cancelled) {
          setStatus({
            isHealthy: response.status === "healthy",
            isLoading: false,
            error: null,
            lastChecked: new Date(),
          })
        }
      } catch (error) {
        if (!cancelled) {
          setStatus({
            isHealthy: false,
            isLoading: false,
            error: error instanceof Error ? error.message : "Unknown error",
            lastChecked: new Date(),
          })
        }
      }
    }

    checkHealth()
    intervalId = setInterval(checkHealth, pollInterval)

    return () => {
      cancelled = true
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [pollInterval])

  return status
}

// Generic partners hook for advanced usage
export function usePartners(filters: Record<string, any> = {}) {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>(null)

  // Attempt to serve from cache first for snappy navigation
  useEffect(() => {
    const key = `partners:${JSON.stringify(filters)}`
    const cached = getCache<{ list: Partner[]; pagination: any }>(key, CACHE_TTL)
    if (cached) {
      setPartners(cached.list)
      setPagination(cached.pagination)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function fetchPartners() {
      try {
        setLoading(true)
        setError(null)

        const response = await apiClient.getPartners(filters)

        if (!cancelled && response.success && response.data) {
          setPartners(response.data.partners || [])
          setPagination(response.data.pagination)

          // Persist to cache for future navigations
          setCache(`partners:${JSON.stringify(filters)}`, {
            list: response.data.partners || [],
            pagination: response.data.pagination,
          })
        } else if (!cancelled) {
          setError(response.message || "Failed to fetch partners")
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchPartners()

    return () => {
      cancelled = true
    }
  }, [JSON.stringify(filters)])

  return { partners, loading, error, pagination }
}

// Stats hook
export function useStats() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Attempt to serve from cache first for snappy navigation
  useEffect(() => {
    const cached = getCache<StatsResponse>("stats", CACHE_TTL)
    if (cached) {
      setStats(cached as unknown as StatsResponse)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)

        const response = await apiClient.getStats()

        if (!cancelled && response.success && response.data) {
          setStats(response.data)

          // Persist to cache for future navigations
          if (response.data) {
            setCache("stats", response.data)
          }
        } else if (!cancelled) {
          setError(response.message || "Failed to fetch stats")
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchStats()

    return () => {
      cancelled = true
    }
  }, [])

  return { stats, loading, error }
}
