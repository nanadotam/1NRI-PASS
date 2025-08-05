"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useTicketing } from "@/contexts/ticketing-context"
import { QRCodeSVG } from "qrcode.react"
import { Download, Share2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

const kairosQuote = "You didn't just show up. You aligned."

const estherVerse = {
  reference: "Esther 4:14",
  text: "For if you remain silent at this time, relief and deliverance for the Jews will arise from another place, but you and your father's family will perish. And who knows but that you have come to your royal position for such a time as this?"
}

const colorOptions = [
  { id: "dark-green", name: "Dark Green", bg: "#182b11" },
  { id: "dark-purple", name: "Dark Purple", bg: "#2d1b69" },
  { id: "midnight-blue", name: "Midnight Blue", bg: "#0f1419" },
  { id: "deep-burgundy", name: "Deep Burgundy", bg: "#4a1810" },
]

const getPassColors = (color: string) => {
  const option = colorOptions.find(opt => opt.id === color)
  return {
    background: option?.bg || "#182b11",
    text: "#ffffff",
    accent: "#22c55e"
  }
}

export function TicketDisplay() {
  const router = useRouter()
  const { state } = useTicketing()
  const ticketRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!state.currentAttendee) {
      router.push("/register")
      return
    }
  }, [state.currentAttendee, router])

  const downloadTicket = async () => {
    if (!ticketRef.current) return

    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: "transparent",
        scale: 3.6, // Higher scale for 1080x1920
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
      })

      // Create final canvas with exact 1080x1920 dimensions
      const finalCanvas = document.createElement('canvas')
      finalCanvas.width = 1080
      finalCanvas.height = 1920
      const ctx = finalCanvas.getContext('2d')
      
      if (ctx) {
        // Fill background
        const colors = getPassColors(state.currentAttendee?.passColor || "dark-green")
        ctx.fillStyle = colors.background
        ctx.fillRect(0, 0, 1080, 1920)
        
        // Calculate scaling to fit the content properly
        const scale = Math.min(1080 / canvas.width, 1920 / canvas.height)
        const scaledWidth = canvas.width * scale
        const scaledHeight = canvas.height * scale
        const x = (1080 - scaledWidth) / 2
        const y = (1920 - scaledHeight) / 2
        
        ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight)
      }

      const link = document.createElement("a")
      link.download = `kairos-ticket-${state.currentAttendee?.fullName.replace(/\s+/g, "-").toLowerCase()}.png`
      link.href = finalCanvas.toDataURL("image/png", 1.0)
      link.click()
    } catch (error) {
      console.error("Error downloading ticket:", error)
    }
  }

  const shareTicket = async () => {
    if (navigator.share && state.currentAttendee) {
      try {
        await navigator.share({
          title: "My Kairos Ticket",
          text: `I'm attending Kairos: A 1NRI Experience! ${kairosQuote}`,
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
  const qrCodeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${currentAttendee.id}`
  const colors = getPassColors(currentAttendee.passColor || "dark-green")

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
            <h1 className="text-2xl font-bold mb-2">Your Kairos Ticket</h1>
            <p className="text-muted-foreground">Save this ticket for event entry</p>
          </div>

          {/* Ticket Design - Matching Improved Pass Design */}
          <div className="flex justify-center">
            <div 
              ref={ticketRef} 
              className="relative overflow-hidden shadow-2xl rounded-2xl"
              style={{ 
                width: '320px', 
                height: '568px', // More accurate 9:16 ratio for better scaling
                backgroundColor: colors.background 
              }}
            >
              {/* QR Code Area - Top Section */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-2xl shadow-lg">
                <QRCodeSVG 
                  value={qrCodeUrl} 
                  size={140} 
                  level="H" 
                  includeMargin={false}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>

              {/* Main Kairos Logo - Center */}
              <div className="absolute top-[180px] left-1/2 transform -translate-x-1/2 w-full px-6">
                <div className="flex justify-center">
                  <Image
                    src="/images/kairos_PNG_UHD.png"
                    alt="Kairos Logo"
                    width={280}
                    height={140}
                    className="object-contain"
                    style={{
                      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'
                    }}
                  />
                </div>
              </div>

              {/* Attendee Information - Left Side */}
              <div className="absolute bottom-[180px] left-6">
                <h3 className="font-jetbrains-mono font-bold text-white text-2xl mb-1 leading-tight">
                  {currentAttendee.fullName}
                </h3>
                <p className="font-jetbrains-mono italic text-white text-sm opacity-75">
                  Attendee Name
                </p>
              </div>

              {/* Pass ID - Right Side */}
              <div className="absolute bottom-[180px] right-6 text-right">
                <h4 className="font-jetbrains-mono font-bold text-white text-2xl mb-1 leading-tight">
                  {currentAttendee.id}
                </h4>
                <p className="font-jetbrains-mono italic text-white text-sm opacity-75">
                  PASS ID
                </p>
              </div>

              {/* Main Quote */}
              <div className="absolute bottom-[120px] left-6 right-6 text-center">
                <h2 className="poppins-extrabold italic text-white text-xl leading-tight">
                  "{kairosQuote}"
                </h2>
              </div>

              {/* Bible Verse */}
              <div className="absolute bottom-[50px] left-6 right-6 text-center">
                <p className="poppins-regular text-white text-sm mb-3 leading-relaxed opacity-95">
                  {estherVerse.text}
                </p>
                <p className="font-jetbrains-mono italic text-white text-sm opacity-75">
                  {estherVerse.reference}
                </p>
              </div>

              {/* Footer */}
              <div className="absolute bottom-3 left-6 right-6 flex justify-between items-center">
                <div className="text-left">
                  <span className="poppins-medium text-white text-xs opacity-70">Updated </span>
                  <span className="poppins-bold text-white text-xs opacity-90">August 16, 2025</span>
                </div>
                <div className="text-right">
                  <span className="poppins-medium text-white text-xs opacity-70">WWW.1NRI.STORE</span>
                </div>
              </div>

              {/* 1NRI Logo - Top Left */}
              <div className="absolute top-3 left-3">
                <Image
                  src="/images/1NRI Logo - Fixed - Transparent (1).png"
                  alt="1NRI Logo"
                  width={28}
                  height={28}
                  className="object-contain opacity-60"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button onClick={downloadTicket} className="flex-1 bg-green-600 hover:bg-green-700">
              <Download className="mr-2 h-4 w-4" />
              Save Ticket (1080x1920)
            </Button>
            <Button onClick={shareTicket} variant="outline" className="flex-1 bg-transparent">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
