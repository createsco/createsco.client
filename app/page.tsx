"use client"

import type React from "react"
import Link from "next/link"
import { Star, ArrowRight, Sparkles, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { PhotographerSkeleton, BlogSkeleton, TestimonialSkeleton, StudioSkeleton } from "@/components/skeleton-loader"
import { FeaturedLocations } from "@/components/featured-locations"
import { PricingPlans } from "@/components/pricing-plans"
import { MobileAppPromo } from "@/components/mobile-app-promo"
import { FaqSection } from "@/components/faq-section"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { PartnerCard } from "@/components/photographer-card"
import { CategorySection } from "@/components/category-section"
import { SearchSection } from "@/components/search-section"
import { usePhotographers, useStudios } from "@/hooks/use-api-data"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api-client"
import { haversineDistance, CITY_COORDS } from "@/lib/utils"
import { usePartnerCardCache } from "./hooks/use-partner-cache"

// Data arrays
const workSteps = [
  {
    title: "Browse & Search",
    description: "Explore our curated list of verified photographers and studios",
  },
  {
    title: "Connect & Discuss",
    description: "Chat directly with photographers to discuss your requirements",
  },
  {
    title: "Book & Enjoy",
    description: "Secure your booking and enjoy your professional photoshoot",
  },
]

const testimonials = [
  {
    name: "Priya Sharma",
    event: "Wedding in Mumbai",
    text: "Found the perfect photographer for our wedding. The entire process was seamless and the photos exceeded our expectations!",
    image: "/images/client-1.jpg",
  },
  {
    name: "Rahul Verma",
    event: "Corporate Event",
    text: "Professional service and amazing quality. The photographer captured every important moment of our company event.",
    image: "/images/client-2.jpg",
  },
  {
    name: "Ananya Patel",
    event: "Maternity Shoot",
    text: "Such a beautiful experience! The photographer made me feel comfortable and the photos are absolutely stunning.",
    image: "/images/client-3.jpg",
  },
]

// Type definitions
interface BlogPost {
  title: string
  excerpt: string
  image: string
  date: string
  readTime: string
}

interface Photographer {
  id?: string
  name: string
  image: string
  price: string
  location: string
  specialty: string
  experience: string
  rating: string
  isFavorite?: boolean
  verified?: boolean
  partnerType?: string
}

interface BlogCardProps {
  title: string
  excerpt: string
  image: string
  date: string
  readTime: string
}

function generateBlogPosts(count: number): BlogPost[] {
  const posts = [
    {
      title: "10 Tips for Choosing the Perfect Wedding Photographer",
      excerpt:
        "Your wedding day is one of the most important days of your life. Here's how to find a photographer who will capture every precious moment.",
      image: "/images/blog-1.jpg",
      date: "Dec 15, 2024",
      readTime: "5 min",
    },
    {
      title: "The Rise of Candid Photography in Indian Weddings",
      excerpt:
        "Explore how candid photography has transformed the way we capture Indian wedding celebrations and why it's becoming increasingly popular.",
      image: "/images/blog-2.jpg",
      date: "Dec 12, 2024",
      readTime: "7 min",
    },
    {
      title: "Studio vs Outdoor Photography: Which is Right for You?",
      excerpt:
        "Understanding the differences between studio and outdoor photography to help you make the best choice for your photoshoot.",
      image: "/images/blog-3.jpg",
      date: "Dec 10, 2024",
      readTime: "4 min",
    },
  ]
  return posts.slice(0, count)
}

function BlogCard({ title, excerpt, image, date, readTime }: BlogCardProps) {
  return (
    <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-md transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
      <div className="aspect-video relative overflow-hidden rounded-2xl mb-6">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.src = "/placeholder.svg?height=200&width=300"
          }}
        />
      </div>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span>{date}</span>
          <span>•</span>
          <span>{readTime} read</span>
        </div>
        <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-lg leading-snug">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{excerpt}</p>
      </CardContent>
    </Card>
  )
}

// Error Display Component
function ErrorDisplay({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Unable to Load Data</h3>
        <p className="text-red-600 dark:text-red-300 text-sm mb-4">{error}</p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30 bg-transparent"
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  // List of major Indian cities for fallback
  const majorCities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Hyderabad",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Surat",
    "Jaipur",
  ]

  // State for user's city
  const [userCity, setUserCity] = useState<string>("Mumbai") // Default fallback
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [cityLoading, setCityLoading] = useState(true)

  // Available cities from API for fallback determination
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [fallbackApplied, setFallbackApplied] = useState(false)

  // Dynamic categories from API
  const [categories, setCategories] = useState<string[]>(["All"])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Detect user's city on mount
  useEffect(() => {
    const detectCity = async () => {
      try {
        setCityLoading(true)

        const geoApiUrl = process.env.NEXT_PUBLIC_GEOLOCATION_API || "https://ipapi.co/json/"
        const geoRes = await fetch(geoApiUrl)
        const geoData = await geoRes.json()

        const city =
          geoData.city || geoData.town || geoData.village || geoData.region || geoData.state || geoData.country_name

        if (city) {
          setUserCity(city)
        }

        if (geoData.latitude && geoData.longitude) {
          setUserCoords({ lat: Number(geoData.latitude), lon: Number(geoData.longitude) })
        }
      } catch (error) {
        console.error("IP Geolocation failed, falling back to default city", error)
      } finally {
        setCityLoading(false)
      }
    }

    detectCity()
  }, [])

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await apiClient.getFilterOptions()

        if (response.success && response.data?.filters?.specializations) {
          const formattedCategories = response.data.filters.specializations.map((spec) =>
            spec
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())
              .replace("Photography", "")
              .trim(),
          )

          const uniqueCategories = [
            "All",
            ...Array.from(new Set(formattedCategories)),
          ]

          setCategories(uniqueCategories)
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        // Fallback categories
        setCategories([
          "All",
          "Wedding",
          "Portrait",
          "Maternity",
          "Fashion",
          "Events",
          "Corporate",
          "Newborn",
          "Family",
          "Product",
          "Architecture",
          "Food",
          "Travel",
        ])
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Fetch all available partner locations for fallback comparison
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await apiClient.getPartners({ page: 1, limit: 1 })
        if (res.success && res.data?.filters?.locations) {
          setAvailableCities(res.data.filters.locations)
        }
      } catch (error) {
        console.error("Failed to fetch available locations", error)
      }
    }

    fetchLocations()
  }, [])

  // State for photographers in user's city
  const [userCityPage, setUserCityPage] = useState(1)
  const [activeCategory, setActiveCategory] = useState("All")

  // Convert category to API specialization format
  const getSpecializationFilter = (category: string) => {
    if (category === "All") return undefined
    // Convert to title case, but force 'photography' to be lowercase
    let formatted = category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    if (!formatted.endsWith('photography')) {
      formatted += ' photography'
    }
    return formatted
  }

  const {
    photographers: userCityPhotographers,
    loading: userCityLoading,
    error: userCityError,
    hasNextPage: userCityHasMore,
  } = usePhotographers({
    city: userCity,
    limit: 12,
    page: userCityPage,
    sortBy: "avgRating",
    sortOrder: "desc",
    shootType: getSpecializationFilter(activeCategory),
  })

  // If no partners found for the detected city, automatically switch to the
  // nearest available city (one-time) based on user coordinates.
  useEffect(() => {
    if (
      fallbackApplied ||
      cityLoading ||
      userCityLoading ||
      !userCoords ||
      userCityPhotographers.length !== 0 ||
      availableCities.length === 0
    ) {
      return
    }

    const findNearestCity = () => {
      let closestCity = availableCities[0]
      let minDistance = Infinity

      availableCities.forEach((city) => {
        const coords = CITY_COORDS[city as keyof typeof CITY_COORDS]
        if (!coords) return
        const dist = haversineDistance(userCoords.lat, userCoords.lon, coords.lat, coords.lon)
        if (dist < minDistance) {
          minDistance = dist
          closestCity = city
        }
      })

      if (closestCity && closestCity.toLowerCase() !== userCity.toLowerCase()) {
        setUserCity(closestCity)
        setFallbackApplied(true)
      }
    }

    findNearestCity()
  }, [
    fallbackApplied,
    cityLoading,
    userCityLoading,
    userCoords,
    userCityPhotographers.length,
    availableCities,
    userCity,
  ])

  // Pick two other major cities for the other sections
  const getOtherCities = () => {
    const filtered = majorCities.filter((city) => city.toLowerCase() !== userCity.toLowerCase())
    return [filtered[0] || "Delhi", filtered[1] || "Bangalore"]
  }
  const [otherCity1, otherCity2] = getOtherCities()

  // State for photographers in otherCity1
  const [otherCity1Page, setOtherCity1Page] = useState(1)
  const {
    photographers: otherCity1Photographers,
    loading: otherCity1Loading,
    error: otherCity1Error,
    hasNextPage: otherCity1HasMore,
  } = usePhotographers({
    city: otherCity1,
    limit: 12,
    page: otherCity1Page,
    sortBy: "avgRating",
    sortOrder: "desc",
    shootType: getSpecializationFilter(activeCategory),
  })

  // State for photographers in otherCity2
  const [otherCity2Page, setOtherCity2Page] = useState(1)
  const {
    photographers: otherCity2Photographers,
    loading: otherCity2Loading,
    error: otherCity2Error,
    hasNextPage: otherCity2HasMore,
  } = usePhotographers({
    city: otherCity2,
    limit: 12,
    page: otherCity2Page,
    sortBy: "avgRating",
    sortOrder: "desc",
    shootType: getSpecializationFilter(activeCategory),
  })

  // State for studios
  const [studiosPage, setStudiosPage] = useState(1)
  const {
    studios,
    loading: studiosLoading,
    error: studiosError,
    hasNextPage: studiosHasMore,
  } = useStudios({
    limit: 12,
    page: studiosPage,
  })

  const [blogPosts] = useState(generateBlogPosts(3))
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [showAIPrompt, setShowAIPrompt] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [mounted, setMounted] = useState(false)

  const { cards, setCards, lastFetched } = usePartnerCardCache()
  const [displayedCards, setDisplayedCards] = useState<any[]>(cards)
  const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

  useEffect(() => {
    // If cache is fresh, use it instantly
    if (cards.length > 0 && lastFetched && Date.now() - lastFetched < CACHE_TTL) {
      setDisplayedCards(cards)
    }
  }, [])

  // When photographers are fetched, update cache and displayedCards
  useEffect(() => {
    if (userCityPhotographers && userCityPhotographers.length > 0) {
      setCards(userCityPhotographers)
      setDisplayedCards(userCityPhotographers)
    }
  }, [userCityPhotographers])

  // Reset pages when category changes
  useEffect(() => {
    setUserCityPage(1)
    setOtherCity1Page(1)
    setOtherCity2Page(1)
  }, [activeCategory])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleAISearch = () => {
    console.log("AI Processing:", aiPrompt)
    setShowAIPrompt(false)
    setAiPrompt("")
  }

  if (!mounted) return null

  // Overall initial loading state: we show the big placeholder grid only
  //  • on first render (page === 1) OR
  //  • while critical static data (categories / city detection) is still loading.
  // After that, subsequent "Load More" requests should display their own
  // per-section skeletons without blanking the entire page.
  const initialLoading =
    loadingCategories ||
    cityLoading ||
    (userCityPage === 1 && userCityLoading) ||
    (otherCity1Page === 1 && otherCity1Loading) ||
    (otherCity2Page === 1 && otherCity2Loading) ||
    (studiosPage === 1 && studiosLoading)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header now provided by SiteHeader in RootLayout */}

      <main>
        {/* Enhanced Search Section */}
        <SearchSection onAIPromptClick={() => setShowAIPrompt(true)} />

        {/* Category Filters */}
        <section className="sticky top-[64px] z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-2 sm:py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
              {loadingCategories
                ? Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="shrink-0 h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
                    />
                  ))
                : categories.map((category) => (
                    <Button
                      key={category}
                      variant={activeCategory === category ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveCategory(category)}
                      className={`shrink-0 rounded-full px-4 sm:px-6 py-2 text-sm ${
                        activeCategory === category
                          ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {category}
                    </Button>
                  ))}
            </div>
          </div>
        </section>

        {/* Photographers by Location */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {initialLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <PhotographerSkeleton key={index} />
              ))}
            </div>
          ) : (
            <>
              {/* User's City Photographers */}
              <CategorySection
                title={`${activeCategory === "All" ? "Top rated shoots" : activeCategory + " photography"} in ${userCity}`}
                viewAllLink={`/search-results?location=${userCity}${activeCategory !== "All" ? `&specialization=${getSpecializationFilter(activeCategory)}` : ""}`}
                loading={userCityLoading || cityLoading}
                hasMore={userCityHasMore}
                onLoadMore={() => setUserCityPage((prev) => prev + 1)}
              >
                {userCityError ? (
                  <div className="col-span-full">
                    <ErrorDisplay error={userCityError} />
                  </div>
                ) : (
                  displayedCards.map((photographer: Photographer, index: number) => (
                    <PartnerCard
                      key={photographer.id || index}
                      {...photographer}
                      isFavorite={Number.parseFloat(photographer.rating) >= 4.9}
                    />
                  ))
                )}
                {userCityLoading && <PhotographerSkeleton />}
              </CategorySection>

              {/* Other City 1 Photographers */}
              <CategorySection
                title={`${activeCategory === "All" ? "Available" : activeCategory + " specialists"} in ${otherCity1} this weekend`}
                viewAllLink={`/search-results?location=${otherCity1}${activeCategory !== "All" ? `&specialization=${getSpecializationFilter(activeCategory)}` : ""}`}
                loading={otherCity1Loading}
                hasMore={otherCity1HasMore}
                onLoadMore={() => setOtherCity1Page((prev) => prev + 1)}
              >
                {otherCity1Error ? (
                  <div className="col-span-full">
                    <ErrorDisplay error={otherCity1Error} />
                  </div>
                ) : (
                  otherCity1Photographers.map((photographer: Photographer, index: number) => (
                    <PartnerCard
                      key={photographer.id || index}
                      {...photographer}
                      isFavorite={Number.parseFloat(photographer.rating) >= 4.9}
                    />
                  ))
                )}
                {otherCity1Loading && <PhotographerSkeleton />}
              </CategorySection>

              {/* Other City 2 Photographers */}
              <CategorySection
                title={`${activeCategory === "All" ? "Top rated" : "Best " + activeCategory.toLowerCase()} in ${otherCity2}`}
                viewAllLink={`/search-results?location=${otherCity2}${activeCategory !== "All" ? `&specialization=${getSpecializationFilter(activeCategory)}` : ""}`}
                loading={otherCity2Loading}
                hasMore={otherCity2HasMore}
                onLoadMore={() => setOtherCity2Page((prev) => prev + 1)}
              >
                {otherCity2Error ? (
                  <div className="col-span-full">
                    <ErrorDisplay error={otherCity2Error} />
                  </div>
                ) : (
                  otherCity2Photographers.map((photographer: Photographer, index: number) => (
                    <PartnerCard
                      key={photographer.id || index}
                      {...photographer}
                      isFavorite={Number.parseFloat(photographer.rating) >= 4.9}
                    />
                  ))
                )}
                {otherCity2Loading && <PhotographerSkeleton />}
              </CategorySection>

              {/* Studios */}
              <CategorySection
                title="Professional studios"
                viewAllLink="/search-results?partnerType=studio"
                loading={studiosLoading}
                hasMore={studiosHasMore}
                onLoadMore={() => setStudiosPage((prev) => prev + 1)}
              >
                {studiosError ? (
                  <div className="col-span-full">
                    <ErrorDisplay error={studiosError} />
                  </div>
                ) : (
                  studios.map((studio, index) => (
                    <PartnerCard
                      key={studio.id || index}
                      {...studio}
                      isFavorite={Number.parseFloat(studio.rating) >= 4.9}
                    />
                  ))
                )}
                {studiosLoading && <StudioSkeleton />}
              </CategorySection>
            </>
          )}
        </div>

        {/* Featured Locations */}
        <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-gray-900 dark:text-white mb-4">
                Popular locations
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Discover top photographers in these popular cities
              </p>
            </div>
            <FeaturedLocations />
          </div>
        </section>

        {/* How We Work */}
        <section id="how-it-works" className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-gray-900 dark:text-white mb-4">
                How we work
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Simple steps to find and book your perfect photographer
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
              {workSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-white dark:text-gray-900 font-medium text-lg">{index + 1}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile App Promo */}
        <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <MobileAppPromo />
          </div>
        </section>

        {/* Pricing Plans */}
        <section id="pricing" className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-gray-900 dark:text-white mb-4">
                Pricing plans
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Choose the perfect plan for your photography business
              </p>
            </div>
            <PricingPlans />
          </div>
        </section>

        {/* Still Confused Section */}
        <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-gray-900 dark:text-white mb-8 sm:mb-12">
              Still confused about your needs?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto">
              Let our AI help you find the perfect photographer based on your specific requirements
            </p>
            <Button
              onClick={() => setShowAIPrompt(true)}
              className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base"
            >
              <Sparkles className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
              Get AI recommendations
            </Button>
          </div>
        </section>

        {/* Testimonial Ticker */}
        <section className="py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-normal text-gray-900 dark:text-white mb-8 sm:mb-12 text-center">
              What our clients say
            </h2>
            <div className="relative overflow-hidden">
              {initialLoading ? (
                <TestimonialSkeleton />
              ) : (
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
                >
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="w-full flex-shrink-0">
                      <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <CardContent className="p-8 sm:p-12 text-center">
                          <div className="flex justify-center mb-6">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 sm:h-5 w-4 sm:w-5 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 italic leading-relaxed">
                            "{testimonial.text}"
                          </p>
                          <div className="flex items-center justify-center gap-4">
                            <img
                              src={testimonial.image || "/placeholder.svg"}
                              alt={testimonial.name}
                              className="w-10 sm:w-12 h-10 sm:h-12 rounded-full object-cover"
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                e.currentTarget.src = "/placeholder.svg?height=48&width=48"
                              }}
                            />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                                {testimonial.name}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {testimonial.event}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-gray-900 dark:text-white mb-4">
                Frequently asked questions
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                Find answers to common questions about Pixisphere
              </p>
            </div>
            <FaqSection />
          </div>
        </section>

        {/* Blog Section */}
        <section id="blog" className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-normal text-gray-900 dark:text-white">Latest from our blog</h2>
              <Link
                href="#blog"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {initialLoading
                ? Array.from({ length: 3 }).map((_, index) => <BlogSkeleton key={index} />)
                : blogPosts.map((post, index) => <BlogCard key={index} {...post} />)}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <NewsletterSignup />
          </div>
        </section>

        {/* Sticky AI Prompt Modal */}
        {showAIPrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white">
                  Describe your perfect photoshoot
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAIPrompt(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-sm sm:text-base">
                Tell us about your event, style preferences, budget, and any specific requirements. Our AI will
                recommend the perfect photographers for you.
              </p>
              <Textarea
                placeholder="e.g., I need a wedding photographer in Mumbai for a traditional ceremony with 200 guests. I prefer candid shots and have a budget of ₹50,000..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="mb-6 dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-xl text-sm sm:text-base"
                rows={4}
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleAISearch}
                  disabled={!aiPrompt.trim()}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 rounded-xl text-sm sm:text-base"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Get recommendations
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAIPrompt(false)}
                  className="dark:border-gray-700 dark:text-gray-300 rounded-xl text-sm sm:text-base"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-12 sm:py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8 sm:mb-12">
            <div className="sm:col-span-2 md:col-span-1">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Pixisphere
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                Find verified photographers and studios for your special moments.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.7 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2024 Pixisphere. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
