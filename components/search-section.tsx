"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, MapPin, Camera, Sparkles, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

interface SearchSectionProps {
  onAIPromptClick: () => void
}

export function SearchSection({ onAIPromptClick }: SearchSectionProps) {
  const [region, setRegion] = useState("")
  const [shootType, setShootType] = useState("")
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [showEventSuggestions, setShowEventSuggestions] = useState(false)
  const [locations, setLocations] = useState<string[]>([])
  const [specializations, setSpecializations] = useState<string[]>([])
  const [loadingFilters, setLoadingFilters] = useState(true)
  const [selectedSpec, setSelectedSpec] = useState<string>("")

  const locationRef = useRef<HTMLDivElement>(null)
  const eventRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fetch filter options from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoadingFilters(true)
        const response = await apiClient.getFilterOptions()

        if (response.success && response.data?.filters) {
          setLocations(response.data.filters.locations || [])
          setSpecializations(response.data.filters.specializations || [])
        }
      } catch (error) {
        console.error("Failed to fetch filter options:", error)
        // Fallback to some basic options
        setLocations(["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Pune"])
        setSpecializations([
          "wedding_photography",
          "portrait_photography",
          "event_photography",
          "maternity_photography",
          "fashion_photography",
        ])
      } finally {
        setLoadingFilters(false)
      }
    }

    fetchFilterOptions()
  }, [])

  const filteredLocations = locations.filter((location) => location.toLowerCase().includes(region.toLowerCase()))

  const filteredEvents = specializations.filter((spec) => {
    const formatted = formatSpecialization(spec)
    return formatted.toLowerCase().includes(shootType.toLowerCase())
  })

  function formatSpecialization(spec: string) {
    return spec.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false)
      }
      if (eventRef.current && !eventRef.current.contains(event.target as Node)) {
        setShowEventSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLocationSelect = (location: string) => {
    setRegion(location)
    setShowLocationSuggestions(false)
  }

  const handleEventSelect = (specialization: string) => {
    // Store the raw API value so we can send it back unchanged
    setSelectedSpec(specialization)
    setShootType(formatSpecialization(specialization))
    setShowEventSuggestions(false)
  }

  const handleSearch = () => {
    const searchParams = new URLSearchParams()
    if (region) searchParams.set("location", region)
    if (shootType) {
      // If the user picked a suggestion we know the exact API value
      let apiFormat = selectedSpec

      if (!apiFormat) {
        // Otherwise attempt to normalise the free-typed value
        apiFormat = shootType
          .trim()
          .toLowerCase()
          .replace(/photographer(s)?$/i, "photography") // map common variation
          .replace(/ /g, "_")
      }

      if (apiFormat) {
        searchParams.set("specialization", apiFormat)
      }
    }

    router.push(`/search-results?${searchParams.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-gray-900 dark:text-white mb-6">
          Find the perfect
          <br />
          photographer for you
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          Connect with verified professionals and studios for your special moments
        </p>

        {/* Clean Search Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-2">
            <div className="flex items-center">
              {/* Location Input */}
              <div ref={locationRef} className="flex-1 relative">
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Where do you need a photographer?"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    onFocus={() => setShowLocationSuggestions(true)}
                    onKeyPress={handleKeyPress}
                    className="w-full h-16 text-base pl-14 pr-4 border-0 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-0 focus:outline-none rounded-full overflow-visible"
                  />
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>

                {/* Location Suggestions */}
                {showLocationSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto">
                    {loadingFilters ? (
                      <div className="px-6 py-4 text-gray-500 dark:text-gray-400">Loading locations...</div>
                    ) : filteredLocations.length > 0 ? (
                      filteredLocations.map((location, index) => (
                        <button
                          key={index}
                          onClick={() => handleLocationSelect(location)}
                          className="w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                        >
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                            {location}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-6 py-4 text-gray-500 dark:text-gray-400">No locations found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2"></div>

              {/* Event Type Input */}
              <div ref={eventRef} className="flex-1 relative">
                <div className="relative">
                  <Camera className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="What type of photography do you need?"
                    value={shootType}
                    onChange={(e) => setShootType(e.target.value)}
                    onFocus={() => setShowEventSuggestions(true)}
                    onKeyPress={handleKeyPress}
                    className="w-full h-16 text-base pl-14 pr-4 border-0 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-0 focus:outline-none rounded-full overflow-visible"
                  />
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>

                {/* Event Suggestions */}
                {showEventSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto">
                    {loadingFilters ? (
                      <div className="px-6 py-4 text-gray-500 dark:text-gray-400">Loading specializations...</div>
                    ) : filteredEvents.length > 0 ? (
                      filteredEvents.map((spec, index) => (
                        <button
                          key={index}
                          onClick={() => handleEventSelect(spec)}
                          className="w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                        >
                          <div className="flex items-center">
                            <Camera className="h-4 w-4 text-gray-400 mr-3" />
                            {formatSpecialization(spec)}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-6 py-4 text-gray-500 dark:text-gray-400">No specializations found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                className="flex items-center justify-center h-16 px-8 rounded-full bg-gray-900 hover:bg-gray-800 text-white font-semibold text-base ml-2"
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* AI Prompt Button */}
        <Button
          onClick={onAIPromptClick}
          variant="ghost"
          className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Describe your perfect photoshoot with AI
        </Button>
      </div>
    </section>
  )
}
