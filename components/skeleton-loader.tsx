import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PhotographerSkeleton() {
  return (
    <div className="space-y-3 w-full sm:w-[280px] flex-shrink-0">
      {/* Image skeleton */}
      <Skeleton className="aspect-[4/5] w-full rounded-2xl" />

      {/* Content skeleton */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-2/3 mt-1" />
      </div>
    </div>
  )
}

export function StudioSkeleton() {
  return (
    <div className="space-y-3 w-full sm:w-[280px] flex-shrink-0">
      {/* Image skeleton */}
      <Skeleton className="aspect-[3/2] w-full rounded-2xl" />

      {/* Content skeleton */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 mt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function BlogSkeleton() {
  return (
    <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <Skeleton className="aspect-video w-full rounded-2xl mb-6" />
      <CardContent className="p-6">
        <div className="space-y-3">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  )
}

export function TestimonialSkeleton() {
  return (
    <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-12 text-center">
        <div className="flex justify-center mb-6 gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-5 rounded-full" />
          ))}
        </div>
        <div className="space-y-2 mb-8">
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
          <Skeleton className="h-4 w-2/3 mx-auto" />
        </div>
        <div className="flex items-center justify-center gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24 mt-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
