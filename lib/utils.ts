import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Returns great-circle distance between two latitude/longitude points in kilometres
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371 // Earth radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Pre-computed lat/lon for the Indian cities returned by the /partners filter list
// Using a static table avoids the extra HTTP geocoding round-trips so we can
// choose the nearest city in a few milliseconds.
export const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  Ahmedabad: { lat: 23.0225, lon: 72.5714 },
  Bangalore: { lat: 12.9716, lon: 77.5946 },
  Bengaluru: { lat: 12.9716, lon: 77.5946 },
  Chandigarh: { lat: 30.7333, lon: 76.7794 },
  Chennai: { lat: 13.0827, lon: 80.2707 },
  Delhi: { lat: 28.7041, lon: 77.1025 },
  Delihi: { lat: 28.7041, lon: 77.1025 }, // typo variant from API
  "Greater Noida": { lat: 28.4744, lon: 77.5030 },
  Gurgaon: { lat: 28.4595, lon: 77.0266 },
  Hyderabad: { lat: 17.3850, lon: 78.4867 },
  Jaipur: { lat: 26.9124, lon: 75.7873 },
  Kochi: { lat: 9.9312, lon: 76.2673 },
  Kolkata: { lat: 22.5726, lon: 88.3639 },
  Lucknow: { lat: 26.8467, lon: 80.9462 },
  Mumbai: { lat: 19.0760, lon: 72.8777 },
  NOIDA: { lat: 28.5355, lon: 77.3910 },
  Noida: { lat: 28.5355, lon: 77.3910 },
  Noshsbs: { lat: 28.5355, lon: 77.3910 }, // unknown -> default to Noida coords
  Pune: { lat: 18.5204, lon: 73.8567 },
}
