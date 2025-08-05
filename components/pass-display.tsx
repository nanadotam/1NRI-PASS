"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTicketing } from "@/contexts/ticketing-context"
import { QRCodeSVG } from "qrcode.react"
import { Download, Share2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const kairosQuote = "You didn't just show up. You aligned."

const estherVerse = {
  reference: "Esther 4:14",
  text: "For if you remain silent at this time, relief and deliverance for the Jews will arise from another place, but you and your father's family will perish. And who knows but that you have come to your royal position for such a time as this?"
}

const getPassColors = (color: string) => {
  switch (color) {
    case "dark-purple":
      return {
        background: "#2d1b69", // Dark purple background
        text: "#ffffff",
        accent: "#6366f1"
      }
    case "dark-green":
    default:
      return {
        background: "#182b11", // Dark green background from SVG
        text: "#ffffff",
        accent: "#22c55e"
      }
  }
}

export function PassDisplay() {
  const router = useRouter()
  const { state } = useTicketing()
  const passRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!state.currentAttendee) {
      router.push("/register")
      return
    }
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
          text: `I'm attending Kairos: A 1NRI Experience! ${kairosQuote}`,
          url: `${window.location.origin}/pass/${state.currentAttendee.id}`,
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
  const qrCodeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/pass/${currentAttendee.id}`
  const colors = getPassColors(currentAttendee.passColor || "dark-green")

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

          {/* Pass Design - Based on SVG */}
          <div ref={passRef} className="bg-white rounded-lg overflow-hidden shadow-2xl">
            <div 
              className="relative w-full h-[600px] p-6 text-white"
              style={{ backgroundColor: colors.background }}
            >
              {/* Main Quote */}
              <div className="text-center mb-8 mt-8">
                <h2 className="poppins-extrabold italic text-4xl leading-tight">
                  "{kairosQuote}"
                </h2>
              </div>

              {/* QR Code Section */}
              <div className="flex justify-center mb-8">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG 
                    value={qrCodeUrl} 
                    size={160} 
                    level="H" 
                    includeMargin 
                    fgColor="#000000"
                    bgColor="#ffffff"
                  />
                </div>
              </div>

              {/* Attendee Information */}
              <div className="mb-8">
                <div className="text-left">
                  <h3 className="font-jetbrains-mono font-bold text-3xl mb-1">
                    {currentAttendee.fullName}
                  </h3>
                  <p className="font-jetbrains-mono italic text-sm">
                    Attendee Name
                  </p>
                </div>
              </div>

              {/* Pass ID */}
              <div className="absolute top-6 right-6 text-right">
                <h4 className="font-jetbrains-mono font-bold text-3xl mb-1">
                  {currentAttendee.id}
                </h4>
                <p className="font-jetbrains-mono italic text-sm">
                  PASS ID
                </p>
              </div>

              {/* Bible Verse */}
              <div className="absolute bottom-24 left-6 right-6">
                <div className="text-center">
                  <p className="poppins-regular text-sm mb-4 leading-relaxed">
                    {estherVerse.text}
                  </p>
                  <p className="font-jetbrains-mono italic text-sm">
                    {estherVerse.reference}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                <div className="text-left">
                  <span className="poppins-medium text-sm">Updated </span>
                  <span className="poppins-bold text-sm">August 16, 2025</span>
                </div>
                <div className="text-right">
                  <span className="poppins-medium text-sm">WWW.1NRI.STORE</span>
                </div>
              </div>
            </div>
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
