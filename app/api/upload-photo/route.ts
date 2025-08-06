import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { passId, photoData, fileName, fileType } = await request.json()
    
    if (!passId || !photoData) {
      return NextResponse.json(
        { success: false, error: "Missing passId or photoData" },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Convert base64 to buffer
    const base64Data = photoData.replace(/^data:image\/[a-z]+;base64,/, "")
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Determine file extension based on file type
    let fileExtension = 'jpg'
    if (fileType) {
      if (fileType.includes('png')) fileExtension = 'png'
      else if (fileType.includes('gif')) fileExtension = 'gif'
      else if (fileType.includes('webp')) fileExtension = 'webp'
      else if (fileType.includes('heic') || fileType.includes('heif')) fileExtension = 'heic'
    }
    
    // Generate unique filename using pass_id
    const timestamp = Date.now()
    const uniqueFileName = `${passId}-${timestamp}.${fileExtension}`
    
    // Upload to Supabase storage in the pass-selfies folder
    const { error } = await supabase.storage
      .from('kairos-photos')
      .upload(`pass-selfies/${uniqueFileName}`, buffer, {
        contentType: fileType || 'image/jpeg',
        upsert: true
      })

    if (error) {
      console.error("Supabase upload error:", error)
      return NextResponse.json(
        { success: false, error: "Failed to upload photo" },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('kairos-photos')
      .getPublicUrl(`pass-selfies/${uniqueFileName}`)

    return NextResponse.json({
      success: true,
      data: {
        url: urlData.publicUrl,
        fileName: uniqueFileName
      }
    })

  } catch (error) {
    console.error("Upload photo error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 