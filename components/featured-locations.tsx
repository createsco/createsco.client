import type React from "react"
import { MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useLocations } from "@/hooks/use-api-data"
import { Skeleton } from "@/components/ui/skeleton"

interface LocationCardProps {
  name: string
  photographers: number
  image: string
}

function LocationCard({ name, photographers, image }: LocationCardProps) {
  return (
    <Link href={`/search-results?location=${encodeURIComponent(name)}`}>
      <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        <div className="relative h-40 sm:h-48">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = "/placeholder.svg?height=192&width=320"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-white">
            <h3 className="text-lg sm:text-xl font-semibold mb-1">{name}</h3>
            <div className="flex items-center gap-1 text-sm text-white/90">
              <MapPin className="h-3 w-3" />
              <span>{photographers} photographers</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

function LocationSkeleton() {
  return (
    <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
      <Skeleton className="h-40 sm:h-48 w-full" />
    </Card>
  )
}

export function FeaturedLocations() {
  const { locations, loading, error } = useLocations()

  // Helper to generate a city image from Unsplash. Cache-busted with city name so it stays constant per deploy.
  const getLocationImage = (city: string) =>
    `https://source.unsplash.com/600x400/?${encodeURIComponent(city)}%20city,india`

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <LocationSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Unable to load locations</p>
        <p className="text-sm text-red-500 dark:text-red-400 mt-2">{error}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {locations.slice(0, 8).map((location) => (
        <LocationCard
          key={location.name}
          name={location.name}
          photographers={location.photographers}
          image={getLocationImage(location.name)}
        />
      ))}
    </div>
  )
}
