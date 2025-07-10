"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import UserAuthButtons from "@/components/user-auth-buttons"

export default function SiteHeader() {
  return (
    <header className="border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
          Pixisphere
        </Link>
        {/* Main navigation links removed – adjust here if new links are added in future */}
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <UserAuthButtons />
        </div>
      </div>
    </header>
  )
} 