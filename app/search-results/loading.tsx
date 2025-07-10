import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function SearchResultsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96 mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-8">
        {/* Filters Sidebar Skeleton */}
        <div className="w-80 flex-shrink-0">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-24 mb-6" />

              {/* Budget Filter Skeleton */}
              <div className="mb-8">
                <Skeleton className="h-5 w-16 mb-3" />
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-6 w-full" />
              </div>

              {/* Rating Filter Skeleton */}
              <div className="mb-8">
                <Skeleton className="h-5 w-16 mb-3" />
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-6 w-full" />
              </div>

              {/* Type Filter Skeleton */}
              <div>
                <Skeleton className="h-5 w-12 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1">
          {/* Tabs Skeleton */}
          <Skeleton className="h-10 w-full mb-6" />

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
