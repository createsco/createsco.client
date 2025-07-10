import { Button } from "@/components/ui/button"
import { Apple, Play } from "lucide-react"

export function MobileAppPromo() {
  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-3xl md:text-4xl font-normal text-gray-900 dark:text-white mb-6">
          Take Pixisphere with you
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Download our mobile app to browse photographers, manage bookings, and view your photos on the go. Available
          for iOS and Android.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
            <Apple className="h-5 w-5 mr-2" />
            App Store
          </Button>
          <Button className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
            <Play className="h-5 w-5 mr-2" />
            Google Play
          </Button>
        </div>
      </div>
      <div className="relative">
        <img
          src="/placeholder.jpg"
          alt="Pixisphere Mobile App"
          className="rounded-2xl shadow-xl mx-auto"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement
            if (!target.dataset.fallback) {
              target.dataset.fallback = "true"
              target.src = "/placeholder.jpg"
            }
          }}
        />
      </div>
    </div>
  )
}
