"use client"

import React from "react"

export interface FiltersState {
  budget: number // 0-100 slider value representing 10k-10L
  rating: number // 1-5 stars
  types: string[] // Studios/Agencies/Freelance
}

interface SearchFiltersProps {
  filters: FiltersState
  onChange: (updated: FiltersState) => void
}

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  const { budget, rating, types } = filters

  const update = (partial: Partial<FiltersState>) => onChange({ ...filters, ...partial })

  const toggleType = (type: string) => {
    const newTypes = types.includes(type) ? types.filter((t) => t !== type) : [...types, type]
    update({ types: newTypes })
  }

  return (
    <aside className="space-y-8 text-gray-900 dark:text-white">
      <h2 className="text-2xl font-semibold">Filter</h2>

      {/* Budget */}
      <div>
        <h3 className="text-lg font-medium mb-1 flex items-center justify-between">
          <span>Budget</span>
          <span className="text-sm text-gray-500">≤ ₹{(10000 + (budget / 100) * 990000).toLocaleString()}</span>
        </h3>
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>10K</span>
          <span>10L</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={budget}
          onChange={(e) => update({ budget: Number(e.currentTarget.value) })}
          className="w-full h-2 accent-gray-900 dark:accent-white cursor-pointer"
        />
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-lg font-medium mb-1 flex items-center justify-between">
          <span>Rating</span>
          <span className="text-sm text-gray-500">≤ {rating}★</span>
        </h3>
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>1☆</span>
          <span>5☆</span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={rating}
          onChange={(e) => update({ rating: Number(e.currentTarget.value) })}
          className="w-full h-2 accent-gray-900 dark:accent-white cursor-pointer"
        />
      </div>

      {/* Type */}
      <div>
        <h3 className="text-lg font-medium mb-4">Type</h3>
        <div className="flex flex-col gap-3">
          {["Studios", "Agencies", "Freelance"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleType(option)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${types.includes(option) ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "text-gray-800 dark:text-gray-200"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
