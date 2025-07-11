import type React from "react"
import { Star, MapPin, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import CreateLeadDialog from "@/components/create-lead-dialog"


interface PartnerCardProps {
  /** Partner document _id – used for profile page link */
  id?: string
  /** User document _id – used by Lead dialog */
  userId?: string
  name: string
  image: string
  rating: string
  price: string
  location: string
  /** For PhotographerCard */
  specialty?: string
  experience?: string
  /** For PartnerCard */
  specialties?: string[]
  photographers?: number
  isFavorite?: boolean
  verified?: boolean
}

export function PartnerCard({
  id,
  userId,
  name,
  image,
  rating,
  price,
  location,
  specialty,
  experience,
  isFavorite = false,
  verified = false,
}: PartnerCardProps) {
  // Debug: log every prop received by the card
  console.log("[PartnerCard] props", {
    id,
    userId,
    name,
    image,
    rating,
    price,
    location,
    specialty,
    experience,
    isFavorite,
    verified,
  })

  const cardContent = (
    <Card className="group w-full cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={image || "/placeholder.svg?height=240&width=320"}
          alt={name}
          className="w-full h-48 sm:h-52 lg:h-48 object-cover"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.src = "/placeholder.svg?height=240&width=320"
          }}
        />

        {/* Top Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 text-gray-800 text-xs">{isFavorite ? "Top" : "Featured"}</Badge>
        </div>

        {/* Favorite Button */}
        <div className="absolute top-3 right-3">
          <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full bg-white/80 hover:bg-white">
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </Button>
        </div>

        {/* Verified Badge */}
        {verified && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">Verified</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Name and Location */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-base lg:text-lg leading-tight truncate">
              {name}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(Number.parseFloat(rating))
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            ))}
            <span className="text-sm font-medium text-gray-900 dark:text-white ml-1">{rating}</span>
          </div>

          {/* Specialty */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs truncate max-w-full">
              {specialty}
            </Badge>
          </div>

          {/* Price */}
          <div className="text-sm">
            <span className="font-medium text-gray-900 dark:text-white">
              {price.startsWith("₹") ? price : `₹${price}`}
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">per day</span>
          </div>

          {/* Experience */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <div className="truncate">{experience}</div>
            <div className="mt-1 truncate">Reviews: Great experience, all events successfully...</div>
          </div>

          {/* Connect Button */}
          <div
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <CreateLeadDialog partnerId={userId || id} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (id) {
    const href = userId ? `/partnerProfile/${id}?uid=${userId}` : `/partnerProfile/${id}`
    return <Link href={href}>{cardContent}</Link>
  }
  return cardContent
}

export { PartnerCard as PhotographerCard }
