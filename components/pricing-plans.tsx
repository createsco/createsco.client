import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Basic",
    price: "Free",
    description: "Perfect for clients looking for photographers",
    features: [
      "Browse photographers and studios",
      "View photographer profiles",
      "Read reviews and ratings",
      "Contact photographers",
      "Basic search filters",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "₹999",
    period: "per month",
    description: "For professional photographers and studios",
    features: [
      "Featured in search results",
      "Detailed profile customization",
      "Unlimited portfolio uploads",
      "Booking management system",
      "Client communication tools",
      "Analytics and insights",
      "Priority customer support",
    ],
    cta: "Start 14-day trial",
    popular: true,
  },
  {
    name: "Business",
    price: "₹2,499",
    period: "per month",
    description: "For photography studios and agencies",
    features: [
      "All Pro features",
      "Multiple photographer profiles",
      "Team management",
      "Advanced analytics",
      "Custom branding",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export function PricingPlans() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {plans.map((plan, index) => (
        <Card
          key={index}
          className={`relative ${
            plan.popular
              ? "border-2 border-gray-900 dark:border-white shadow-lg"
              : "border border-gray-200 dark:border-gray-700"
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-0 right-0 flex justify-center">
              <span className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs font-medium px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <div className="mt-4 flex items-baseline text-gray-900 dark:text-white">
              <span className="text-4xl font-normal tracking-tight">{plan.price}</span>
              {plan.period && <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">{plan.period}</span>}
            </div>
            <CardDescription className="mt-4">{plan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <Check className="h-4 w-4 text-gray-900 dark:text-white mr-3 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className={`w-full ${
                plan.popular
                  ? "bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                  : ""
              }`}
              variant={plan.popular ? "default" : "outline"}
            >
              {plan.cta}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
