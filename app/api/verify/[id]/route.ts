import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const passId = params.id
    
    // Create Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Fetch attendee data from Supabase
    const { data, error } = await supabase
      .from('attendees')
      .select('*')
      .eq('id', passId)
      .single()

    if (error || !data) {
      console.error("Supabase error:", error)
      return NextResponse.json({ 
        success: false, 
        message: "Pass not found or invalid",
        error: error?.message 
      }, { status: 404 })
    }

    // Transform the data to match the frontend expected format
    const transformedData = {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      hearAbout: data.hear_about,
      timestamp: data.timestamp,
      passColor: data.pass_color,
      verified: true
    }

    return NextResponse.json({
      success: true,
      data: transformedData
    })
  } catch (error) {
    console.error("Error verifying pass:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to verify pass",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 