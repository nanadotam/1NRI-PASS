import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const attendeeData = await request.json()
    
    // Create Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Insert attendee data into Supabase
    const { data, error } = await supabase
      .from('attendees')
      .insert([
        {
          id: attendeeData.id,
          full_name: attendeeData.fullName,
          email: attendeeData.email,
          phone: attendeeData.phone,
          hear_about: attendeeData.hearAbout,
          timestamp: attendeeData.timestamp,
          pass_color: attendeeData.passColor || 'green'
        }
      ])
      .select()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ 
        success: false, 
        message: "Failed to save attendee data",
        error: error.message 
      }, { status: 500 })
    }

    console.log("Successfully saved attendee data:", data)

    return NextResponse.json({
      success: true,
      message: "Attendee data saved successfully",
      id: attendeeData.id,
      data: data[0]
    })
  } catch (error) {
    console.error("Error processing attendee data:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to process attendee data",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { data, error } = await supabase
      .from('attendees')
      .select('*')
      .order('timestamp', { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ 
        success: false, 
        message: "Failed to fetch attendees",
        error: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error("Error fetching attendees:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch attendees",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
