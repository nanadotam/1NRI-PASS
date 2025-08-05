"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTicketing } from "@/contexts/ticketing-context"
import { Camera, CheckCircle, XCircle, RotateCcw, Users } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useRouter } from "next/navigation"

export function QRScanner() {
  const router = useRouter()
  const { state, dispatch } = useTicketing()
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{
    success: boolean
    attendee?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      verified: boolean;
    }
    message: string
  } | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setIsScanning(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsScanning(false)
  }, [stream])

  const simulateQRScan = () => {
    // Simulate scanning a QR code
    if (state.currentAttendee) {
      if (state.currentAttendee.verified) {
        setScanResult({
          success: false,
          message: "This pass has already been used for entry",
        })
      } else {
        dispatch({ type: "VERIFY_ATTENDEE", payload: state.currentAttendee.id })
        // Split fullName into firstName and lastName
        const nameParts = state.currentAttendee.fullName.split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''
        
        setScanResult({
          success: true,
          attendee: {
            id: state.currentAttendee.id,
            firstName,
            lastName,
            email: state.currentAttendee.email,
            verified: true
          },
          message: "Valid entry confirmed",
        })
      }
    } else {
      setScanResult({
        success: false,
        message: "No valid passes found in system",
      })
    }

    stopCamera()
  }

  const resetScanner = () => {
    setScanResult(null)
    stopCamera()
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push("/admin")}>
            <Users className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Badge variant="secondary">Admin Scanner</Badge>
        </div>
        <ThemeToggle />
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">QR Code Scanner</h1>
            <p className="text-muted-foreground">Scan attendee passes for entry verification</p>
          </div>

          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>Entry Verification</span>
              </CardTitle>
              <CardDescription>Point camera at attendee&apos;s QR code</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {!isScanning && !scanResult && (
                <div className="text-center space-y-4">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <Camera className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <Button onClick={startCamera} className="w-full">
                    Start Camera
                  </Button>
                </div>
              )}

              {isScanning && (
                <div className="space-y-4">
                  <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border-2 border-primary rounded-lg">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white rounded-lg"></div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={simulateQRScan} className="flex-1">
                      Simulate Scan
                    </Button>
                    <Button onClick={stopCamera} variant="outline">
                      Stop
                    </Button>
                  </div>
                </div>
              )}

              {scanResult && (
                <div className="space-y-4">
                  <Alert className={scanResult.success ? "border-green-500" : "border-red-500"}>
                    <div className="flex items-center space-x-2">
                      {scanResult.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <AlertDescription className="font-medium">{scanResult.message}</AlertDescription>
                    </div>
                  </Alert>

                  {scanResult.success && scanResult.attendee && (
                    <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <p className="font-medium text-green-800 dark:text-green-200">
                            Welcome, {scanResult.attendee.firstName} {scanResult.attendee.lastName}!
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Entry verified at {new Date().toLocaleTimeString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button onClick={resetScanner} className="w-full bg-transparent" variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Scan Another Pass
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {state.currentAttendee?.verified ? "Current pass verified" : "Ready to scan"}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
