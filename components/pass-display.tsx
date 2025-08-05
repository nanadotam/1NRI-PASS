"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useTicketing } from "@/contexts/ticketing-context"
import { QRCodeSVG } from "qrcode.react"
import { Download, Share2, Palette } from "lucide-react"
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

export function PassDisplay() {
  const router = useRouter()
  const { state, dispatch } = useTicketing()
  const passRef = useRef<HTMLDivElement>(null)
  const [selectedColor, setSelectedColor] = useState<string>("dark-green")
  const [showColorPicker, setShowColorPicker] = useState(false)

  useEffect(() => {
    if (!state.currentAttendee) {
      router.push("/register")
      return
    }
    setSelectedColor(state.currentAttendee.passColor || "dark-green")
  }, [state.currentAttendee, router])

  const downloadPass = async () => {
    if (!passRef.current) return

    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(passRef.current, {
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
        ctx.fillStyle = getPassColors(selectedColor).background
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
      link.download = `kairos-pass-${state.currentAttendee?.fullName.replace(/\s+/g, "-").toLowerCase()}.png`
      link.href = finalCanvas.toDataURL("image/png", 1.0)
      link.click()
    } catch (error) {
      console.error("Error downloading pass:", error)
    }
  }

  const updatePassColor = (color: string) => {
    setSelectedColor(color)
    if (state.currentAttendee) {
      dispatch({
        type: "SET_CURRENT_ATTENDEE",
        payload: { ...state.currentAttendee, passColor: color as "dark-green" | "dark-purple" }
      })
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
  const colors = getPassColors(selectedColor)

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
            <p className="text-muted-foreground">Customize and download your personalized pass</p>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Choose Pass Color</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowColorPicker(!showColorPicker)}
              >
                <Palette className="w-4 h-4 mr-2" />
                Customize
              </Button>
            </div>
            
            {showColorPicker && (
              <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-card">
                {colorOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => updatePassColor(option.id)}
                    className={`flex items-center space-x-2 p-2 rounded-lg border transition-all ${
                      selectedColor === option.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: option.bg }}
                    />
                    <span className="text-xs">{option.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pass Design - Optimized Dimensions */}
          <div className="flex justify-center">
            <div 
              ref={passRef} 
              className="relative overflow-hidden shadow-2xl rounded-2xl"
              style={{ 
                width: '320px', 
                height: '568px', // 9:16 ratio for better scaling
                backgroundColor: colors.background 
              }}
            >
              {/* QR Code Area - Top Section - Slightly Larger */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-2xl shadow-lg">
                <QRCodeSVG 
                  value={qrCodeUrl} 
                  size={170} 
                  level="H" 
                  includeMargin={false}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>

              {/* Main Kairos Logo - Center - Better Positioned */}
              <div className="absolute top-[150px] left-1/2 transform -translate-x-1/2 w-full px-4">
                <div className="flex justify-center items-center">
                  <Image
                    src="/images/kairos_PNG_UHD.png"
                    alt="Kairos Logo"
                    width={240}
                    height={120}
                    className="object-contain"
                    style={{
                      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'
                    }}
                  />
                </div>
              </div>

              {/* Attendee Information - Left Side - Smaller Font */}
              <div className="absolute bottom-[200px] left-4">
                <h3 className="font-jetbrains-mono font-bold text-white text-sm mb-1 leading-tight">
                  {currentAttendee.fullName}
                </h3>
                <p className="font-jetbrains-mono italic text-white text-[10px] opacity-75">
                  Attendee Name
                </p>
              </div>

              {/* Pass ID - Right Side - Smaller Font */}
              <div className="absolute bottom-[200px] right-4 text-right">
                <h4 className="font-jetbrains-mono font-bold text-white text-xs mb-1 leading-tight">
                  {currentAttendee.id}
                </h4>
                <p className="font-jetbrains-mono italic text-white text-[10px] opacity-75">
                  PASS ID
                </p>
              </div>

              {/* Main Quote - Smaller */}
              <div className="absolute bottom-[150px] left-4 right-4 text-center">
                <h2 className="poppins-extrabold italic text-white text-sm leading-tight">
                  "{kairosQuote}"
                </h2>
              </div>

              {/* Bible Verse - Much Smaller */}
              <div className="absolute bottom-[50px] left-4 right-4 text-center">
                <p className="poppins-regular text-white text-[9px] mb-1 leading-relaxed opacity-95">
                  {estherVerse.text}
                </p>
                <p className="font-jetbrains-mono italic text-white text-[8px] opacity-75">
                  {estherVerse.reference}
                </p>
              </div>

              {/* Footer - Smaller */}
              <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
                <div className="text-left">
                  <span className="poppins-medium text-white text-[8px] opacity-70">Updated </span>
                  <span className="poppins-bold text-white text-[8px] opacity-90">August 16, 2025</span>
                </div>
                <div className="text-right">
                  <span className="poppins-medium text-white text-[8px] opacity-70">WWW.1NRI.STORE</span>
                </div>
              </div>

              {/* 1NRI Logo - Top Left - Smaller */}
              <div className="absolute top-2 left-2">
                <Image
                  src="/images/1NRI Logo - Fixed - Transparent (1).png"
                  alt="1NRI Logo"
                  width={20}
                  height={20}
                  className="object-contain opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button onClick={downloadPass} className="flex-1 bg-green-600 hover:bg-green-700">
              <Download className="mr-2 h-4 w-4" />
              Download Pass (1080x1920)
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
