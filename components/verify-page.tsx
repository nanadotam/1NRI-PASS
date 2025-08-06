"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, MapPin, User, ArrowLeft, Camera } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface VerifyPageProps {
  passId: string
}

export function VerifyPage({ passId }: VerifyPageProps) {
  const router = useRouter()
  const [attendeeData, setAttendeeData] = useState<{
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
    timestamp: string;
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAttendeeData = async () => {
      try {
        const response = await fetch(`/api/verify/${passId}`)
        const data = await response.json()
        
        if (data.success) {
          setAttendeeData(data.data)
        } else {
          setAttendeeData(null)
        }
      } catch (error) {
        console.error("Error fetching attendee data:", error)
        setAttendeeData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAttendeeData()
  }, [passId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying pass...</p>
        </div>
      </div>
    )
  }

  if (!attendeeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <Card className="max-w-md mx-auto border-2 border-red-200">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-700 mb-2">Invalid Pass</h2>
            <p className="text-red-600">This Kairos pass could not be verified.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const eventDate = new Date("2024-03-15T18:00:00")

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
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Image
                src="/images/1NRI Logo - Fixed - Transparent (1).png"
                alt="1NRI Logo"
                width={50}
                height={50}
                className="object-contain"
              />
              <h1 className="text-3xl font-bold">Pass Verified</h1>
            </div>
            <p className="text-muted-foreground">This Kairos pass has been successfully verified</p>
          </div>

          <Card className="border-4 border-green-200 bg-gradient-to-br from-green-50 to-green-100 shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-green-600 to-green-700 text-white">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <CheckCircle className="h-6 w-6" />
                <Badge variant="secondary" className="bg-white text-green-700">
                  VERIFIED
                </Badge>
              </div>
              <div className="mb-2">
                <Image
                  src="/images/kairos_PNG_UHD.png"
                  alt="Kairos Logo"
                  width={180}
                  height={72}
                  className="object-contain mx-auto"
                />
              </div>
              <p className="text-green-100">A 1NRI Experience</p>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Attendee Info */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <User className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-bold text-lg text-gray-800">{attendeeData.first_name} {attendeeData.last_name}</p>
                    <p className="text-green-600 text-sm">Verified Attendee</p>
                  </div>
                </div>

                <div className="space-y-2 text-gray-700">
                  <p className="text-sm">
                    <strong>Email:</strong> {attendeeData.email}
                  </p>
                  <p className="text-sm">
                    <strong>Phone:</strong> {attendeeData.phone_number}
                  </p>
                  <p className="text-sm">
                    <strong>Heard about us:</strong> {attendeeData.heard_about}
                  </p>
                </div>

                {/* Bible Verse and Message */}
                <div className="border-t pt-4 space-y-3">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-800 mb-2">
                      <strong>Your Kairos Message:</strong>
                    </p>
                    <p className="text-sm italic text-gray-700 mb-3">
                      "{attendeeData.message_text}"
                    </p>
                    <p className="text-xs text-gray-600 mb-1">
                      <strong>Bible Verse:</strong>
                    </p>
                    <p className="text-xs text-gray-700 mb-1">
                      {attendeeData.verse_text}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      {attendeeData.verse_reference}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-center space-x-2 text-gray-700">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {eventDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    at{" "}
                    {eventDate.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-gray-700">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">1NRI Event Center</span>
                </div>
              </div>

              {/* Success Message */}
              <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">Welcome to Kairos!</p>
                <p className="text-green-700 text-sm">This pass is valid for entry</p>
              </div>

              {/* Pass ID */}
              <div className="text-center border-t pt-4">
                <p className="text-xs text-gray-500 mb-1">Pass ID</p>
                <p className="font-mono text-xs text-gray-600">{attendeeData.passId || attendeeData.id}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Registered: {new Date(attendeeData.timestamp).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Personalize Pass Button */}
          <div className="text-center space-y-4">
            <Button 
              onClick={() => router.push(`/pass/${passId}/personalize`)}
              size="lg"
              className="w-full h-20 text-2xl font-bold bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              <Camera className="mr-4 h-10 w-10" />
              Personalize Your Pass
            </Button>
            <p className="text-xl text-muted-foreground font-medium">
              Upload your selfie to create a unique memory
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              This verification page confirms the authenticity of this Kairos pass.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
