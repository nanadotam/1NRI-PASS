"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { Download, Share2, ArrowLeft, Sparkles, Palette, Camera, FolderOpen } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"
import imageCompression from "browser-image-compression"
import { useTheme } from "next-themes"
import heic2any from "heic2any"

const colorOptions = [
  { id: "dark-green", name: "Dark Green", bg: "#182b11" },
  { id: "dark-purple", name: "Dark Purple", bg: "#331A33" },
  { id: "midnight-blue", name: "Midnight Blue", bg: "#0f1419" },
  { id: "deep-burgundy", name: "Deep Burgundy", bg: "#4a1810" },
]

// Choose logo based on theme (moved inside component to use hook safely)

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
    passId?: string;
    first_name: string;
    last_name: string;
    firstName?: string;
    lastName?: string;
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
  const [selectedColor, setSelectedColor] = useState<string>("dark-purple")
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<string>("")
  const [storedPhotoUrl, setStoredPhotoUrl] = useState<string | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  // Removed exportFormat state

  // Use theme hook inside the component
  const { resolvedTheme } = useTheme()

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Function to fetch stored photo from Supabase
  const fetchStoredPhoto = async (passId: string) => {
    try {
      // List files in the pass-selfies folder to find photos for this pass
      const response = await fetch(`/api/storage/list-photos?passId=${passId}`)
      const data = await response.json()
      
      if (data.success && data.photos.length > 0) {
        // Get the most recent photo (last in the array)
        const latestPhoto = data.photos[data.photos.length - 1]
        setStoredPhotoUrl(latestPhoto.url)
      }
    } catch (error) {
      console.error("Error fetching stored photo:", error)
    }
  }

  useEffect(() => {
    const fetchAttendeeData = async () => {
      try {
        console.log('🔍 Fetching attendee data for passId:', passId)
        const response = await fetch(`/api/verify/${passId}`)
        const data = await response.json()
        
        console.log('📋 API response:', data)
        
        if (data.success && data.data) {
          console.log('✅ Setting attendee data:', data.data)
          setAttendeeData(data.data)
          setSelectedColor(data.data.passColor || data.data.theme || "dark-green")
          
          // Fetch any stored photos for this pass
          await fetchStoredPhoto(passId)
        } else {
          console.error('❌ API returned error:', data.message || 'Unknown error')
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
    setUploadProgress("Processing photo...")
    try {
      let processedFile = file

      // Handle HEIC format conversion
      if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        setUploadProgress("Converting HEIC format...")
        try {
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
          })
          // Handle both single blob and array of blobs
          const blobToUse = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
          processedFile = new File([blobToUse], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
            type: 'image/jpeg'
          })
        } catch (heicError) {
          console.error("Error converting HEIC:", heicError)
          // Continue with original file if conversion fails
        }
      }

      // Compress the image
      setUploadProgress("Compressing image...")
      const compressedFile = await imageCompression(processedFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true
      })

      // Convert to base64 for immediate display
      setUploadProgress("Preparing for upload...")
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Result = e.target?.result as string
        setUploadedPhoto(base64Result)

        // Upload to Supabase storage
        setUploadProgress("Uploading to your pass...")
        try {
          const uploadResponse = await fetch('/api/upload-photo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              passId: attendeeData?.id,
              photoData: base64Result,
              fileName: processedFile.name,
              fileType: processedFile.type
            })
          })
          
          const uploadData = await uploadResponse.json()
          if (uploadData.success) {
            // Update the stored photo URL with the new upload
            setStoredPhotoUrl(uploadData.data.url)
            setUploadProgress("Photo uploaded successfully!")
          } else {
            console.error("Failed to upload photo:", uploadData.error)
            setUploadProgress("Upload failed. Please try again.")
          }
        } catch (uploadError) {
          console.error("Error uploading to Supabase:", uploadError)
          setUploadProgress("Upload failed. Please try again.")
        }
      }
      reader.readAsDataURL(compressedFile)
      
    } catch (error) {
      console.error("Error uploading photo:", error)
      setUploadProgress("Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
      // Clear progress message after a short delay
      setTimeout(() => setUploadProgress(""), 2000)
    }
  }

  // Determine which photo to display (uploaded takes precedence over stored)
  const displayPhoto = uploadedPhoto || storedPhotoUrl

  const downloadPass = async () => {
    if (!attendeeData) return

    setIsDownloading(true)
    setDownloadProgress("Preparing your pass...")
    
    try {
      console.log('🚀 Starting pass export...')
      
      setDownloadProgress("Generating pass design...")

      // Use the correct base dimensions (320x568) and let the API handle scaling
      const response = await fetch('/api/export-pass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: 'kairos-pass',
          attendeeData,
          selectedColor,
          displayPhoto,
          size: { width: 1080 * 3, height: 1920 * 3 }, // 3x scale
          format: 'jpg'
        }),
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`)
      }

      setDownloadProgress("Preparing download...")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `kairos-pass-${attendeeData.first_name?.replace(/\s+/g, "-").toLowerCase()}.jpg`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      setDownloadProgress("Download complete!")
      console.log('✅ Pass exported successfully')

    } catch (error) {
      console.error("❌ Error exporting pass:", error)
      setDownloadProgress("Download failed. Please try again.")
    } finally {
      setIsDownloading(false)
      // Clear progress message after a short delay
      setTimeout(() => setDownloadProgress(""), 2000)
    }
  }

  const sharePass = async () => {
    if (navigator.share && attendeeData) {
      try {
        await navigator.share({
          title: "My Kairos Pass",
          text: `I'm attending Kairos: A 1NRI Experience! ${attendeeData.message_text} #MyKairosPass`,
          url: `${typeof window !== "undefined" ? window.location.origin : ""}/pass/${attendeeData.passId || attendeeData.id}`,
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
            <h1 className="text-2xl font-bold animate-pulse">Decrypting Your Kairos Pass...</h1>
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

  const qrCodeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/pass/${attendeeData.passId || attendeeData.id}`
  const colors = getPassColors(selectedColor)
  const firstName = attendeeData.firstName || attendeeData.first_name || 'Attendee'

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
        <div className="max-w-md mx-auto space-y-6 relative">
          {/* Download Loading Overlay */}
          {isDownloading && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm rounded-lg flex items-center justify-center z-20">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-green-600">{downloadProgress}</p>
                  <p className="text-sm text-muted-foreground">Creating your personalized pass...</p>
                </div>
              </div>
            </div>
          )}
          {/* Welcome Message */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Personalize Your Pass</h1>
            <p className="text-muted-foreground">
              {isMobile 
                ? "Choose from your photos or take a new selfie to create a unique Kairos memory"
                : "Upload your selfie to create a unique Kairos memory"
              }
            </p>
            <p className="text-sm font-medium text-green-600">Make it yours, {firstName} ✨</p>
          </div>

          {/* Color Picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Pass Color</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="px-3 py-1"
              >
                <Palette className="w-4 h-4 mr-1" />
                <span className="text-xs">Change</span>
              </Button>
            </div>
            
            {showColorPicker && (
              <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-card">
                {colorOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedColor(option.id)}
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
                {displayPhoto ? (
                  <div className="relative w-[170px] h-[170px] rounded-xl overflow-hidden">
                    <Image
                      src={displayPhoto}
                      alt="Uploaded photo"
                      width={170}
                      height={170}
                      className="object-cover w-full h-full"
                      crossOrigin="anonymous"
                    />
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
              <div className="absolute top-[190px] left-1/2 transform -translate-x-1/2 w-full px-4">
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
                    crossOrigin="anonymous"
                  />
                </div>
              </div>

              {/* Attendee Information - Left Side */}
              <div className="absolute bottom-[200px] left-4">
                <h3 className="font-jetbrains-mono font-bold text-white text-sm mb-1 leading-tight">
                  {attendeeData.firstName || attendeeData.first_name} {attendeeData.lastName || attendeeData.last_name}
                </h3>
                <p className="font-jetbrains-mono italic text-white text-[10px] opacity-75">
                  Attendee Name
                </p>
              </div>

              {/* Pass ID - Right Side */}
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
                  &ldquo;{attendeeData.message_text}&rdquo;
                </h2>
              </div>

                              {/* Bible Verse from Database */}
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
                  src={resolvedTheme === "light" ? "/images/1NRI Logo - Black.png" : "/images/1NRI Logo - Fixed - Transparent (1).png"}
                  alt="1NRI Logo"
                  width={20}
                  height={20}
                  className="object-contain opacity-60"
                  crossOrigin="anonymous"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Photo Upload Section */}
            <div className="relative space-y-3">
              {/* Heading/Prompt for photo upload */}
              <div className="text-center mb-2">
                <h3
                  className={`
                    text-base font-bold poppins-extrabold
                    ${resolvedTheme === "light" ? "text-black" : "text-white"}
                  `}
                >
                  CUSTOMIZE YOUR PASS BY UPLOADING YOUR SELFIE.
                </h3>
                <p className="text-xs text-muted-foreground italic">
                  (Pssst... make it a cute one!)
                </p>
              </div>
                {/* Loading overlay when uploading */}
                {isUploading && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                    <div className="text-center space-y-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{uploadProgress}</p>
                        <p className="text-xs text-muted-foreground">Please wait while we process your photo</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Mobile-friendly upload options */}
                <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture')
                      fileInputRef.current.click()
                    }
                  }}
                  variant="outline" 
                  className="h-12 flex flex-col items-center justify-center space-y-1"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center space-y-1">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      <span className="text-xs text-primary">Processing...</span>
                    </div>
                  ) : (
                    <>
                      <FolderOpen className="h-5 w-5" />
                      <span className="text-xs">Choose from Files</span>
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.setAttribute('capture', 'user')
                      fileInputRef.current.click()
                    }
                  }}
                  variant="outline" 
                  className="h-12 flex flex-col items-center justify-center space-y-1"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center space-y-1">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      <span className="text-xs text-primary">Processing...</span>
                    </div>
                  ) : (
                    <>
                      <Camera className="h-5 w-5" />
                      <span className="text-xs">Take Photo</span>
                    </>
                  )}
                </Button>
              </div>
              
              {displayPhoto && (
                <Button 
                  onClick={() => {
                    setUploadedPhoto(null)
                    setStoredPhotoUrl(null)
                  }}
                  variant="outline" 
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 border-red-200 h-10"
                >
                  Remove Photo
                </Button>
              )}
              
              {/* Helpful note about supported formats */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Supports JPEG, PNG, HEIC, and other image formats
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Download and Share Buttons */}
            <div className="flex space-x-3">
              <Button 
                onClick={downloadPass} 
                className="flex-1 bg-green-600 hover:bg-green-700 h-12"
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="text-sm">Generating...</span>
                  </div>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download Personalized Pass
                  </>
                )}
              </Button>
              <Button 
                onClick={sharePass} 
                variant="outline" 
                className="flex-1 h-12"
                disabled={isDownloading}
              >
                <Share2 className="mr-2 h-5 w-5" />
                Share
              </Button>
            </div>

            {/* Kairos Hashtag */}
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
        </div>
      </main>
    </div>
  )
} 