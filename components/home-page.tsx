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
      <header className="container mx-auto px-3 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Image
            src={logoSrc}
            alt="1NRI Logo"
            width={44}
            height={44}
            className="object-contain transition-all"
            priority
          />
        </div>
        <ThemeToggle />
      </header>

      <main className="container mx-auto px-2 py-3 flex-1 w-full">
        <div className="max-w-4xl mx-auto px-2">
          {/* Hero Section */}
          <div className="text-center space-y-4 mb-4">
            <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full">
              Exclusive Event Experience
            </Badge>

            <div className="space-y-2">
              <div className="flex justify-center mb-1">
                <div
                  className="
                    w-[90vw] max-w-[440px]
                    md:w-[350px] md:max-w-[350px]
                  "
                  style={{}}
                >
                  <Image
                    src="/images/kairos_PNG_UHD.png"
                    alt="Kairos Logo"
                    width={440}
                    height={200}
                    className="object-contain w-full h-auto"
                    priority
                  />
                </div>
              </div>
              <p className="text-lg md:text-xl text-primary font-semibold">A 1NRI Experience</p>
            </div>

            {/* Main CTA - moved here, right under 'A 1NRI Experience' */}
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-3 border-2 border-primary/20 w-full max-w-md">
                <h2 className="text-xl font-bold mb-1">Ready to Join Kairos?</h2>
                <p className="text-sm text-muted-foreground mb-3 max-w-md mx-auto">
                  Get your personalized Kairos pass with a custom QR code, spiritual affirmations, and everything you need
                  for this exclusive experience. Perfect for sharing on social media!
                </p>

                <Button
                  size="lg"
                  className="text-base px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  onClick={() => router.push("/register")}
                >
                  Get My Kairos Pass
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Free registration • Instant pass generation • Social media ready
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed mt-2 px-1">
              Join us for a transformative spiritual journey where divine timing meets purpose. Experience meaningful
              connections, personal growth, and discover your calling in a premium setting designed for the next
              generation.
            </p>
          </div>

          {/* Event Details */}
          <div className="grid md:grid-cols-3 gap-2 mb-6 px-1">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-2 text-center">
                <Calendar className="h-8 w-8 text-primary mx-auto mb-1" />
                <h3 className="text-sm font-semibold mb-0.5">Divine Timing</h3>
                <p className="text-xs text-muted-foreground">
                  Experience God&apos;s perfect timing in your life journey and spiritual growth
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-2 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-1" />
                <h3 className="text-sm font-semibold mb-0.5">Community</h3>
                <p className="text-xs text-muted-foreground">Connect with like-minded individuals on the same spiritual path</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-2 text-center">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-1" />
                <h3 className="text-sm font-semibold mb-0.5">Transformation</h3>
                <p className="text-xs text-muted-foreground">Discover your purpose and step boldly into your divine calling</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="w-full border-t py-3 bg-background/80">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-2 px-2">
          <div className="flex items-center space-x-2">
            <Image
              src={logoSrc}
              alt="1NRI Logo"
              width={24}
              height={24}
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
