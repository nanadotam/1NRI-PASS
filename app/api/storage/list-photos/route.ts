import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const passId = searchParams.get('passId')
    
    if (!passId) {
      return NextResponse.json(
        { success: false, error: "Missing passId parameter" },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // List all files in the pass-selfies folder
    const { data: files, error } = await supabase.storage
      .from('kairos-photos')
      .list('pass-selfies', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      console.error("Supabase list error:", error)
      return NextResponse.json(
        { success: false, error: "Failed to list photos" },
        { status: 500 }
      )
    }

    // Filter files that match the pass ID pattern
    const passPhotos = files
      .filter(file => file.name.startsWith(`${passId}-`))
      .map(file => ({
        name: file.name,
        url: supabase.storage
          .from('kairos-photos')
          .getPublicUrl(`pass-selfies/${file.name}`).data.publicUrl,
        created_at: file.created_at
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({
      success: true,
      photos: passPhotos
    })

  } catch (error) {
    console.error("List photos error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 