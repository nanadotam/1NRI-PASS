"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { Download, Share2, Camera, ArrowLeft, Sparkles, Image as ImageIcon } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"
import imageCompression from "browser-image-compression"

const kairosQuote = "You didn't just show up. You aligned."

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

interface PassViewerProps {
  passId: string
}

export function PassViewer({ passId }: PassViewerProps) {
  const router = useRouter()
  const passRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attendeeData, setAttendeeData] = useState<{
    id: string;
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
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showFlicker, setShowFlicker] = useState(true)
  const [selectedColor, setSelectedColor] = useState<string>("dark-green")
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const fetchAttendeeData = async () => {
      try {
        const response = await fetch(`/api/verify/${passId}`)
        const data = await response.json()
        
        if (data.success) {
          setAttendeeData(data.data)
          setSelectedColor(data.data.passColor || "dark-green")
        } else {
          setAttendeeData(null)
        }
      } catch (error) {
        console.error("Error fetching attendee data:", error)
        setAttendeeData(null)
      } finally {
        setIsLoading(false)
        // Show flicker animation for 3 seconds
        setTimeout(() => setShowFlicker(false), 3000)
      }
    }

    fetchAttendeeData()
  }, [passId])

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Compress the image
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true
      })

      // Convert to base64 for immediate display
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Result = e.target?.result as string
        setUploadedPhoto(base64Result)

        // Upload to Supabase storage
        try {
          const uploadResponse = await fetch('/api/upload-photo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              passId: attendeeData?.id,
              photoData: base64Result,
              fileName: file.name,
              fileType: file.type
            })
          })
          
          const uploadData = await uploadResponse.json()
          if (!uploadData.success) {
            console.error("Failed to upload photo:", uploadData.error)
          }
        } catch (uploadError) {
          console.error("Error uploading to Supabase:", uploadError)
        }
      }
      reader.readAsDataURL(compressedFile)
      
    } catch (error) {
      console.error("Error uploading photo:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const downloadPass = async () => {
    if (!passRef.current) return

    try {
      const html2canvas = (await import("html2canvas")).default
      
      // Create a temporary div to render the pass with photo
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '-9999px'
      tempDiv.style.width = '320px'
      tempDiv.style.height = '568px'
      tempDiv.style.backgroundColor = getPassColors(selectedColor).background
      tempDiv.style.borderRadius = '16px'
      tempDiv.style.overflow = 'hidden'
      tempDiv.style.position = 'relative'
      
      // Clone the pass content
      const passClone = passRef.current.cloneNode(true) as HTMLElement
      tempDiv.appendChild(passClone)
      document.body.appendChild(tempDiv)

      // If there's an uploaded photo, replace the QR code with the photo
      if (uploadedPhoto) {
        const qrCodeArea = passClone.querySelector('.absolute.top-8') as HTMLElement
        if (qrCodeArea) {
          qrCodeArea.innerHTML = `
            <div class="relative w-[170px] h-[170px] rounded-xl overflow-hidden bg-white p-3">
              <img src="${uploadedPhoto}" alt="Uploaded photo" style="width: 170px; height: 170px; object-fit: cover; border-radius: 12px;" />
              <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; border-radius: 12px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
              </div>
            </div>
          `
        }
      }

      const canvas = await html2canvas(tempDiv, {
        backgroundColor: "transparent",
        scale: 3.6,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
      })

      // Clean up
      document.body.removeChild(tempDiv)

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
      link.download = `kairos-pass-${attendeeData?.first_name?.replace(/\s+/g, "-").toLowerCase()}.png`
      link.href = finalCanvas.toDataURL("image/png", 1.0)
      link.click()
    } catch (error) {
      console.error("Error downloading pass:", error)
    }
  }

  const sharePass = async () => {
    if (navigator.share && attendeeData) {
      try {
        await navigator.share({
          title: "My Kairos Pass",
          text: `I'm attending Kairos: A 1NRI Experience! ${kairosQuote} #MyKairosPass`,
          url: `${typeof window !== "undefined" ? window.location.origin : ""}/pass/${attendeeData.id}`,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pass...</p>
        </div>
      </div>
    )
  }

  if (!attendeeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">Invalid Pass</h2>
          <p className="text-red-600">This Kairos pass could not be found.</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  // Digital Flicker Animation
  if (showFlicker) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white space-y-6">
          <div className="animate-pulse">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-green-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold animate-pulse">Decrypting Kairos Pass...</h1>
            <div className="flex space-x-1 justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const qrCodeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/pass/${attendeeData.id}`
  const colors = getPassColors(selectedColor)
  const firstName = attendeeData.first_name || 'Attendee'

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <ThemeToggle />
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Welcome Message */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Personalize Your Pass</h1>
            <p className="text-muted-foreground">Upload your selfie to create a unique Kairos memory</p>
            <p className="text-sm font-medium text-green-600">Make it yours, {firstName} ✨</p>
          </div>

          {/* Pass Design */}
          <div className="flex justify-center">
            <div 
              ref={passRef} 
              className="relative overflow-hidden shadow-2xl rounded-2xl"
              style={{ 
                width: '320px', 
                height: '568px',
                backgroundColor: colors.background 
              }}
            >
              {/* QR Code or Photo Area - Top Section */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-2xl shadow-lg">
                {uploadedPhoto ? (
                  <div className="relative w-[170px] h-[170px] rounded-xl overflow-hidden">
                    <Image
                      src={uploadedPhoto}
                      alt="Uploaded photo"
                      width={170}
                      height={170}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-white drop-shadow-lg" />
                    </div>
                  </div>
                ) : (
                  <QRCodeSVG 
                    value={qrCodeUrl} 
                    size={170} 
                    level="H" 
                    includeMargin={false}
                    fgColor="#000000"
                    bgColor="#ffffff"
                  />
                )}
              </div>

              {/* Main Kairos Logo - Center */}
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

              {/* Attendee Information - Left Side */}
              <div className="absolute bottom-[200px] left-4">
                <h3 className="font-jetbrains-mono font-bold text-white text-sm mb-1 leading-tight">
                  {attendeeData.first_name} {attendeeData.last_name}
                </h3>
                <p className="font-jetbrains-mono italic text-white text-[10px] opacity-75">
                  Attendee Name
                </p>
              </div>

              {/* Pass ID - Right Side */}
              <div className="absolute bottom-[200px] right-4 text-right">
                <h4 className="font-jetbrains-mono font-bold text-white text-xs mb-1 leading-tight">
                  {attendeeData.id}
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

              {/* 1NRI Logo - Top Left */}
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

          {/* Photo Upload Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Upload Your Selfie 📸</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {uploadedPhoto 
                  ? "Your photo will replace the QR code on your pass" 
                  : "Take a selfie to personalize your Kairos pass"
                }
              </p>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline" 
                className="flex-1 h-12 text-lg"
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                ) : (
                  <ImageIcon className="mr-2 h-5 w-5" />
                )}
                {uploadedPhoto ? 'Change Photo' : 'Upload Selfie'}
              </Button>
              
              {uploadedPhoto && (
                <Button 
                  onClick={() => setUploadedPhoto(null)}
                  variant="outline" 
                  className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200 h-12"
                >
                  Remove
                </Button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {uploadedPhoto && (
              <div className="text-center">
                <div className="relative inline-block">
                  <Image
                    src={uploadedPhoto}
                    alt="Uploaded photo"
                    width={200}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Photo will replace QR code on download
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button onClick={downloadPass} className="flex-1 bg-green-600 hover:bg-green-700 h-12 text-lg">
              <Download className="mr-2 h-5 w-5" />
              {uploadedPhoto ? 'Download Pass + Photo' : 'Download Pass'}
            </Button>
            <Button onClick={sharePass} variant="outline" className="flex-1 h-12 text-lg">
              <Share2 className="mr-2 h-5 w-5" />
              Share
            </Button>
          </div>

          {/* Social Media Prompt */}
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Share Your Kairos Moment</h3>
            <p className="text-sm text-green-700 mb-3">
              Post this on social media with the hashtag
            </p>
            <div className="bg-white px-4 py-2 rounded-lg border border-green-300 inline-block">
              <span className="font-mono text-green-600 font-bold">#MyKairosPass</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 