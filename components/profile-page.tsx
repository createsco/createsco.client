"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import CreateLeadDialog from "@/components/create-lead-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Star,
  MapPin,
  Calendar,
  CheckCircle,
  Camera,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  ArrowLeft,
  Phone,
  Mail,
  ExternalLink,
  Award,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface ProfileData {
  _id: string
  specializations: string[]
  portfolio: string[]
  experienceYears: number
  servingLocations: string[]
  avgRating: number
  totalReviews: number
  verified: boolean
  projectStats: {
    total: number
    completed: number
    ongoing: number
  }
  partnerLocations: Array<{
    city: string
    state: string
    coordinates: {
      lat: number
      lng: number
    }
    pinCodesServed: string[]
    _id: string
  }>
  createdAt: string
  companyName: string
  partnerType: string
  socialLinks: {
    website?: string
    instagram?: string
    facebook?: string
    x?: string
    pinterest?: string
    youtube?: string
  }
  user: {
    username: string
    profilePic: string | null
  }
  userId: string
  services: Array<{
    serviceId: string
    name: string
    description: string
    basePrice: number
    priceUnit: string
  }>
  completionRate: number
  hasLocationPricing: boolean
}

interface ProfilePageProps {
  data: ProfileData
}

export default function ProfilePage({ data }: ProfilePageProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [showStickyButtons, setShowStickyButtons] = useState(false)
  const contactButtonsRef = useRef<HTMLDivElement>(null)

  const formatSpecialization = (spec: string) => {
    return spec.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-4 w-4" />
      case "facebook":
        return <Facebook className="h-4 w-4" />
      case "x":
        return <Twitter className="h-4 w-4" />
      case "website":
        return <Globe className="h-4 w-4" />
      default:
        return <ExternalLink className="h-4 w-4" />
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (contactButtonsRef.current) {
        const rect = contactButtonsRef.current.getBoundingClientRect()
        const isOutOfView = rect.bottom < 0
        setShowStickyButtons(isOutOfView)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Preload all portfolio images once to ensure instant switching
  useEffect(() => {
    if (typeof window === "undefined") return
    data.portfolio.forEach((src) => {
      const img = new window.Image()
      img.src = src
    })
  }, [data.portfolio])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Back link */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Link href="/" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profiles
        </Link>
      </div>

      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Profile Info */}
            <div className="flex flex-col sm:flex-row gap-6 flex-1">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 mx-auto sm:mx-0 flex-shrink-0">
                <AvatarImage src={data.user.profilePic || undefined} alt={data.companyName} />
                <AvatarFallback className="text-2xl font-semibold">{data.companyName.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{data.companyName}</h1>
                  {data.verified && <CheckCircle className="h-6 w-6 text-blue-500 mx-auto sm:mx-0" />}
                </div>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                  <Badge variant="secondary">{data.partnerType === "company" ? "Company" : "Individual"}</Badge>
                  <Badge variant="outline" className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <Calendar className="h-3 w-3" />
                    {data.experienceYears} years experience
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <MapPin className="h-3 w-3" />
                    {data.servingLocations.join(", ")}
                  </Badge>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2 mb-4 text-gray-900 dark:text-white">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(data.avgRating) ? "text-yellow-400 fill-current" : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{data.avgRating}</span>
                  <span className="text-gray-500 dark:text-gray-400">({data.totalReviews} reviews)</span>
                </div>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {data.specializations.slice(0, 3).map((spec, index) => (
                    <Badge key={index} variant="outline" className="text-xs text-gray-700 dark:text-gray-300">
                      {formatSpecialization(spec)}
                    </Badge>
                  ))}
                  {data.specializations.length > 3 && (
                    <Badge variant="outline" className="text-xs text-gray-700 dark:text-gray-300">
                      +{data.specializations.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Buttons */}
            <div ref={contactButtonsRef} className="flex flex-col gap-3 w-full sm:w-auto sm:min-w-[200px]">
              <CreateLeadDialog partnerId={data.userId || data._id} />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-5 w-5 text-blue-600 mr-1" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{data.projectStats.total}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-1" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(data.completionRate)}%</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-purple-600 mr-1" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalReviews}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Happy Clients</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-orange-600 mr-1" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{data.projectStats.ongoing}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${showStickyButtons ? "pb-24 md:pb-8" : ""}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Portfolio */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Camera className="h-6 w-6 mr-3" />
                  Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="aspect-video relative overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={data.portfolio[selectedImage] || "/placeholder.svg"}
                      alt={`Portfolio ${selectedImage + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {data.portfolio.slice(0, 4).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square relative overflow-hidden rounded-lg border-2 transition-all hover:scale-105 ${
                          selectedImage === index ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200"
                        }`}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Portfolio thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Services & Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.services.map((service) => (
                    <div
                      key={service.serviceId}
                      className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{service.name}</h3>
                          {service.description && <p className="text-gray-600 dark:text-gray-400">{service.description}</p>}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-green-600">{formatPrice(service.basePrice)}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{service.priceUnit.replace("_", " ")}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {data.hasLocationPricing && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-800 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Pricing may vary based on location and project requirements
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Specializations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Specializations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.specializations.map((spec, index) => (
                    <Badge key={index} variant="secondary" className="text-sm text-gray-700 dark:text-gray-300">
                      {formatSpecialization(spec)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Service Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.partnerLocations.map((location) => (
                  <div key={location._id}>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {location.city}, {location.state}
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Pin Codes:</strong> {location.pinCodesServed.join(", ")}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Social Links */}
            {Object.entries(data.socialLinks).some(([_, url]) => url) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Connect</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(data.socialLinks).map(
                      ([platform, url]) =>
                        url && (
                          <Button
                            key={platform}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start bg-transparent"
                            asChild
                          >
                            <Link href={url} target="_blank" rel="noopener noreferrer">
                              {getSocialIcon(platform)}
                              <span className="ml-2 capitalize text-gray-700 dark:text-gray-300">{platform}</span>
                            </Link>
                          </Button>
                        ),
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Bottom spacer for mobile when sticky buttons are visible */}
        {showStickyButtons && <div className="h-20 md:hidden" />}

        {/* Sticky Contact Buttons for Mobile */}
        <div
          className={`fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-50 md:hidden transition-transform duration-300 ease-in-out ${
            showStickyButtons ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex gap-3 max-w-sm mx-auto">
            <Button className="flex-1 h-12">
              <Phone className="h-4 w-4 mr-2" />
              Contact
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
