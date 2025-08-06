import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

// Bible verses array - including Esther 4:14
const bibleVerses = [
  {
    reference: "Esther 4:14",
    text: "For if you remain silent at this time, relief and deliverance for the Jews will arise from another place, but you and your father's family will perish. And who knows but that you have come to your royal position for such a time as this?"
  },
  {
    reference: "Jeremiah 29:11",
    text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future."
  },
  {
    reference: "Proverbs 3:5",
    text: "Trust in the Lord with all your heart and lean not on your own understanding."
  },
  {
    reference: "Joshua 1:9",
    text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go."
  },
  {
    reference: "Romans 8:28",
    text: "And we know that in all things God works for the good of those who love him."
  },
  {
    reference: "Philippians 4:13",
    text: "I can do all this through him who gives me strength."
  }
];

// Kairos quote and Gen Z messages array
const genZMessages = [
  "You didn't just show up. You aligned. 🔥",
  "God knew. You came. It's giving divine timing. ✨",
  "Chosen. Anointed. On time. 💼⏳",
  "This isn't random. This is Kairos. 🕊",
  "You're not late. You're aligned. 💫",
  "Holy Spirit said, 'pull up.' You obeyed. 👣🔥",
  "Walking in purpose looks good on you. 💅🏾",
  "The vibe is spiritual. The moment is now. 🧿",
  "Kairos unlocked. You're the key. 🗝️",
  "Heaven was waiting for you. 🫶🏾"
];

export async function POST(request: NextRequest) {
  try {
    const attendeeData = await request.json()
    
    // Create Supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Select random verse and message
    const randomVerse = bibleVerses[Math.floor(Math.random() * bibleVerses.length)];
    const randomMessage = genZMessages[Math.floor(Math.random() * genZMessages.length)];

    // Generate a unique pass ID (KAIROS-XXXX format)
    const generatePassId = () => {
      const randomNum = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
      return `KAIROS-${randomNum}`;
    };

    // Insert attendee data into Supabase with the correct schema
    const { data, error } = await supabase
      .from('kairos_passes')
      .insert([
        {
          first_name: attendeeData.firstName,
          last_name: attendeeData.lastName,
          email: attendeeData.email,
          phone_number: attendeeData.phone,
          heard_about: attendeeData.hearAbout,
          verse_reference: randomVerse.reference,
          verse_text: randomVerse.text,
          message_text: randomMessage,
          theme: attendeeData.passColor || 'dark-green',
          pass_id: generatePassId()
        }
      ])
      .select()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ 
        success: false, 
        message: "Failed to save pass data",
        error: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Pass data saved successfully",
      data: data[0]
    })
  } catch (error) {
    console.error("Error processing pass data:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to process pass data",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const phone = searchParams.get('phone')

    if (!email && !phone) {
      return NextResponse.json(
        { success: false, error: "Email or phone parameter is required" },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    let query = supabase
      .from('kairos_passes')
      .select('*')

    if (email) {
      query = query.eq('email', email.toLowerCase().trim())
    } else if (phone) {
      query = query.eq('phone_number', phone.trim())
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json(
          { success: false, error: "No attendee found with the provided information" },
          { status: 404 }
        )
      }
      console.error("Database error:", error)
      return NextResponse.json(
        { success: false, error: "Database error" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        id: data.pass_id, // Use pass_id as the primary identifier
        passId: data.pass_id // Also include as passId for clarity
      }
    })

  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
