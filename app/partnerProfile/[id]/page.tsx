import { notFound } from "next/navigation"
import ProfilePage from "@/components/profile-page"
import { apiClient, Partner } from "@/lib/api-client"

// Transform backend Partner -> ProfilePage consumable props
function mapPartnerToProfile(partner: Partner) {
  return {
    _id: partner._id,
    specializations: partner.specializations ?? [],
    portfolio: partner.portfolio?.length ? partner.portfolio : [partner.banner ?? "/placeholder.svg"],
    experienceYears: partner.experienceYears ?? 0,
    servingLocations: partner.servingLocations ?? [],
    avgRating: partner.avgRating ?? 0,
    totalReviews: partner.totalReviews ?? 0,
    verified: partner.verified ?? false,
    projectStats: partner.projectStats ?? { total: 0, completed: 0, ongoing: 0 },
    partnerLocations: (partner.partnerLocations ?? []).map((loc, idx) => ({
      city: loc.city ?? "",
      state: loc.state ?? "",
      coordinates: loc.coordinates ?? { lat: 0, lng: 0 },
      pinCodesServed: loc.pinCodesServed ?? [],
      _id: (loc as any)._id ?? `${partner._id}-loc-${idx}`,
    })),
    createdAt: partner.createdAt ?? "",
    companyName: partner.companyName ?? "Unknown",
    userId: (partner as any).userId ?? "",
    partnerType: partner.partnerType ?? "solo",
    socialLinks: partner.socialLinks ?? {},
    user: partner.user ?? { username: "", profilePic: null },
    services: partner.services ?? [],
    completionRate: partner.completionRate ?? 0,
    hasLocationPricing: partner.hasLocationPricing ?? false,
    price: partner.services?.[0]?.basePrice
      ? `₹${partner.services[0].basePrice.toLocaleString()}`
      : "Contact for pricing",
  }
}

type PartnerProfileRouteProps = { params: Promise<{ id: string }> }

export default async function PartnerProfileRoute({ params }: PartnerProfileRouteProps) {
  const { id } = await params

  // Fetch from backend
  const response = await apiClient.getPartner(id)

  if (!response.success || !response.data?.partner) {
    notFound()
  }

  const profileData = mapPartnerToProfile(response.data.partner)

  return <ProfilePage data={profileData} />
}
