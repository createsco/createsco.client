"use client"

import { ReactNode, createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"

interface SessionContextValue {
  user: User | null
  loading: boolean
}

const SessionContext = createContext<SessionContextValue>({ user: null, loading: true })

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return <SessionContext.Provider value={{ user, loading }}>{children}</SessionContext.Provider>
}

export function useSession() {
  return useContext(SessionContext)
} 