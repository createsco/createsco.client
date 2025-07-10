"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, X } from "lucide-react"

interface User {
  userType: "client" | "partner"
  username: string
  email: string
  /** Indicates whether the user has already completed their profile. */
  profileCompleted?: boolean
}

// Detailed shape of the profile form state
interface ProfileData {
  bio: string
  skills: string[]
  experience: string
  portfolio: string
  hourlyRate: string
  availability: string
  specialization: string
  company: string
  industry: string
  projectBudget: string
}

export default function CompleteProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [profileData, setProfileData] = useState<ProfileData>({
    bio: "",
    skills: [],
    experience: "",
    portfolio: "",
    hourlyRate: "",
    availability: "",
    specialization: "",
    company: "",
    industry: "",
    projectBudget: "",
  })
  const [currentSkill, setCurrentSkill] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/auth/login")
    }
  }, [router])

  // Utility type for profile fields that accept simple string values (everything except skills)
  type ProfileStringField = Exclude<keyof ProfileData, "skills">

  const handleInputChange = (field: ProfileStringField, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (currentSkill.trim() && !profileData.skills.includes(currentSkill.trim())) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()],
      }))
      setCurrentSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Safety guard – should never happen because of the early loading state, but
    // helps TypeScript understand that `user` is not null below.
    if (!user) {
      setError("User not found")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Here you would typically call an API to update the user profile
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Store updated profile data
      const updatedUser = { ...user, profileCompleted: true }
      localStorage.setItem("user", JSON.stringify(updatedUser))

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "Failed to complete profile")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
            <CardDescription className="text-center">
              {user.userType === "partner"
                ? "Tell clients about your skills and experience"
                : "Help us understand your project needs"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder={
                    user.userType === "partner"
                      ? "Tell clients about yourself and your expertise..."
                      : "Describe your company and what you're looking for..."
                  }
                  value={profileData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  rows={4}
                />
              </div>

              {user.userType === "partner" && (
                <>
                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill"
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" onClick={addSkill} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profileData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select onValueChange={(value) => handleInputChange("experience", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                        <SelectItem value="expert">Expert (5+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio URL</Label>
                    <Input
                      id="portfolio"
                      type="url"
                      placeholder="https://your-portfolio.com"
                      value={profileData.portfolio}
                      onChange={(e) => handleInputChange("portfolio", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      placeholder="50"
                      value={profileData.hourlyRate}
                      onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 