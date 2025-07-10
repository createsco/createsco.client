"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback, AvatarInitials } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface StoredUser {
  username: string
  profilePic?: string
}

const API_ROOT = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "")
  .replace(/\/users$/, "")
  .replace(/\/$/, "")

export default function UserAuthButtons({ className }: { className?: string }) {
  const [user, setUser] = useState<StoredUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    // 1. Sync from localStorage for immediate render
    try {
      const json = localStorage.getItem("user")
      if (json) {
        setUser(JSON.parse(json))
      }
    } catch {
      // ignore parsing errors
    }

    // 2. Listen to Firebase auth changes to catch login/logout in same tab
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // re-read localStorage if available (set by login page)
        const stored = localStorage.getItem("user")
        if (stored) {
          try {
            setUser(JSON.parse(stored))
          } catch {
            setUser(null)
          }
        } else {
          // fallback minimal user object
          setUser({ username: firebaseUser.email?.split("@")[0] || "User", profilePic: firebaseUser.photoURL || undefined })
        }
      } else {
        setUser(null)
      }
    })

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "user") {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue))
          } catch {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      }
    }

    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener("storage", handleStorage)
      unsubscribeAuth()
    }
  }, [])

  const handleLogout = async () => {
    try {
      const idToken = await auth.currentUser?.getIdToken()
      if (idToken) {
        await fetch(`${API_ROOT}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        })
      }
      await signOut(auth)
    } catch (err) {
      console.error("Logout error", err)
    } finally {
      localStorage.removeItem("user")
      setUser(null)
      router.push("/")
    }
  }

  if (!user) {
    return (
      <>
        <Button asChild variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hidden sm:inline-flex">
          <Link href="/auth/login">Sign in</Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        >
          <Link href="/auth/register">Join now</Link>
        </Button>
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="w-8 h-8 cursor-pointer">
          {user.profilePic ? (
            <AvatarImage src={user.profilePic} alt={user.username} />
          ) : (
            <AvatarFallback>
              <AvatarInitials name={user.username} />
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => router.push("/dashboard")}>Dashboard</DropdownMenuItem>
        <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 