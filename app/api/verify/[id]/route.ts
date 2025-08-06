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

    // Fetch pass data from Supabase using pass_id instead of UUID
    const { data, error } = await supabase
      .from('kairos_passes')
      .select('*')
      .eq('pass_id', passId)
      .single()

    if (error || !data) {
      console.error("Supabase error:", error)
      return NextResponse.json({ 
        success: false, 
        message: "Pass not found or invalid",
        error: error?.message 
      }, { status: 404 })
    }

    // Transform the data to match the frontend expected format using correct field names
    const transformedData = {
      id: data.pass_id, // Use pass_id instead of UUID
      passId: data.pass_id, // Also include as passId for clarity
      fullName: `${data.first_name} ${data.last_name}`,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone_number,
      hearAbout: data.heard_about,
      verseReference: data.verse_reference,
      verse_reference: data.verse_reference, // Keep original field name for frontend compatibility
      verse_text: data.verse_text, // Keep original field name for frontend compatibility
      message_text: data.message_text, // Keep original field name for frontend compatibility
      theme: data.theme,
      timestamp: data.created_at,
      passColor: data.theme, // Using theme as pass color
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