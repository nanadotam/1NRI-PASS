"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { Download, Share2, Camera, ArrowLeft, Sparkles, Image as ImageIcon, Palette } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"
import imageCompression from "browser-image-compression"
import { useTheme } from "next-themes"

export const bibleVerses = [
  {
    reference: "Esther 4:14",
    version: "NIV",
    text: "And who knows but that you have come to your royal position for such a time as this?"
  },
  {
    reference: "Jeremiah 29:11",
    version: "NIV",
    text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future."
  },
  {
    reference: "Ecclesiastes 3:1",
    version: "NIV",
    text: "There is a time for everything, and a season for every activity under the heavens."
  },
  {
    reference: "Romans 8:28",
    version: "NLT",
    text: "And we know that God causes everything to work together for the good of those who love God and are called according to His purpose."
  },
  {
    reference: "Philippians 1:6",
    version: "NIV",
    text: "He who began a good work in you will carry it on to completion until the day of Christ Jesus."
  },
  {
    reference: "Isaiah 60:22",
    version: "NLT",
    text: "At the right time, I, the Lord, will make it happen."
  },
  {
    reference: "Proverbs 16:3",
    version: "NIV",
    text: "Commit to the Lord whatever you do, and he will establish your plans."
  },
  {
    reference: "Psalm 37:23",
    version: "NLT",
    text: "The Lord directs the steps of the godly. He delights in every detail of their lives."
  },
  {
    reference: "Isaiah 43:19",
    version: "NIV",
    text: "See, I am doing a new thing! Now it springs up; do you not perceive it?"
  },
  {
    reference: "2 Timothy 1:7",
    version: "NLT",
    text: "For God has not given us a spirit of fear and timidity, but of power, love, and self-discipline."
  },
  {
    reference: "Psalm 46:5",
    version: "NIV",
    text: "God is within her, she will not fall; God will help her at break of day."
  },
  {
    reference: "Romans 12:2",
    version: "NLT",
    text: "Let God transform you into a new person by changing the way you think."
  },
  {
    reference: "Galatians 6:9",
    version: "NIV",
    text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up."
  },
  {
    reference: "Isaiah 41:10",
    version: "NLT",
    text: "Don't be afraid, for I am with you. Don't be discouraged, for I am your God."
  },
  {
    reference: "Proverbs 3:5-6",
    version: "NIV",
    text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."
  },
  {
    reference: "Matthew 5:14",
    version: "NIV",
    text: "You are the light of the world. A town built on a hill cannot be hidden."
  },
  {
    reference: "Ephesians 2:10",
    version: "NLT",
    text: "For we are God's masterpiece. He has created us anew in Christ Jesus, so we can do the good things he planned for us long ago."
  },
  {
    reference: "1 Peter 2:9",
    version: "NIV",
    text: "But you are a chosen people, a royal priesthood, a holy nation, God's special possession."
  },
  {
    reference: "Isaiah 54:17",
    version: "NLT",
    text: "No weapon formed against you will succeed, and you will silence every voice raised to accuse you."
  },
  {
    reference: "Matthew 6:33",
    version: "NIV",
    text: "But seek first his kingdom and his righteousness, and all these things will be given to you as well."
  },
  {
    reference: "Philippians 4:13",
    version: "NLT",
    text: "For I can do everything through Christ, who gives me strength."
  },
  {
    reference: "Psalm 23:1",
    version: "NIV",
    text: "The Lord is my shepherd, I lack nothing."
  },
  {
    reference: "Deuteronomy 31:6",
    version: "NLT",
    text: "So be strong and courageous! Do not be afraid and do not panic before them. For the Lord your God will personally go ahead of you."
  },
  {
    reference: "Isaiah 30:21",
    version: "NIV",
    text: "Whether you turn to the right or to the left, your ears will hear a voice behind you, saying, 'This is the way; walk in it.'"
  },
  {
    reference: "Psalm 139:14",
    version: "NLT",
    text: "Thank you for making me so wonderfully complex! Your workmanship is marvelous—how well I know it."
  },
  {
    reference: "Romans 5:5",
    version: "NIV",
    text: "And hope does not put us to shame, because God's love has been poured out into our hearts through the Holy Spirit."
  },
  {
    reference: "Lamentations 3:22-23",
    version: "NLT",
    text: "The faithful love of the Lord never ends! His mercies never cease. Great is his faithfulness; his mercies begin afresh each morning."
  },
  {
    reference: "1 Corinthians 2:9",
    version: "NIV",
    text: "What no eye has seen, what no ear has heard, and what no human mind has conceived — the things God has prepared for those who love him."
  },
  {
    reference: "Psalm 34:5",
    version: "NIV",
    text: "Those who look to him are radiant; their faces are never covered with shame."
  },
  {
    reference: "John 16:33",
    version: "NLT",
    text: "I have told you all this so that you may have peace in me. Here on earth you will have many trials and sorrows. But take heart, because I have overcome the world."
  }
];

export const genZAffirmations = [
  "You didn't just show up. You aligned.",
  "God said now. And you moved.",
  "This moment isn't random. It's Kairos.",
  "You're not just on time. You're right on purpose.",
  "Heaven is clapping. You're here.",
  "You answered the call. This is divine timing.",
  "Anointed, appointed, and in the building.",
  "You are not a coincidence. You're alignment in motion.",
  "Kairos? That's your whole vibe right now.",
  "You unlocked something sacred.",
  "This is your timestamp. Mark it.",
  "God's favor fits you like couture.",
  "You're living proof of perfect timing.",
  "You pulled up spiritually and physically.",
  "This isn't just an event. This is your moment.",
  "You're walking in answered prayer.",
  "God whispered. You moved.",
  "Nothing about this was accidental.",
  "Grace got you here. Glory will carry you.",
  "The glow? It's spiritual.",
  "You were meant to be here. And it shows.",
  "Time obeyed. You showed up.",
  "You aligned in style.",
  "You're a living prophecy in motion.",
  "You're not late. You're chosen.",
  "Don't downplay this. You stepped into something holy.",
  "Look at you—walking in kairos like it's everyday.",
  "Holy Spirit said: 'pull up.' And you did.",
  "This isn't a pass. It's a reminder. You're called.",
  "You caught it. The moment. The vibe. The assignment."
];

const colorOptions = [
  { id: "dark-green", name: "Dark Green", bg: "#182b11" },
  { id: "dark-purple", name: "Dark Purple", bg: "#2B1128" },
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
  const [selectedColor, setSelectedColor] = useState<string>("dark-green")
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [storedPhotoUrl, setStoredPhotoUrl] = useState<string | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Use theme hook inside the component
  const { resolvedTheme } = useTheme()

  // Choose logo based on theme
  const logoSrc =
    resolvedTheme === "light"
      ? "/images/1NRI Logo - Black.png"
      : "/images/1NRI Logo - Fixed - Transparent (1).png"

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
          if (uploadData.success) {
            // Update the stored photo URL with the new upload
            setStoredPhotoUrl(uploadData.data.url)
          } else {
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

  // Determine which photo to display (uploaded takes precedence over stored)
  const displayPhoto = uploadedPhoto || storedPhotoUrl

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

      // If there's a photo, replace the QR code with the photo
      if (displayPhoto) {
        const qrCodeArea = passClone.querySelector('.absolute.top-8') as HTMLElement
        if (qrCodeArea) {
          qrCodeArea.innerHTML = `
            <div class="relative w-[170px] h-[170px] rounded-xl overflow-hidden bg-white p-3">
              <img src="${displayPhoto}" alt="Uploaded photo" style="width: 170px; height: 170px; object-fit: cover; border-radius: 12px;" />
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

  const qrCodeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/pass/${attendeeData.passId || attendeeData.id}`
  const colors = getPassColors(selectedColor)
  const firstName = attendeeData.firstName || attendeeData.first_name || 'Attendee'
  const lastName = attendeeData.lastName || attendeeData.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim() || 'Attendee'

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
                  src={logoSrc}
                  alt="1NRI Logo"
                  width={20}
                  height={20}
                  className="object-contain opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Photo Upload Section */}
            <div className="flex space-x-3">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline" 
                className="flex-1 h-12"
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                ) : (
                  <ImageIcon className="mr-2 h-5 w-5" />
                )}
                Change Photo
              </Button>
              
              {displayPhoto && (
                <Button 
                  onClick={() => {
                    setUploadedPhoto(null)
                    setStoredPhotoUrl(null)
                  }}
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

            {/* Download and Share Buttons */}
            <div className="flex space-x-3">
              <Button onClick={downloadPass} className="flex-1 bg-green-600 hover:bg-green-700 h-12">
                <Download className="mr-2 h-5 w-5" />
                Download Pass + Photo
              </Button>
              <Button onClick={sharePass} variant="outline" className="flex-1 h-12">
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