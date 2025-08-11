"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useTicketing } from "@/contexts/ticketing-context"
import { QRCodeSVG } from "qrcode.react"
import { Download, Share2, Palette } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

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
    if (!state.currentAttendee) return

    try {
      // Use the new SVG-based export system for better quality
      const response = await fetch('/api/export-pass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: 'kairos-pass',
          attendeeData: {
            id: state.currentAttendee.id,
            firstName: state.currentAttendee.fullName.split(' ')[0],
            lastName: state.currentAttendee.fullName.split(' ').slice(1).join(' '),
            first_name: state.currentAttendee.fullName.split(' ')[0],
            last_name: state.currentAttendee.fullName.split(' ').slice(1).join(' '),
            message_text: genZAffirmations[0],
            verse_text: randomVerse.text,
            verse_reference: randomVerse.reference,
            passColor: selectedColor
          },
          selectedColor,
          displayPhoto: null, // No photo in pass display
          size: { width: 1080, height: 1920 },
          format: 'jpg',
          scale: 3
        }),
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.download = `kairos-pass-${state.currentAttendee?.fullName.replace(/\s+/g, "-").toLowerCase()}-3x.jpg`
      link.href = url
      link.click()
      
      window.URL.revokeObjectURL(url)
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
          text: `I'm attending Kairos: A 1NRI Experience! ${genZAffirmations[0]} #MyKairosPass`,
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

  // Get random verse and affirmation
  const randomVerse = bibleVerses[Math.floor(Math.random() * bibleVerses.length)]
  const randomAffirmation = genZAffirmations[Math.floor(Math.random() * genZAffirmations.length)]

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
                  &ldquo;{randomAffirmation}&rdquo;
                </h2>
              </div>

              {/* Bible Verse - Much Smaller */}
              <div className="absolute bottom-[50px] left-4 right-4 text-center">
                <p className="poppins-regular text-white text-[9px] mb-1 leading-relaxed opacity-95">
                  {randomVerse.text}
                </p>
                <p className="font-jetbrains-mono italic text-white text-[8px] opacity-75">
                  {randomVerse.reference}
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
              Download JPG Pass (3x Scale)
            </Button>
            <Button onClick={sharePass} variant="outline" className="flex-1 bg-transparent">
              <Share2 className="mr-2 h-4 w-4" />
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
