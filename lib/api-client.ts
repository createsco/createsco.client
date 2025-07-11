// API client for external API integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || " "

export interface Partner {
  _id: string
  companyName: string
  specializations: string[]
  experienceYears: number
  avgRating: number
  totalReviews: number
  verified: boolean
  partnerType: "studio" | "solo" | "firm" | "partnership"
  servingLocations: string[]
  partnerLocations: Array<{
    city: string
    state: string
    coordinates: { lat: number; lng: number }
    pinCodesServed?: string[]
  }>
  portfolio: string[]
  banner: string
  socialLinks: {
    website?: string
    instagram?: string
    facebook?: string
  }
  projectStats: {
    total: number
    completed: number
    ongoing: number
  }
  services: Array<{
    serviceId: string
    name: string
    description: string
    basePrice: number
    priceUnit: string
  }>
  locationPricing?: Record<string, number>
  user: {
    username: string
    profilePic: string
    createdAt?: string
  }
  completionRate: number
  hasLocationPricing?: boolean
  yearsInBusiness?: number
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  details?: string
}

export interface PartnersResponse {
  partners: Partner[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: {
    locations: string[]
    specializations: string[]
    partnerTypes: string[]
    ratingRanges: Array<{ _id: string; count: number }>
    priceRanges: Array<{ _id: string; count: number }>
  }
  appliedFilters: Record<string, any>
}

export interface FilterOptions {
  filters: {
    locations: string[]
    specializations: string[]
    partnerTypes: string[]
    ratingRanges: Array<{ _id: string; count: number }>
    priceRanges: Array<{ _id: string; count: number }>
  }
}

export interface StatsResponse {
  totalPartners: number
  averageRating: number
  locationsServed: number
  specializations: number
  totalProjects: number
}

export interface SearchSuggestionsResponse {
  suggestions: {
    partners: Array<{
      _id: string
      companyName: string
      specializations: string[]
      avgRating: number
      user: {
        username: string
        profilePic: string
      }
    }>
    locations: string[]
    specializations: string[]
  }
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      console.log(`Making API request to: ${url}`)

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        console.warn(`API request failed with status ${response.status} for ${endpoint}`)
        return { success: false, message: "internal server error" }
      }

      const data = await response.json()
      console.log(`API response for ${endpoint}:`, data)
      return data
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      return { success: false, message: "internal server error" }
    }
  }

  async getPartners(params: Record<string, any> = {}): Promise<ApiResponse<PartnersResponse>> {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<PartnersResponse>(`/partners?${searchParams.toString()}`)
  }

  async getPartner(partnerId: string): Promise<ApiResponse<{ partner: Partner; similarPartners: Partner[] }>> {
    return this.request<{ partner: Partner; similarPartners: Partner[] }>(`/partners/${partnerId}`)
  }

  async getPartnerPortfolio(
    partnerId: string,
    params: Record<string, any> = {},
  ): Promise<
    ApiResponse<{
      images: string[]
      companyName: string
      pagination: any
    }>
  > {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<{
      images: string[]
      companyName: string
      pagination: any
    }>(`/partners/${partnerId}/portfolio?${searchParams.toString()}`)
  }

  async getFilterOptions(): Promise<ApiResponse<FilterOptions>> {
    return this.request<FilterOptions>("/partners/filters/options")
  }

  async getSearchSuggestions(query: string): Promise<ApiResponse<SearchSuggestionsResponse>> {
    const searchParams = new URLSearchParams({ q: query })
    return this.request<SearchSuggestionsResponse>(`/partners/search/suggestions?${searchParams.toString()}`)
  }

  async getFeaturedPartners(limit = 8): Promise<ApiResponse<{ partners: Partner[] }>> {
    const searchParams = new URLSearchParams({ limit: limit.toString() })
    return this.request<{ partners: Partner[] }>(`/partners/featured?${searchParams.toString()}`)
  }

  async getPartnersByLocation(
    location: string,
    params: Record<string, any> = {},
  ): Promise<
    ApiResponse<{
      partners: Partner[]
      location: string
      pagination: any
    }>
  > {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<{
      partners: Partner[]
      location: string
      pagination: any
    }>(`/partners/by-location/${encodeURIComponent(location)}?${searchParams.toString()}`)
  }

  async getStats(): Promise<ApiResponse<StatsResponse>> {
    return this.request<StatsResponse>("/stats")
  }

  async health(): Promise<{ status: "healthy" | "degraded" }> {
    try {
      const response = await this.getStats()
      return { status: response.success ? "healthy" : "degraded" }
    } catch {
      return { status: "degraded" }
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
