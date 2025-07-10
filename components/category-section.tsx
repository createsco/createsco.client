"use client"

import React from "react"

import { ArrowRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface CategorySectionProps {
  title: string
  viewAllLink?: string
  children: React.ReactNode
  loading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
}

export function CategorySection({
  title,
  viewAllLink,
  children,
  loading = false,
  hasMore = false,
  onLoadMore,
}: CategorySectionProps) {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-normal text-gray-900 dark:text-white">{title}</h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 group"
          >
            View all
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Turn children into an array so we can check length */}
      {(() => {
        const items = React.Children.toArray(children)

        const contentToRender =
          items.length === 0 ? (
            <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center text-gray-600 dark:text-gray-300">
              No matching data
            </div>
          ) : (
            items
          )

        return (
          <>
            {/* Slider style scroll container for all viewport sizes */}
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
              {contentToRender}
            </div>

            {hasMore && onLoadMore && (
              <div className="flex justify-center mt-8">
                <Button
                  type="button"
                  onClick={onLoadMore}
                  variant="outline"
                  disabled={loading}
                  className="flex items-center gap-2 bg-transparent"
                >
                  {loading ? "Loading..." : "Load More"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )
      })()}
    </section>
  )
}
