"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut, onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, LogOut, Mail, Phone, MapPin } from "lucide-react"

interface DashboardUser {
  _id: string
  username: string
  email: string
  userType: "client" | "partner"
  phone?: string
  address?: string
  emailVerified: boolean
}

const API_ROOT = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "")
  .replace(/\/users$/, "")
  .replace(/\/$/, "")

export default function DashboardPage() {
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        // User is signed in, get user data from localStorage
        const userData = localStorage.getItem("user")
        if (userData) {
          setUser(JSON.parse(userData))
        }
      } else {
        // User is signed out, redirect to login
        router.push("/auth/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    try {
      const idToken = await auth.currentUser?.getIdToken()

      if (idToken) {
        await fetch(`${API_ROOT}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        })
      }

      await signOut(auth)
      localStorage.removeItem("user")
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Pixisphere Dashboard</h1>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarFallback>
                  <AvatarInitials name={user.username} />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="flex items-center justify-center gap-2">
                {user.username}
                <Badge variant={user.userType === "partner" ? "default" : "secondary"}>{user.userType}</Badge>
              </CardTitle>
              <CardDescription>{user.userType === "partner" ? "Service Provider" : "Client"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                {user.email}
                {user.emailVerified && (
                  <Badge variant="outline" className="text-xs">
                    Verified
                  </Badge>
                )}
              </div>

              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {user.phone}
                </div>
              )}

              {user.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {user.address}
                </div>
              )}

              {!user.emailVerified && (
                <Button variant="outline" className="w-full bg-transparent" size="sm">
                  Verify Email
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Welcome Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Welcome to Pixisphere! 🎉</CardTitle>
              <CardDescription>
                {user.userType === "partner"
                  ? "Start showcasing your skills and connect with potential clients."
                  : "Find the perfect creative professionals for your projects."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.userType === "partner" ? (
                  <>
                    <Button className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Complete Profile
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      Browse Projects
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      Portfolio
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      Earnings
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="w-full">Post a Project</Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      Find Partners
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      My Projects
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      Favorites
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 