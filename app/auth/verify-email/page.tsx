"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, reload } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")
  const [verified, setVerified] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = () => {
      const pendingUser = localStorage.getItem("pendingUser")
      if (!pendingUser) {
        router.push("/auth/register")
        return
      }

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setVerified(user.emailVerified)
        } else {
          router.push("/auth/register")
        }
        setLoading(false)
      })

      return () => unsubscribe()
    }

    checkUser()
  }, [router])

  const handleVerifyCheck = async () => {
    if (!auth.currentUser) return

    setVerifying(true)
    setError("")

    try {
      // Reload user to get latest verification status
      await reload(auth.currentUser)

      if (auth.currentUser.emailVerified) {
        setVerified(true)

        // Get pending user data
        const pendingUserData = localStorage.getItem("pendingUser")
        if (pendingUserData) {
          const { firebaseUid, email } = JSON.parse(pendingUserData)

          // Store verified user data for onboarding
          localStorage.setItem(
            "verifiedUser",
            JSON.stringify({
              firebaseUid,
              email,
              emailVerified: true,
            }),
          )

          // Clean up pending user data
          localStorage.removeItem("pendingUser")

          // Redirect to onboarding quickly (within 100ms)
          setTimeout(() => {
            router.push("/auth/onboarding")
          }, 100)
        }
      } else {
        setError("Email not verified yet. Please check your email and click the verification link.")
      }
    } catch (error: any) {
      setError("Failed to check verification status: " + error.message)
    } finally {
      // Only stop the verifying spinner if verification failed
      if (!auth.currentUser?.emailVerified) {
        setVerifying(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center">
            {verified ? (
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                <XCircle className="h-6 w-6 text-yellow-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold">{verified ? "Email Verified!" : "Verify Your Email"}</CardTitle>
          <CardDescription>
            {verified
              ? "Your email has been successfully verified. Redirecting to onboarding..."
              : "Click the button below after verifying your email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {verified ? (
            <div className="text-center flex flex-col items-center gap-2">
              <div className="text-sm text-green-600 mb-1">✓ Email verification successful!</div>
              <Loader2 className="h-5 w-5 animate-spin text-green-600" />
              <div className="text-xs text-gray-600">Redirecting…</div>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Please check your email and click the verification link, then click the button below.
              </div>

              <Button onClick={handleVerifyCheck} className="w-full" disabled={verifying}>
                {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Check Verification Status
              </Button>
            </>
          )}

          <div className="text-center text-sm">
            <button onClick={() => router.push("/auth/register")} className="text-blue-600 dark:text-blue-400 hover:underline">
              Back to Registration
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 