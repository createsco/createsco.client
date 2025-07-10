import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

export interface FilterOptions {
  locations: string[]
  specializations: string[]
}

export function useFilterOptions() {
  const [locations, setLocations] = useState<string[]>([])
  const [specializations, setSpecializations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchOptions() {
      try {
        setLoading(true)
        const res = await apiClient.getFilterOptions()
        if (!cancelled && res.success && res.data?.filters) {
          setLocations(res.data.filters.locations || [])
          setSpecializations(res.data.filters.specializations || [])
        } else if (!cancelled) {
          setError(res.message || "Failed to fetch filter options")
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchOptions()

    return () => {
      cancelled = true
    }
  }, [])

  return { locations, specializations, loading, error }
} 