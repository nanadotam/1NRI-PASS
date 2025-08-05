"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowLeft, Camera, Upload, X, CheckCircle, AlertCircle } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

interface PersonalizePassProps {
  passId: string
}

export function PersonalizePass({ passId }: PersonalizePassProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset states
    setUploadError(null)
    setUploadSuccess(false)

    // Validate file size (50MB = 50 * 1024 * 1024 bytes)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError("File size must be less than 50MB")
      return
    }

    // Validate file type
    const validTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/heic',
      'image/heif',
      'image/heic-sequence',
      'image/heif-sequence'
    ]
    
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError("Please select a valid image file (JPEG, PNG, GIF, WebP, HEIC, HEIF)")
      return
    }

    setIsUploading(true)

    try {
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
              passId: passId,
              photoData: base64Result,
              fileName: file.name,
              fileType: file.type
            })
          })
          
          const uploadData = await uploadResponse.json()
          if (uploadData.success) {
            setUploadSuccess(true)
            setTimeout(() => {
              router.push(`/pass/${passId}`)
            }, 2000)
          } else {
            setUploadError(uploadData.error || "Failed to upload photo")
          }
        } catch (uploadError) {
          console.error("Error uploading to Supabase:", uploadError)
          setUploadError("Failed to upload photo. Please try again.")
        }
      }
      reader.readAsDataURL(file)
      
    } catch (error) {
      console.error("Error processing photo:", error)
      setUploadError("Error processing photo. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const removePhoto = () => {
    setUploadedPhoto(null)
    setUploadError(null)
    setUploadSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.push(`/verify/${passId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Verify
        </Button>
        <ThemeToggle />
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Camera className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold">Personalize Your Pass</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Upload your selfie to create a unique Kairos memory
            </p>
          </div>

          {/* Upload Card */}
          <Card className="border-2 border-dashed border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Upload className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold text-green-800">Upload Your Photo</h2>
              </div>
              <p className="text-sm text-green-700">
                Supported formats: JPEG, PNG, GIF, WebP, HEIC, HEIF (Max 50MB)
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div className="text-center space-y-4">
                {!uploadedPhoto ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-green-300 rounded-lg p-8 bg-white/50">
                      <Camera className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-green-700 font-medium mb-2">Click to upload your selfie</p>
                      <p className="text-sm text-green-600">or drag and drop</p>
                    </div>
                    
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      size="lg"
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white shadow-lg"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      ) : (
                        <Upload className="mr-2 h-6 w-6" />
                      )}
                      {isUploading ? 'Uploading...' : 'Choose Photo'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <Image
                        src={uploadedPhoto}
                        alt="Uploaded photo"
                        width={200}
                        height={200}
                        className="rounded-lg object-cover border-4 border-green-200"
                      />
                      <Button
                        onClick={removePhoto}
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-8 w-8 p-0 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {uploadSuccess && (
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Photo uploaded successfully!</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-sm text-red-700">{uploadError}</p>
                </div>
              )}

              {/* Success Message */}
              {uploadSuccess && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-sm text-green-700">
                    Redirecting to your personalized pass...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Upload your selfie (max 50MB)</li>
                <li>• Your photo will replace the QR code on your pass</li>
                <li>• Download your personalized pass</li>
                <li>• Share your unique Kairos memory</li>
              </ul>
            </CardContent>
          </Card>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      </main>
    </div>
  )
} 