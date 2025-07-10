import { Skeleton } from "@/components/ui/skeleton"

export default function SearchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 flex gap-8">
      {/* Sidebar Skeleton */}
      <div className="hidden lg:block w-60 flex-shrink-0">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-6 w-20 mb-3" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-6 w-16 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-24 mb-3" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1">
        {/* Header Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-64 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-6">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
