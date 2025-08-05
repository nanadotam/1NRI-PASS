"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useTicketing } from "@/contexts/ticketing-context"
import { QRCodeSVG } from "qrcode.react"
import { Calendar, MapPin, User, Download, Share2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const bibleVerses = [
  "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future. - Jeremiah 29:11",
  "Trust in the Lord with all your heart and lean not on your own understanding. - Proverbs 3:5",
  "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go. - Joshua 1:9",
  "And we know that in all things God works for the good of those who love him. - Romans 8:28",
  "I can do all this through him who gives me strength. - Philippians 4:13",
]

const genZAffirmations = [
  "You're about to level up spiritually",
  "God's timing hits different when you trust the process",
  "Your faith journey is about to get an upgrade",
  "Divine appointments are loading...",
  "You're chosen for such a time as this",
]

export function TicketDisplay() {
  const router = useRouter()
  const { state } = useTicketing()
  const [randomVerse, setRandomVerse] = useState("")
  const [randomAffirmation, setRandomAffirmation] = useState("")

  useEffect(() => {
    if (!state.currentAttendee) {
      router.push("/register")
      return
    }

    setRandomVerse(bibleVerses[Math.floor(Math.random() * bibleVerses.length)])
    setRandomAffirmation(genZAffirmations[Math.floor(Math.random() * genZAffirmations.length)])
  }, [state.currentAttendee, router])

  if (!state.currentAttendee) {
    return null
  }

  const { currentAttendee } = state
  const eventDate = new Date("2024-03-15T18:00:00")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.push("/")}>
          Back to Home
        </Button>
        <ThemeToggle />
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Your Kairos Pass</h1>
            <p className="text-muted-foreground">Save this pass for event entry</p>
          </div>

          <Card className="border-2 bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="text-center pb-4">
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">
                  PREMIUM ACCESS
                </Badge>
                <h2 className="text-xl font-bold">Kairos: A 1NRI Experience</h2>
                <p className="text-sm text-muted-foreground">{randomAffirmation}</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG
                    value={JSON.stringify({
                      id: currentAttendee.id,
                      name: currentAttendee.fullName,
                      event: "kairos-2024",
                    })}
                    size={200}
                    level="H"
                    includeMargin
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{currentAttendee.fullName}</p>
                    <p className="text-sm text-muted-foreground">Attendee</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {eventDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {eventDate.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">1NRI Event Center</p>
                    <p className="text-sm text-muted-foreground">Check email for address</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm italic text-center leading-relaxed">{randomVerse}</p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">Pass ID</p>
                <p className="font-mono text-sm">{currentAttendee.id}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1 bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Save Pass
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
