"use client"

import { useState, useMemo, Suspense, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Filter, X } from "lucide-react"
import { PhotographerCard } from "@/components/photographer-card"
import { PartnerCard } from "@/components/photographer-card"
import { usePartners } from "@/hooks/use-api-data"
import { PhotographerSkeleton } from "@/components/skeleton-loader"
import Link from "next/link"
import UserAuthButtons from "@/components/user-auth-buttons"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { useFilterOptions } from "@/hooks/use-filter-options"

interface SearchFilters {
  location?: string
  specialization?: string
  partnerType?: string
  minRating?: number
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: number
}

interface Partner {
  _id: string
  userId?: string
  [key: string]: any // allow additional backend fields without strict typing
}

const normalizeSpecialization = (spec: string) => {
  // Convert to title case, but force 'photography' to be lowercase
  if (!spec) return ''
  let formatted = spec.replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
  // Lowercase only the word 'Photography' at the end
  formatted = formatted.replace(/Photography$/, 'photography')
  return formatted
}

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get initial filters from URL with safe defaults
  const initialFilters: SearchFilters = {
    location: searchParams.get("location") || undefined,
    specialization: searchParams.get("specialization") || undefined,
    partnerType: searchParams.get("partnerType") || undefined,
    minRating: searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    sortBy: searchParams.get("sortBy") || "avgRating",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
  }

  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const initialTab = searchParams.get("tab") || "all"
  const [activeTab, setActiveTab] = useState(initialTab)
  const [budgetRange, setBudgetRange] = useState([10000, 1000000])
  const [budgetBounds, setBudgetBounds] = useState<[number, number]>([10000, 1000000])
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [typeFilters, setTypeFilters] = useState<string[]>([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [page, setPage] = useState(1)

  // Fetch filter options dynamically
  const {
    locations: locationOptions,
    specializations: specializationOptions,
    loading: loadingFilterOptions,
  } = useFilterOptions()

  const filtersWithPage = { ...filters, page }
  const { partners, loading, error, pagination } = usePartners(filtersWithPage)

  // Reset to first page when filters change (except page)
  useEffect(() => {
    setPage(1)
  }, [JSON.stringify({ ...filters, page: undefined })])

  // Deduplicate partners by their unique _id to avoid rendering duplicates that
  // trigger React "duplicate key" warnings when mapping over the list.
  const uniquePartners = useMemo(() => {
    if (!partners || partners.length === 0) return []
    const map = new Map<string, (typeof partners)[number]>()
    partners.forEach((p) => {
      if (p && p._id && !map.has(p._id)) {
        map.set(p._id, p)
      }
    })
    return Array.from(map.values())
  }, [partners])

  // Determine budget bounds whenever partners list changes
  useEffect(() => {
    if (uniquePartners.length === 0) return

    // Collect all available basePrice values (guarding against missing data)
    const prices: number[] = []
    uniquePartners.forEach((p) => {
      p.services?.forEach((s: any) => {
        if (typeof s?.basePrice === "number" && s.basePrice > 0) {
          prices.push(s.basePrice)
        }
      })
    })

    if (prices.length === 0) return

    const min = Math.min(...prices)
    const max = Math.max(...prices)

    setBudgetBounds([min, max])

    // Ensure current selected range fits inside new bounds
    setBudgetRange((prev) => [Math.max(min, prev[0]), Math.min(max, prev[1])])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniquePartners])

  // List that will be rendered after applying filters
  const partnersToRender = uniquePartners

  const formatSpecialization = (spec: string) => {
    if (!spec) return ""
    return spec.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const updateURL = (newFilters: SearchFilters) => {
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value.toString())
      }
    })
    // Persist current tab selection in the URL so pages like /photographers can set it via redirect
    if (activeTab && activeTab !== "all") {
      params.set("tab", activeTab)
    }
    router.push(`/search-results?${params.toString()}`, { scroll: false })
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    // Keep the exact value selected by the user so that backend queries
    // use the original specialization string. We only format for display.
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      sortBy: "avgRating",
      sortOrder: "desc",
    }
    setFilters(clearedFilters)
    setBudgetRange([10000, 1000000])
    setRatingFilter(null)
    setTypeFilters([])
    updateURL(clearedFilters)
  }

  const toggleTypeFilter = (type: string) => {
    setTypeFilters((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [type]))
  }

  // Update URL when page changes
  useEffect(() => {
    updateURL({ ...filters, page })
    // Scroll to top of results when page changes
    window?.scrollTo({ top: 0, behavior: "smooth" })
  }, [page])

  /*
   * Sync derived UI state (budget range, rating slider, and type toggles)
   * into the `filters` object that is sent to the backend. Every time one of
   * these UI values changes we update the filters and push the new state to
   * the URL so that a browser refresh keeps the selection.
   */

  // 1. Budget (min / max price)
  useEffect(() => {
    const [minPrice, maxPrice] = budgetRange
    const newFilters = { ...filters, minPrice, maxPrice }
    setFilters(newFilters)
    updateURL(newFilters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetRange])

  // 2. Minimum rating
  useEffect(() => {
    const newFilters = { ...filters, minRating: ratingFilter ?? undefined }
    setFilters(newFilters)
    updateURL(newFilters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratingFilter])

  // 3. Partner type (studios / agencies / freelance). The API accepts a single
  //    `partnerType` value, so when multiple UI chips are active we use the
  //    first one. Mapping UI labels → API values below.
  const TYPE_MAP: Record<string, string> = {
    studios: "studio",
    agencies: "firm",
    freelance: "solo",
  }

  useEffect(() => {
    const first = typeFilters[0]
    const partnerType = first ? TYPE_MAP[first] ?? undefined : undefined
    const newFilters = { ...filters, partnerType }
    setFilters(newFilters)
    updateURL(newFilters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilters])

  // Keep URL in sync when the active tab changes
  useEffect(() => {
    updateURL(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const transformToPhotographer = (partner: Partner) => {
    const transformed = {
      id: partner._id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      userId: partner.userId || ((partner as any).user ? (partner as any).user._id : undefined),
      name: partner.companyName,
      image:
        partner.user?.profilePic ||
        partner.banner ||
        partner.portfolio?.[0] ||
        "/placeholder.svg?height=200&width=300",
      price:
        partner.services?.[0]?.basePrice
          ? `₹${partner.services[0].basePrice.toLocaleString()}`
          : "Contact for pricing",
      location: partner.servingLocations?.[0] || "Location not specified",
      specialty:
        partner.specializations?.[0]
          ? formatSpecialization(partner.specializations[0])
          : "Photography",
      experience: `${partner.experienceYears || 0} years`,
      rating: partner.avgRating?.toFixed(1) || "4.0",
      isFavorite: (partner.avgRating || 0) >= 4.5,
    }
    console.log("[transformToPhotographer]", { partner, transformed })
    return transformed
  }

  const transformToStudio = (partner: Partner) => {
    const transformed = {
      id: partner._id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      userId: partner.userId || ((partner as any).user ? (partner as any).user._id : undefined),
      name: partner.companyName,
      image: partner.banner || partner.portfolio?.[0] || "/placeholder.svg?height=200&width=300",
      rating: partner.avgRating?.toFixed(1) || "4.0",
      location: partner.servingLocations?.join(", ") || "Multiple locations",
      specialties: partner.specializations?.map((s: string) => formatSpecialization(s)) || [],
      photographers: partner.projectStats?.total || 0,
      isFavorite: (partner.avgRating || 0) >= 4.5,
      price: partner.services?.[0]?.basePrice?.toLocaleString(),
    }
    console.log("[transformToStudio]", { partner, transformed })
    return transformed
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Headers removed; global SiteHeader handles navigation */}

      <div className="max-w-7xl mx-auto">
        <div className="flex">
          {/* Mobile Filters Overlay */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileFilters(false)}>
              <div
                className="bg-white dark:bg-gray-900 w-full max-w-sm h-full overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowMobileFilters(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 space-y-6">
                  {/* Budget Filter */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Budget</h4>
                    <div className="space-y-4">
                      <div className="px-2">
                        <input
                          type="range"
                          min={budgetBounds[0]}
                          max={budgetBounds[1]}
                          step={5000}
                          value={budgetRange[0]}
                          onChange={(e) => setBudgetRange([Number(e.target.value), budgetRange[1]])}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-900 dark:accent-white"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>₹{budgetBounds[0].toLocaleString('en-IN')}</span>
                          <span>₹{budgetBounds[1].toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>₹{budgetRange[0].toLocaleString('en-IN')}</span>
                        <span>₹{budgetRange[1].toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Rating</h4>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            ratingFilter === rating
                              ? "bg-gray-100 dark:bg-gray-700"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">& up</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Type</h4>
                    <div className="space-y-3">
                      {["Studios", "Agencies", "Freelance"].map((type) => (
                        <button
                          key={type}
                          onClick={() => toggleTypeFilter(type.toLowerCase())}
                          className={`w-full text-left px-4 py-3 rounded-full border transition-colors ${
                            typeFilters.includes(type.toLowerCase())
                              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white"
                              : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Apply Filters Button */}
                  <div className="pt-4 sticky bottom-0 bg-white dark:bg-gray-900">
                    <Button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                    >
                      Apply Filters ({pagination?.total ?? 0} results)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block w-80 shrink-0 px-6 py-8">
            <div className="sticky top-24">
              <Card className="border-0 shadow-sm dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filter
                    </h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm">
                      Clear all
                    </Button>
                  </div>

                  {/* Budget Filter */}
                  <div className="mb-8">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                      <span>Budget</span>
                      <span className="text-sm text-gray-500">≤ ₹{budgetBounds[1].toLocaleString('en-IN')}</span>
                    </h4>
                    <div className="px-2">
                      <input
                        type="range"
                        min={budgetBounds[0]}
                        max={budgetBounds[1]}
                        step={5000}
                        value={budgetRange[1]}
                        onChange={(e) => setBudgetRange([budgetRange[0], Number(e.target.value)])}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-900 dark:accent-white"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>₹{budgetBounds[0].toLocaleString('en-IN')}</span>
                        <span>₹{budgetBounds[1].toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="mb-8">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                      <span>Rating</span>
                      {ratingFilter !== null && <span className="text-sm text-gray-500">≤ {ratingFilter}★</span>}
                    </h4>
                    <div className="px-2">
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={ratingFilter || 5}
                        onChange={(e) => setRatingFilter(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-900 dark:accent-white"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>1☆</span>
                        <span>5☆</span>
                      </div>
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Type</h4>
                    <div className="flex flex-col gap-3">
                      {["Studios", "Agencies", "Freelance"].map((type) => (
                        <button
                          key={type}
                          onClick={() => toggleTypeFilter(type.toLowerCase())}
                          className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                            typeFilters.includes(type.toLowerCase())
                              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                              : "text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 px-4 lg:px-6 py-4 lg:py-8">
            {/* Desktop Results Header */}
            <div className="hidden lg:block mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Search Results
                {filters.location && <span className="text-gray-600 dark:text-gray-400"> in {filters.location}</span>}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {loading
                  ? "Loading..."
                  : `${pagination?.total ?? partnersToRender.length} found`}
              </p>
            </div>

            {/* Active Filters */}
            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 mb-6 items-center">
              {/* Location Select */}
              <Select
                value={filters.location}
                onValueChange={(val) => handleFilterChange("location", val)}
              >
                <SelectTrigger className="w-auto min-w-[180px]">
                  <SelectValue placeholder="Select location">{filters.location}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {loadingFilterOptions ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                  ) : (
                    locationOptions.map((loc: string) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {/* Shoot Type Select */}
              <Select
                value={filters.specialization}
                onValueChange={(val) => handleFilterChange("specialization", val)}
              >
                <SelectTrigger className="w-auto min-w-[200px]">
                  <SelectValue placeholder="Select shoot type">
                    {filters.specialization ? normalizeSpecialization(filters.specialization) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {loadingFilterOptions ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                  ) : (
                    specializationOptions.map((spec: string) => {
                      const formatted = normalizeSpecialization(spec)
                      return (
                        <SelectItem key={spec} value={spec}>
                          {formatted}
                        </SelectItem>
                      )
                    })
                  )}
                </SelectContent>
              </Select>

              {ratingFilter !== null && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {ratingFilter}+ stars
                  <button onClick={() => setRatingFilter(null)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {typeFilters.map((type) => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                  <button onClick={() => toggleTypeFilter(type)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="photographers">Photographers</TabsTrigger>
                <TabsTrigger value="studios">Studios</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <PhotographerSkeleton key={i} />
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                  </div>
                ) : partnersToRender.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">No results found. Try adjusting your filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 lg:gap-6">
                    {partnersToRender.map((partner) => (
                      <div key={partner._id}>
                        {partner.partnerType === "studio" ? (
                          <PartnerCard
                            id={partner._id}
                            name={partner.companyName}
                            image={partner.banner || partner.portfolio?.[0] || "/placeholder.svg?height=200&width=300"}
                            rating={partner.avgRating?.toFixed(1) || "4.0"}
                            location={partner.servingLocations?.join(", ") || "Multiple locations"}
                            specialties={partner.specializations?.map((s: string) => formatSpecialization(s)) || []}
                            photographers={partner.projectStats?.total || 0}
                            isFavorite={(partner.avgRating || 0) >= 4.5}
                            price={partner.services?.[0]?.basePrice?.toLocaleString()}
                          />
                        ) : (
                          <PhotographerCard
                            id={partner._id}
                            name={partner.companyName}
                            image={
                              partner.user?.profilePic ||
                              partner.banner ||
                              partner.portfolio?.[0] ||
                              "/placeholder.svg?height=200&width=300"
                            }
                            price={
                              partner.services?.[0]?.basePrice
                                ? `₹${partner.services[0].basePrice.toLocaleString()}`
                                : "Contact for pricing"
                            }
                            location={partner.servingLocations?.[0] || "Location not specified"}
                            specialty={
                              partner.specializations?.[0]
                                ? formatSpecialization(partner.specializations[0])
                                : "Photography"
                            }
                            experience={`${partner.experienceYears || 0} years`}
                            rating={partner.avgRating?.toFixed(1) || "4.0"}
                            isFavorite={(partner.avgRating || 0) >= 4.5}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="photographers" className="mt-6">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 lg:gap-6">
                  {partnersToRender
                    .filter((p) => p.partnerType !== "studio")
                    .map((partner) => (
                      <PhotographerCard
                        key={partner._id}
                        id={partner._id}
                        name={partner.companyName}
                        image={
                          partner.user?.profilePic ||
                          partner.banner ||
                          partner.portfolio?.[0] ||
                          "/placeholder.svg?height=200&width=300"
                        }
                        price={
                          partner.services?.[0]?.basePrice
                            ? `₹${partner.services[0].basePrice.toLocaleString()}`
                            : "Contact for pricing"
                        }
                        location={partner.servingLocations?.[0] || "Location not specified"}
                        specialty={
                          partner.specializations?.[0]
                            ? formatSpecialization(partner.specializations[0])
                            : "Photography"
                        }
                        experience={`${partner.experienceYears || 0} years`}
                        rating={partner.avgRating?.toFixed(1) || "4.0"}
                        isFavorite={(partner.avgRating || 0) >= 4.5}
                      />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="studios" className="mt-6">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 lg:gap-6">
                  {partnersToRender
                    .filter((p) => p.partnerType === "studio")
                    .map((partner) => (
                      <PartnerCard
                        id={partner._id}
                        key={partner._id}
                        name={partner.companyName}
                        image={partner.banner || partner.portfolio?.[0] || "/placeholder.svg?height=200&width=300"}
                        rating={partner.avgRating?.toFixed(1) || "4.0"}
                        location={partner.servingLocations?.join(", ") || "Multiple locations"}
                        specialties={partner.specializations?.map((s: string) => formatSpecialization(s)) || []}
                        photographers={partner.projectStats?.total || 0}
                        isFavorite={(partner.avgRating || 0) >= 4.5}
                        price={partner.services?.[0]?.basePrice?.toLocaleString()}
                      />
                    ))}
                </div>
              </TabsContent>
            </Tabs>

            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 my-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={page === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === pagination.pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchResults() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading search results...</p>
          </div>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  )
}
