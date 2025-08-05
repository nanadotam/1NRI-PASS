"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useTheme } from "next-themes"

export function HomePage() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()

  // Choose logo based on theme
  const logoSrc =
    resolvedTheme === "light"
      ? "/images/1NRI Logo - Black.png"
      : "/images/1NRI Logo - Fixed - Transparent (1).png"

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Image
            src={logoSrc}
            alt="1NRI Logo"
            width={60}
            height={60}
            className="object-contain transition-all"
            priority
          />
        </div>
        <ThemeToggle />
      </header>

      <main className="container mx-auto px-4 py-8 flex-1 w-full">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center space-y-8 mb-8">
            <Badge variant="secondary" className="text-sm px-6 py-2 rounded-full">
              Exclusive Event Experience
            </Badge>

            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <Image
                  src="/images/kairos_PNG_UHD.png"
                  alt="Kairos Logo"
                  width={400}
                  height={200}
                  className="object-contain"
                  priority
                />
              </div>
              <p className="text-2xl md:text-3xl text-primary font-semibold">A 1NRI Experience</p>
            </div>

            {/* Main CTA - moved here, right under 'A 1NRI Experience' */}
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border-2 border-primary/20 w-full max-w-2xl">
                <h2 className="text-3xl font-bold mb-4">Ready to Join Kairos?</h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Get your personalized Kairos pass with a custom QR code, spiritual affirmations, and everything you need
                  for this exclusive experience. Perfect for sharing on social media!
                </p>

                <Button
                  size="lg"
                  className="text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  onClick={() => router.push("/register")}
                >
                  Get My Kairos Pass
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
                <p className="text-sm text-muted-foreground mt-6">
                  Free registration • Instant pass generation • Social media ready
                </p>
              </div>
            </div>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-8">
              Join us for a transformative spiritual journey where divine timing meets purpose. Experience meaningful
              connections, personal growth, and discover your calling in a premium setting designed for the next
              generation.
            </p>
          </div>

          {/* Event Details */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Divine Timing</h3>
                <p className="text-muted-foreground">
                  Experience God's perfect timing in your life journey and spiritual growth
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Community</h3>
                <p className="text-muted-foreground">Connect with like-minded individuals on the same spiritual path</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Transformation</h3>
                <p className="text-muted-foreground">Discover your purpose and step boldly into your divine calling</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="w-full border-t py-6 bg-background/80">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4">
          <div className="flex items-center space-x-2">
            <Image
              src={logoSrc}
              alt="1NRI Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            {/* <span className="font-semibold text-lg">1NRI</span> */}
          </div>
          <a
            href="https://www.1NRI.STORE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline font-medium hover:text-primary/80 transition"
          >
            Visit the main 1NRI site &rarr;
          </a>
        </div>
      </footer>
    </div>
  )
}
