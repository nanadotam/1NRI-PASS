"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTicketing } from "@/contexts/ticketing-context"
import { QRCodeSVG } from "qrcode.react"
import { Download, Share2, Sparkles, Calendar, MapPin } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

const bibleVerses = [
  "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future. - Jeremiah 29:11",
  "Trust in the Lord with all your heart and lean not on your own understanding. - Proverbs 3:5",
  "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go. - Joshua 1:9",
  "And we know that in all things God works for the good of those who love him. - Romans 8:28",
  "I can do all this through him who gives me strength. - Philippians 4:13",
]

const genZMessages = [
  "You didn't just show up. You aligned. 🔥",
  "God knew. You came. It's giving divine timing. ✨",
  "Chosen. Anointed. On time. 💼⏳",
  "This isn't random. This is Kairos. 🕊",
  "You're not late. You're aligned. 💫",
  "Holy Spirit said, 'pull up.' You obeyed. 👣🔥",
  "Walking in purpose looks good on you. 💅🏾",
  "The vibe is spiritual. The moment is now. 🧿",
  "Kairos unlocked. You're the key. 🗝️",
  "Heaven was waiting for you. 🫶🏾"
]

export function PassDisplay() {
  const router = useRouter()
  const { state } = useTicketing()
  const [randomVerse, setRandomVerse] = useState("")
  const [randomAffirmation, setRandomAffirmation] = useState("")
  const passRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!state.currentAttendee) {
      router.push("/register")
      return
    }

    setRandomVerse(bibleVerses[Math.floor(Math.random() * bibleVerses.length)])
    setRandomAffirmation(genZMessages[Math.floor(Math.random() * genZMessages.length)])
  }, [state.currentAttendee, router])

  const downloadPass = async () => {
    if (!passRef.current) return

    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(passRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      })

      const link = document.createElement("a")
      link.download = `kairos-pass-${state.currentAttendee?.fullName.replace(/\s+/g, "-").toLowerCase()}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error("Error downloading pass:", error)
    }
  }

  const sharePass = async () => {
    if (navigator.share && state.currentAttendee) {
      try {
        await navigator.share({
          title: "My Kairos Pass",
          text: `I'm attending Kairos: A 1NRI Experience! ${randomAffirmation}`,
          url: `${window.location.origin}/verify/${state.currentAttendee.id}`,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    }
  }

  if (!state.currentAttendee) {
    return null
  }

  const { currentAttendee } = state
  const eventDate = new Date("2024-03-15T18:00:00")
  const qrCodeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${currentAttendee.id}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.push("/")}>
          Back to Home
        </Button>
        <ThemeToggle />
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Your Kairos Pass is Ready!</h1>
            <p className="text-muted-foreground">Download and share your personalized pass</p>
          </div>

          {/* Pass Design */}
          <div ref={passRef} className="bg-white">
            <Card className="border-4 border-primary bg-gradient-to-br from-green-50 to-green-100 shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 text-center">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <Image
                      src="/images/1NRI Logo - Fixed - Transparent (1).png"
                      alt="1NRI Logo"
                      width={40}
                      height={40}
                      className="object-contain bg-white rounded-full p-1"
                    />
                    <span className="text-lg font-bold">1NRI</span>
                  </div>
                  <div className="mb-2">
                    <Image
                      src="/images/kairos_PNG_UHD.png"
                      alt="Kairos Logo"
                      width={200}
                      height={80}
                      className="object-contain mx-auto"
                    />
                  </div>
                  <p className="text-green-100 text-sm mb-2">A 1NRI Experience</p>
                  <Badge variant="secondary" className="bg-white text-green-700">
                    PREMIUM ACCESS
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Attendee Info */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{currentAttendee.fullName}</h3>
                    <p className="text-green-600 font-medium">Attendee</p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-green-200">
                      <QRCodeSVG value={qrCodeUrl} size={160} level="H" includeMargin fgColor="#166534" />
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-3 text-center">
                    <div className="flex items-center justify-center space-x-2 text-gray-700">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {eventDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-gray-700">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">1NRI Event Center</span>
                    </div>
                  </div>

                  {/* Affirmation */}
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                    <p className="text-green-800 font-medium text-center italic">"{randomAffirmation}"</p>
                  </div>

                  {/* Bible Verse */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-gray-700 text-sm text-center italic leading-relaxed">{randomVerse}</p>
                  </div>

                  {/* Pass ID */}
                  <div className="text-center border-t pt-4">
                    <p className="text-xs text-gray-500 mb-1">Pass ID</p>
                    <p className="font-mono text-xs text-gray-600">{currentAttendee.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button onClick={downloadPass} className="flex-1 bg-green-600 hover:bg-green-700">
              <Download className="mr-2 h-4 w-4" />
              Download Pass
            </Button>
            <Button onClick={sharePass} variant="outline" className="flex-1 bg-transparent">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Your pass is ready for social media! The QR code will verify your attendance.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
