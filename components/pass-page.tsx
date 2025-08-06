"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useTicketing } from "@/contexts/ticketing-context"
import { QRCodeSVG } from "qrcode.react"
import { Download, Share2, Palette, Camera, Search, ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

const kairosQuote = "You didn't just show up. You aligned."

const estherVerse = {
  reference: "Esther 4:14",
  text: "For if you remain silent at this time, relief and deliverance for the Jews will arise from another place, but you and your father's family will perish. And who knows but that you have come to your royal position for such a time as this?"
}

const colorOptions = [
  { id: "dark-green", name: "Dark Green", bg: "#182b11" },
  { id: "dark-purple", name: "Dark Purple", bg: "#2B1128" },
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

interface AttendeeData {
  id: string;
  passId?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  heard_about: string;
  verse_reference: string;
  verse_text: string;
  message_text: string;
  theme: string;
  passColor?: string;
  timestamp: string;
}

export function PassPage() {
  const router = useRouter()
  const { state } = useTicketing()
  const passRef = useRef<HTMLDivElement>(null)
  const [selectedColor, setSelectedColor] = useState<string>("dark-green")
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [attendeeData, setAttendeeData] = useState<AttendeeData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [searchError, setSearchError] = useState("")

  useEffect(() => {
    // If we have current attendee from registration, use that
    if (state.currentAttendee) {
      setAttendeeData({
        id: state.currentAttendee.id,
        first_name: state.currentAttendee.fullName.split(' ')[0] || '',
        last_name: state.currentAttendee.fullName.split(' ').slice(1).join(' ') || '',
        email: state.currentAttendee.email,
        phone_number: state.currentAttendee.phone,
        heard_about: state.currentAttendee.hearAbout,
        verse_reference: estherVerse.reference,
        verse_text: estherVerse.text,
        message_text: kairosQuote,
        theme: "default",
        passColor: state.currentAttendee.passColor || "dark-green",
        timestamp: state.currentAttendee.timestamp
      })
      setSelectedColor(state.currentAttendee.passColor || "dark-green")
    }
  }, [state.currentAttendee])

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
        setAttendeeData(data.data)
        setSelectedColor(data.data.passColor || "dark-green")
      } else {
        setSearchError("No pass found with that email or phone number")
      }
    } catch {
      setSearchError("Error searching for your pass. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadPass = async () => {
    if (!passRef.current || !attendeeData) return

    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(passRef.current, {
        backgroundColor: "transparent",
        scale: 3.6,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
      })

      const finalCanvas = document.createElement('canvas')
      finalCanvas.width = 1080
      finalCanvas.height = 1920
      const ctx = finalCanvas.getContext('2d')
      
      if (ctx) {
        ctx.fillStyle = getPassColors(selectedColor).background
        ctx.fillRect(0, 0, 1080, 1920)
        
        const scale = Math.min(1080 / canvas.width, 1920 / canvas.height)
        const scaledWidth = canvas.width * scale
        const scaledHeight = canvas.height * scale
        const x = (1080 - scaledWidth) / 2
        const y = (1920 - scaledHeight) / 2
        
        ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight)
      }

      const link = document.createElement("a")
      link.download = `kairos-pass-${attendeeData.first_name?.replace(/\s+/g, "-").toLowerCase()}.png`
      link.href = finalCanvas.toDataURL("image/png", 1.0)
      link.click()
    } catch (error) {
      console.error("Error downloading pass:", error)
    }
  }

  const updatePassColor = (color: string) => {
    setSelectedColor(color)
    if (attendeeData) {
      setAttendeeData({ ...attendeeData, passColor: color })
    }
  }

  const sharePass = async () => {
    if (navigator.share && attendeeData) {
      try {
        await navigator.share({
          title: "My Kairos Pass",
          text: `I'm attending Kairos: A 1NRI Experience! ${kairosQuote} #MyKairosPass`,
          url: `${window.location.origin}/pass/${attendeeData.passId || attendeeData.id}`,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    }
  }

  const goToPersonalize = () => {
    if (attendeeData) {
      router.push(`/pass/${attendeeData.passId || attendeeData.id}/personalize`)
    }
  }

  // Show search form if no current attendee
  if (!attendeeData && !state.currentAttendee) {
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

  // Show pass if we have attendee data
  if (attendeeData) {
    const qrCodeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/pass/${attendeeData.passId || attendeeData.id}`
    const colors = getPassColors(selectedColor)

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col">
        {/* Top bar with back and theme toggle */}
        <header className="w-full sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border">
          <div className="max-w-md mx-auto flex items-center justify-between px-2 py-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 w-full max-w-md mx-auto px-2 py-2 pb-24">
          <div className="flex flex-col items-center">
            <div className="text-center mb-2">
              <h1 className="text-xl font-bold mb-1">Your Kairos Pass</h1>
              <p className="text-muted-foreground text-sm">Download, share, and personalize your pass</p>
            </div>

            {/* Color Selection */}
            <div className="w-full mb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium">Choose Pass Color</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="px-2 py-1"
                >
                  <Palette className="w-4 h-4 mr-1" />
                  <span className="text-xs">Customize</span>
                </Button>
              </div>
              
              {showColorPicker && (
                <div className="grid grid-cols-2 gap-2 p-2 border rounded-lg bg-card mt-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => updatePassColor(option.id)}
                      className={`flex items-center space-x-2 p-2 rounded-lg border transition-all w-full ${
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

            {/* Pass Design */}
            <div className="flex justify-center w-full mb-2">
              <div 
                ref={passRef} 
                className="relative overflow-hidden shadow-2xl rounded-2xl"
                style={{ 
                  width: '320px', 
                  height: '568px',
                  backgroundColor: colors.background 
                }}
              >
                {/* QR Code Area */}
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

                {/* Main Kairos Logo */}
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

                {/* Attendee Information */}
                <div className="absolute bottom-[200px] left-4">
                  <h3 className="font-jetbrains-mono font-bold text-white text-sm mb-1 leading-tight">
                    {attendeeData.first_name} {attendeeData.last_name}
                  </h3>
                  <p className="font-jetbrains-mono italic text-white text-[10px] opacity-75">
                    Attendee Name
                  </p>
                </div>

                {/* Pass ID */}
                <div className="absolute bottom-[200px] right-4 text-right">
                  <h4 className="font-jetbrains-mono font-bold text-white text-xs mb-1 leading-tight">
                    {attendeeData.passId || attendeeData.id}
                  </h4>
                  <p className="font-jetbrains-mono italic text-white text-[10px] opacity-75">
                    PASS ID
                  </p>
                </div>

                {/* Main Quote */}
                <div className="absolute bottom-[150px] left-4 right-4 text-center">
                  <h2 className="poppins-extrabold italic text-white text-sm leading-tight">
                    &ldquo;{kairosQuote}&rdquo;
                  </h2>
                </div>

                {/* Bible Verse */}
                <div className="absolute bottom-[50px] left-4 right-4 text-center">
                  <p className="poppins-regular text-white text-[9px] mb-1 leading-relaxed opacity-95">
                    {attendeeData.verse_text}
                  </p>
                  <p className="font-jetbrains-mono italic text-white text-[8px] opacity-75">
                    {attendeeData.verse_reference}
                  </p>
                </div>

                {/* Footer */}
                <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
                  <div className="text-left">
                    <span className="poppins-medium text-white text-[8px] opacity-70">Updated </span>
                    <span className="poppins-bold text-white text-[8px] opacity-90">August 16, 2025</span>
                  </div>
                  <div className="text-right">
                    <span className="poppins-medium text-white text-[8px] opacity-70">WWW.1NRI.STORE</span>
                  </div>
                </div>

                {/* 1NRI Logo */}
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

            {/* Social Media Prompt */}
            <div className="text-center p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl mb-2 w-full">
              <h3 className="font-semibold text-green-800 mb-1 text-sm">Share Your Kairos Moment</h3>
              <p className="text-xs text-green-700 mb-2">
                Click the camera button below to upload your selfie and share your Kairos pass on social media with the hashtag
              </p>
              <div className="bg-white px-3 py-1 rounded-lg border border-green-300 inline-block">
                <span className="font-mono text-green-600 font-bold text-xs">#MyKairosPass</span>
              </div>
            </div>

            <div className="text-center w-full">
              <p className="text-xs text-muted-foreground">
                Your pass is ready for social media! The QR code will verify your attendance.
              </p>
            </div>
          </div>
        </main>

        {/* Sticky Bottom Bar with Actions */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 border-t border-border shadow-lg">
          <div className="max-w-md mx-auto flex justify-between items-center px-2 py-2">
            <div className="flex flex-col items-center flex-1">
              <Button
                onClick={goToPersonalize}
                size="icon"
                className="rounded-full bg-gradient-to-r from-green-600 to-purple-600 text-white shadow"
                aria-label="Personalize"
              >
                <Camera className="h-6 w-6" />
              </Button>
              <span className="text-[11px] mt-1 text-center leading-tight">Personalize</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <Button
                onClick={downloadPass}
                size="icon"
                className="rounded-full bg-green-600 text-white shadow"
                aria-label="Download"
              >
                <Download className="h-6 w-6" />
              </Button>
              <span className="text-[11px] mt-1 text-center leading-tight">Download</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <Button
                onClick={sharePass}
                size="icon"
                variant="outline"
                className="rounded-full"
                aria-label="Share"
              >
                <Share2 className="h-6 w-6" />
              </Button>
              <span className="text-[11px] mt-1 text-center leading-tight">Share</span>
            </div>
          </div>
        </nav>
      </div>
    )
  }

  return null
} 