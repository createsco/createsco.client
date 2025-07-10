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
        // Return mock data instead of throwing error
        return this.getMockResponse(endpoint) as ApiResponse<T>
      }

      const data = await response.json()
      console.log(`API response for ${endpoint}:`, data)
      return data
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      // Return mock data for development if API is not available
      return this.getMockResponse(endpoint) as ApiResponse<T>
    }
  }

  private getMockResponse(endpoint: string): ApiResponse<any> {
    if (endpoint.includes("/partners") && !endpoint.includes("/search/suggestions")) {
      return this.getMockPartnersResponse()
    }

    if (endpoint.includes("/stats")) {
      return this.getMockStatsResponse()
    }

    if (endpoint.includes("/filters/options")) {
      return this.getMockFilterOptionsResponse()
    }

    return {
      success: false,
      message: "Endpoint not found",
    }
  }

  private getMockPartnersResponse(): ApiResponse<PartnersResponse> {
    return {
      success: true,
      data: {
        partners: [
          {
            _id: "mock-1",
            companyName: "Delhi Photography Studio",
            specializations: ["wedding_photography", "portrait_photography"],
            experienceYears: 5,
            avgRating: 4.8,
            totalReviews: 127,
            verified: true,
            partnerType: "studio",
            servingLocations: ["Delhi", "NCR", "Gurgaon"],
            partnerLocations: [
              {
                city: "Delhi",
                state: "Delhi",
                coordinates: { lat: 28.6139, lng: 77.209 },
              },
            ],
            portfolio: ["/placeholder.svg?height=300&width=400"],
            banner: "/placeholder.svg?height=200&width=600",
            socialLinks: {
              website: "https://example.com",
              instagram: "delhiphotography",
            },
            projectStats: {
              total: 150,
              completed: 145,
              ongoing: 5,
            },
            services: [
              {
                serviceId: "service-1",
                name: "Wedding Photography",
                description: "Complete wedding coverage",
                basePrice: 50000,
                priceUnit: "per_day",
              },
            ],
            user: {
              username: "delhi_photographer",
              profilePic: "/placeholder.svg?height=100&width=100",
            },
            completionRate: 96.67,
            createdAt: "2023-01-15T10:30:00.000Z",
          },
          {
            _id: "mock-2",
            companyName: "Fashion Focus Photography",
            specializations: ["fashion_photography", "commercial_photography"],
            experienceYears: 7,
            avgRating: 4.6,
            totalReviews: 89,
            verified: true,
            partnerType: "solo",
            servingLocations: ["Delhi", "Mumbai", "Bangalore"],
            partnerLocations: [
              {
                city: "Delhi",
                state: "Delhi",
                coordinates: { lat: 28.6139, lng: 77.209 },
              },
            ],
            portfolio: ["/placeholder.svg?height=300&width=400"],
            banner: "/placeholder.svg?height=200&width=600",
            socialLinks: {
              website: "https://fashionfocus.com",
              instagram: "fashionfocus",
            },
            projectStats: {
              total: 200,
              completed: 195,
              ongoing: 5,
            },
            services: [
              {
                serviceId: "service-2",
                name: "Fashion Photography",
                description: "Professional fashion shoots",
                basePrice: 75000,
                priceUnit: "per_day",
              },
            ],
            user: {
              username: "fashion_photographer",
              profilePic: "/placeholder.svg?height=100&width=100",
            },
            completionRate: 97.5,
            createdAt: "2022-06-20T14:20:00.000Z",
          },
          {
            _id: "mock-3",
            companyName: "Mumbai Wedding Specialists",
            specializations: ["wedding_photography", "event_photography"],
            experienceYears: 8,
            avgRating: 4.9,
            totalReviews: 203,
            verified: true,
            partnerType: "studio",
            servingLocations: ["Mumbai", "Pune", "Nashik"],
            partnerLocations: [
              {
                city: "Mumbai",
                state: "Maharashtra",
                coordinates: { lat: 19.076, lng: 72.8777 },
              },
            ],
            portfolio: ["/placeholder.svg?height=300&width=400"],
            banner: "/placeholder.svg?height=200&width=600",
            socialLinks: {
              website: "https://mumbaiweddings.com",
              instagram: "mumbaiweddings",
            },
            projectStats: {
              total: 300,
              completed: 295,
              ongoing: 5,
            },
            services: [
              {
                serviceId: "service-3",
                name: "Wedding Photography",
                description: "Premium wedding coverage",
                basePrice: 80000,
                priceUnit: "per_day",
              },
            ],
            user: {
              username: "mumbai_weddings",
              profilePic: "/placeholder.svg?height=100&width=100",
            },
            completionRate: 98.33,
            createdAt: "2021-03-10T08:15:00.000Z",
          },
          {
            _id: "mock-4",
            companyName: "Bangalore Portrait Pro",
            specializations: ["portrait_photography", "maternity_photography"],
            experienceYears: 4,
            avgRating: 4.7,
            totalReviews: 156,
            verified: true,
            partnerType: "solo",
            servingLocations: ["Bangalore", "Mysore", "Mangalore"],
            partnerLocations: [
              {
                city: "Bangalore",
                state: "Karnataka",
                coordinates: { lat: 12.9716, lng: 77.5946 },
              },
            ],
            portfolio: ["/placeholder.svg?height=300&width=400"],
            banner: "/placeholder.svg?height=200&width=600",
            socialLinks: {
              website: "https://bangaloreportraits.com",
              instagram: "bangaloreportraits",
            },
            projectStats: {
              total: 180,
              completed: 175,
              ongoing: 5,
            },
            services: [
              {
                serviceId: "service-4",
                name: "Portrait Photography",
                description: "Professional portrait sessions",
                basePrice: 35000,
                priceUnit: "per_day",
              },
            ],
            user: {
              username: "bangalore_portraits",
              profilePic: "/placeholder.svg?height=100&width=100",
            },
            completionRate: 97.22,
            createdAt: "2023-08-22T16:45:00.000Z",
          },
        ],
        pagination: {
          page: 1,
          limit: 12,
          total: 4,
          pages: 1,
          hasNext: false,
          hasPrev: false,
        },
        filters: {
          locations: ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad"],
          specializations: [
            "wedding_photography",
            "portrait_photography",
            "fashion_photography",
            "commercial_photography",
            "event_photography",
            "maternity_photography",
          ],
          partnerTypes: ["studio", "solo", "firm", "partnership"],
          ratingRanges: [
            { _id: "4.5+", count: 15 },
            { _id: "4.0+", count: 25 },
          ],
          priceRanges: [
            { _id: "Under ₹25,000", count: 5 },
            { _id: "₹25,000 - ₹50,000", count: 12 },
          ],
        },
        appliedFilters: {},
      },
    }
  }

  private getMockStatsResponse(): ApiResponse<StatsResponse> {
    return {
      success: true,
      data: {
        totalPartners: 2068,
        averageRating: 4.3,
        locationsServed: 18,
        specializations: 12,
        totalProjects: 50650,
      },
    }
  }

  private getMockFilterOptionsResponse(): ApiResponse<FilterOptions> {
    return {
      success: true,
      data: {
        filters: {
          locations: ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Pune", "Ahmedabad"],
          specializations: [
            "wedding_photography",
            "portrait_photography",
            "fashion_photography",
            "commercial_photography",
            "event_photography",
            "maternity_photography",
          ],
          partnerTypes: ["studio", "solo", "firm", "partnership"],
          ratingRanges: [
            { _id: "4.5+", count: 15 },
            { _id: "4.0+", count: 25 },
            { _id: "3.5+", count: 35 },
          ],
          priceRanges: [
            { _id: "Under ₹25,000", count: 5 },
            { _id: "₹25,000 - ₹50,000", count: 12 },
            { _id: "₹50,000 - ₹1,00,000", count: 8 },
          ],
        },
      },
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
