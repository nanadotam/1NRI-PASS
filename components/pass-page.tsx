"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useTicketing } from "@/contexts/ticketing-context"
import { Search, ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function PassPage() {
  const router = useRouter()
  const { state } = useTicketing()
  const [isLoading, setIsLoading] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [searchError, setSearchError] = useState("")

  useEffect(() => {
    // If we have current attendee from registration, redirect to their pass
    if (state.currentAttendee) {
      router.push(`/pass/${state.currentAttendee.id}`)
    }
  }, [state.currentAttendee, router])

  const isEmail = (input: string) => {
    return input.includes('@') && input.includes('.')
  }

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      setSearchError("Please enter your email or phone number")
      return
    }

    setIsLoading(true)
    setSearchError("")

    try {
      const searchType = isEmail(searchInput) ? 'email' : 'phone'
      const response = await fetch(`/api/attendees?${searchType}=${encodeURIComponent(searchInput.trim())}`)
      const data = await response.json()

      if (data.success && data.data) {
        // Redirect to the pass page with the found pass ID
        router.push(`/pass/${data.data.passId || data.data.id}`)
      } else {
        setSearchError("No pass found with that email or phone number")
      }
    } catch {
      setSearchError("Error searching for your pass. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <header className="container mx-auto px-2 py-3 flex justify-between items-center sticky top-0 z-30 bg-background/80 backdrop-blur">
        <Button variant="ghost" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <ThemeToggle />
      </header>

      <main className="container mx-auto px-2 py-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold mb-1">Find Your Kairos Pass</h1>
            <p className="text-muted-foreground text-sm">Enter your email or phone number to access your pass</p>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold">Look Up Your Pass</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="text-sm font-medium">Email or Phone Number</label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    type="text"
                    placeholder="Enter your email or phone"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="px-4"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {searchError && (
                  <p className="text-xs text-red-600 mt-1">{searchError}</p>
                )}
              </div>

              <div className="text-center mt-2">
                <p className="text-xs text-muted-foreground">
                  Don&apos;t have a pass yet?{" "}
                  <Button 
                    variant="link" 
                    onClick={() => router.push("/register")}
                    className="p-0 h-auto text-primary"
                  >
                    Register here
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 