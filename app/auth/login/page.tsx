"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

// Fallback to existing BASE_URL env var if the newer variable isn't set
const API_ROOT = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "")
  .replace(/\/users$/, "")
  .replace(/\/$/, "")

const friendlyAuthError = (code: string): string => {
  const map: Record<string, string> = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many failed attempts. Please wait and try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
  }
  return map[code] || "Something went wrong. Please try again."
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = onAuthStateChanged(auth, (user: import("firebase/auth").User | null) => {
      if (user) {
        router.push("/")
      }
      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before logging in. Check your inbox for the verification link.")
        setLoading(false)
        return
      }

      const idToken = await userCredential.user.getIdToken()

      // Call your backend login API
      const response = await fetch(`${API_ROOT}/auth/login`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      // Normalize error object for both { success: false, ... } and { error: { ... } } responses
      const errorObj = data.error || data;
      const errorsArr = errorObj.errors || data.errors;
      const invalidCreds =
        errorObj.message === "INVALID_LOGIN_CREDENTIALS" ||
        (errorsArr && Array.isArray(errorsArr) && errorsArr.some((e: any) => e.message === "INVALID_LOGIN_CREDENTIALS"));

      if (data.success) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(data.data.user))

        // Redirect to home page
        router.push("/")
      } else if (invalidCreds) {
        setError("Invalid email or password. Please try again.")
      } else {
        setError(errorObj.message || data.message || "Login failed")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      const msg = friendlyAuthError(error.code || error.message)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900 dark:bg-none">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900 dark:bg-none">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {"Don't have an account? "}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 