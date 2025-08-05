import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { passId, photoData } = await request.json()
    
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
    
    // Upload to Supabase storage
    const { error } = await supabase.storage
      .from('kairos-photos')
      .upload(`${passId}.jpg`, buffer, {
        contentType: 'image/jpeg',
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
      .getPublicUrl(`${passId}.jpg`)

    return NextResponse.json({
      success: true,
      data: {
        url: urlData.publicUrl
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