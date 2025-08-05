"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Calendar, MapPin, Users, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">1NRI</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            Premium Event Experience
          </Badge>

          {/* Logo and subtitle with reduced spacing */}
          <div className="flex flex-col items-center">
            <span className="text-5xl md:text-7xl font-bold tracking-tight">Kairos</span>
            {/* Reduce space between logo and subtitle by 25px (mt-1 is 4px, so use negative margin) */}
            <span className="block text-primary text-2xl md:text-4xl font-bold" style={{ marginTop: '-21px' }}>
              A 1NRI Experience
            </span>
          </div>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join us for an transformative spiritual journey. Experience divine timing, meaningful connections, and
            personal growth in a premium setting designed for the next generation.
          </p>

          <div className="grid md:grid-cols-3 gap-6 my-12">
            <Card className="border-2">
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary mx-auto" />
                <CardTitle>Divine Timing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Experience God&apos;s perfect timing in your life journey</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mx-auto" />
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Connect with like-minded individuals on the same path</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <MapPin className="h-8 w-8 text-primary mx-auto" />
                <CardTitle>Transformation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Discover your purpose and step into your calling</CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Centered CTA */}
          <div className="flex flex-col items-center space-y-2">
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-full"
              onClick={() => router.push("/register")}
            >
              Get Your Kairos Pass
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Secure your spot for this exclusive experience
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
