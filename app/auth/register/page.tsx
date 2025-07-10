"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail } from "lucide-react"

// Map Firebase auth error codes to friendly messages
const friendlyAuthError = (code: string): string => {
  const map: Record<string, string> = {
    "auth/email-already-in-use": "This email address is already in use. Please try a different email.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters long.",
    "auth/network-request-failed": "Network error. Please check your connection and try again.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  }
  return map[code] || "Something went wrong. Please try again."
}

// API root resolves to whichever env var is provided
const API_ROOT = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "")
  .replace(/\/users$/, "")
  .replace(/\/$/, "")

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)

      // Send email verification
      await sendEmailVerification(userCredential.user)

      // Store user data temporarily in localStorage for the verification process
      localStorage.setItem(
        "pendingUser",
        JSON.stringify({
          firebaseUid: userCredential.user.uid,
          email: formData.email,
        }),
      )

      setEmailSent(true)
    } catch (error: any) {
      console.error("Registration error:", error)
      const msg = friendlyAuthError(error.code || error.message)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser)
        setError("")
        // Show success message briefly
        setError("Verification email sent!")
        setTimeout(() => setError(""), 3000)
      } catch (error: any) {
        setError("Failed to resend email: " + error.message)
      }
    }
  }

  const checkEmailVerification = () => {
    router.push("/auth/verify-email")
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900 dark:bg-none">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to <strong>{formData.email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant={error.includes("sent") ? "default" : "destructive"}>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-gray-600 text-center">
              Click the link in your email to verify your account, then return here to continue.
            </div>

            <Button onClick={checkEmailVerification} className="w-full">
              I've Verified My Email
            </Button>

            <div className="text-center">
              <button onClick={handleResendEmail} className="text-sm text-blue-600 hover:underline">
                Didn't receive the email? Resend
              </button>
            </div>

            <div className="text-center text-sm">
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900 dark:bg-none">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">Join Pixisphere and start your creative journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
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
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password (min 6 characters)"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 