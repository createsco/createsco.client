"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check } from "lucide-react"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // Here you would typically send the email to your API
      console.log("Subscribing email:", email)
      setSubmitted(true)
      setEmail("")
    }
  }

  return (
    <div className="text-center">
      <h2 className="text-3xl font-normal text-gray-900 dark:text-white mb-4">Stay updated</h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto">
        Subscribe to our newsletter for photography tips, special offers, and updates on new photographers joining our
        platform.
      </p>

      {submitted ? (
        <div className="flex items-center justify-center text-green-600 dark:text-green-400">
          <Check className="h-5 w-5 mr-2" />
          <span>Thank you for subscribing!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-full px-6 dark:bg-gray-800 dark:border-gray-700"
          />
          <Button
            type="submit"
            className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 rounded-full px-6"
          >
            Subscribe
          </Button>
        </form>
      )}
    </div>
  )
}
