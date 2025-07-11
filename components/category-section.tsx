"use client"

import React from "react"
import type { ReactElement } from "react"

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

function isErrorElement(node: unknown): node is ReactElement<{ error: string }> {
  return (
    typeof node === "object" &&
    node !== null &&
    "props" in node &&
    typeof (node as any).props?.error === "string"
  );
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
        <h2 className="text-xl md:text-2xl font-normal text-gray-900 dark:text-white">{title}</h2>
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

        const isError = items.length === 1 && isErrorElement(items[0]);
        const errorMessage = isError ? (items[0] as ReactElement<{ error: string }>).props.error : "internal server error";
        const contentToRender =
          isError ? (
            <div className="w-full flex justify-center items-center">
              <div className="bg-red-600/90 text-white rounded-lg p-6 text-center max-w-xs w-full sm:w-auto border border-red-700 shadow mx-auto">
                <div className="font-semibold text-base mb-2">Unable to Load Data</div>
                <div className="text-sm opacity-90">{errorMessage}</div>
              </div>
            </div>
          ) : items.length === 0 ? (
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
