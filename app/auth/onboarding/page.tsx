"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, User, Phone, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerifiedUser {
  firebaseUid: string
  email: string
  emailVerified: boolean
}

// API root resolves to whichever env var is provided
const API_ROOT = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "")
  .replace(/\/users$/, "")
  .replace(/\/$/, "")

// Translate Joi-style validation strings to friendlier text
const prettifyError = (msg: string): string => {
  if (!msg) return "Something went wrong. Please check your input."
  const regex = /"(.*?)" (.*)/
  const match = msg.match(regex)
  if (match) {
    const [, field, issue] = match
    const map: Record<string, string> = {
      username: "Username",
      email: "Email",
      phone: "Phone number",
      address: "Address",
    }
    const niceField = map[field] || field
    return `${niceField} ${issue}`.replace(/"/g, "")
  }
  return msg
}

// Common country codes used for auto detection
const COUNTRY_CODES: Record<string, string> = {
  "1": "+1",
  "91": "+91",
  "44": "+44",
  "86": "+86",
  "33": "+33",
  "49": "+49",
  "81": "+81",
  "61": "+61",
  "55": "+55",
}

export default function OnboardingPage() {
  const router = useRouter()

  /* ----------------------------- local state ----------------------------- */
  const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    phone: { countryCode: "+1", number: "" },
    address: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set())

  /* --------------------------- effects / helpers -------------------------- */
  useEffect(() => {
    const data = localStorage.getItem("verifiedUser")
    if (data) {
      const parsed = JSON.parse(data)
      setVerifiedUser(parsed)
      // Pre-fill username with verified email (immutable)
      setFormData((prev) => ({ ...prev, username: parsed.email }))
    } else {
      router.push("/auth/register")
    }
  }, [router])

  useEffect(() => {
    const completed = new Set<string>()
    if (formData.username.trim()) completed.add("username")
    if (formData.phone.number.trim()) completed.add("phone")
    if (formData.address.trim()) completed.add("address")
    setCompletedFields(completed)
  }, [formData])

  const getProgress = (): number => {
    const total = 3 // username, phone, address (phone & address optional)
    return Math.round((completedFields.size / total) * 100)
  }

  /* ------------------------------- handlers ------------------------------ */
  const handleInputChange = (field: string, value: string) => {
    if (field === "phoneNumber") {
      const digits = value.replace(/\D/g, "")
      // detect country code if length > 10
      if (digits.length > 10) {
        for (const [code, prefix] of Object.entries(COUNTRY_CODES)) {
          if (digits.startsWith(code)) {
            setFormData((prev) => ({
              ...prev,
              phone: { countryCode: prefix, number: digits.slice(code.length) },
            }))
            return
          }
        }
      }
      setFormData((prev) => ({ ...prev, phone: { ...prev.phone, number: digits } }))
    } else if (field === "countryCode") {
      setFormData((prev) => ({ ...prev, phone: { ...prev.phone, countryCode: value } }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!verifiedUser) return
    if (!formData.username.trim()) {
      setError("Username is required")
      return
    }

    setLoading(true)
    try {
      const idToken = await auth.currentUser?.getIdToken()

      if (!idToken) {
        setError("Authentication token not found. Please log in again.")
        setLoading(false)
        return
      }

      const payloadFull = {
        firebaseUid: verifiedUser.firebaseUid,
        username: formData.username,
        email: verifiedUser.email,
        userType: "client",
        phone:
          formData.phone.number.trim() !== ""
            ? { countryCode: formData.phone.countryCode, number: formData.phone.number }
            : undefined,
        address: formData.address || undefined,
      }

      // If API_ROOT is not configured, assume local/development mode and bypass API requests
      if (!API_ROOT) {
        console.warn("[Onboarding] NEXT_PUBLIC_API_URL not set – skipping backend registration & proceeding locally.")
        localStorage.setItem("user", JSON.stringify({ ...payloadFull, _id: verifiedUser.firebaseUid }))
        localStorage.removeItem("verifiedUser")
        router.push("/")
        return
      }

      const res = await fetch(`${API_ROOT}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payloadFull),
      })

      // If the endpoint is missing (404) treat it as success in dev so the flow continues
      if (res.status === 404) {
        console.warn("[Onboarding] /auth/register endpoint not found – continuing without backend response.")
        localStorage.setItem("user", JSON.stringify({ ...payloadFull, _id: verifiedUser.firebaseUid }))
        localStorage.removeItem("verifiedUser")
        router.push("/")
        return
      }

      const data = await res.json()

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.data.user))
        localStorage.removeItem("verifiedUser")

        if (idToken) {
          await fetch(`${API_ROOT}/auth/verify-email`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
          })
        }
        router.push("/")
      } else {
        setError(prettifyError(data.details || data.message))
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  /* ---------------------------------- UI --------------------------------- */
  if (!verifiedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const progress = getProgress()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-gray-900 dark:bg-none">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            {/* progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{progress}% Complete</div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Complete Your Registration</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Welcome! Let's set up your Pixisphere account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User className="h-4 w-4" /> Username <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  value={formData.username}
                  disabled
                  className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                />
                {completedFields.has("username") && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone <Badge variant="outline" className="text-xs">Optional</Badge>
              </Label>
              <div className="flex gap-2">
                <div className="w-20">
                  <Input
                    value={formData.phone.countryCode}
                    onChange={(e) => handleInputChange("countryCode", e.target.value)}
                    className="text-center"
                    placeholder="+1"
                  />
                </div>
                <div className="flex-1 relative">
                  <Input
                    type="tel"
                    placeholder="Your phone number"
                    value={formData.phone.number}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    onFocus={() => setFocusedField("phone")}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      focusedField === "phone" && "ring-2 ring-indigo-500 border-indigo-500",
                      completedFields.has("phone") && "border-green-300 bg-green-50/50",
                    )}
                  />
                  {completedFields.has("phone") && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Tip: Paste your full number, we'll auto-detect the country code!</div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Address <Badge variant="outline" className="text-xs">Optional</Badge>
              </Label>
              <div className="relative">
                <Input
                  placeholder="Your address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  onFocus={() => setFocusedField("address")}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    focusedField === "address" && "ring-2 ring-indigo-500 border-indigo-500",
                    completedFields.has("address") && "border-green-300 bg-green-50/50",
                  )}
                />
                {completedFields.has("address") && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Completing Registration...
                </>
              ) : (
                "Complete Registration"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 