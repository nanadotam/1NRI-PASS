import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

// Bible verses array from pass-display.tsx
const bibleVerses = [
  {
    reference: "Esther 4:14",
    text: "And who knows but that you have come to your royal position for such a time as this?"
  },
  {
    reference: "Jeremiah 29:11",
    text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future."
  },
  {
    reference: "Ecclesiastes 3:1",
    text: "There is a time for everything, and a season for every activity under the heavens."
  },
  {
    reference: "Romans 8:28",
    text: "And we know that God causes everything to work together for the good of those who love God and are called according to His purpose."
  },
  {
    reference: "Philippians 1:6",
    text: "He who began a good work in you will carry it on to completion until the day of Christ Jesus."
  },
  {
    reference: "Isaiah 60:22",
    text: "At the right time, I, the Lord, will make it happen."
  },
  {
    reference: "Proverbs 16:3",
    text: "Commit to the Lord whatever you do, and he will establish your plans."
  },
  {
    reference: "Psalm 37:23",
    text: "The Lord directs the steps of the godly. He delights in every detail of their lives."
  },
  {
    reference: "Isaiah 43:19",
    text: "See, I am doing a new thing! Now it springs up; do you not perceive it?"
  },
  {
    reference: "2 Timothy 1:7",
    text: "For God has not given us a spirit of fear and timidity, but of power, love, and self-discipline."
  },
  {
    reference: "Psalm 46:5",
    text: "God is within her, she will not fall; God will help her at break of day."
  },
  {
    reference: "Romans 12:2",
    text: "Let God transform you into a new person by changing the way you think."
  },
  {
    reference: "Galatians 6:9",
    text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up."
  },
  {
    reference: "Isaiah 41:10",
    text: "Don't be afraid, for I am with you. Don't be discouraged, for I am your God."
  },
  {
    reference: "Proverbs 3:5-6",
    text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."
  },
  {
    reference: "Matthew 5:14",
    text: "You are the light of the world. A town built on a hill cannot be hidden."
  },
  {
    reference: "Ephesians 2:10",
    text: "For we are God's masterpiece. He has created us anew in Christ Jesus, so we can do the good things he planned for us long ago."
  },
  {
    reference: "1 Peter 2:9",
    text: "But you are a chosen people, a royal priesthood, a holy nation, God's special possession."
  },
  {
    reference: "Isaiah 54:17",
    text: "No weapon formed against you will succeed, and you will silence every voice raised to accuse you."
  },
  {
    reference: "Matthew 6:33",
    text: "But seek first his kingdom and his righteousness, and all these things will be given to you as well."
  },
  {
    reference: "Philippians 4:13",
    text: "For I can do everything through Christ, who gives me strength."
  },
  {
    reference: "Psalm 23:1",
    text: "The Lord is my shepherd, I lack nothing."
  },
  {
    reference: "Deuteronomy 31:6",
    text: "So be strong and courageous! Do not be afraid and do not panic before them. For the Lord your God will personally go ahead of you."
  },
  {
    reference: "Isaiah 30:21",
    text: "Whether you turn to the right or to the left, your ears will hear a voice behind you, saying, 'This is the way; walk in it.'"
  },
  {
    reference: "Psalm 139:14",
    text: "Thank you for making me so wonderfully complex! Your workmanship is marvelous—how well I know it."
  },
  {
    reference: "Romans 5:5",
    text: "And hope does not put us to shame, because God's love has been poured out into our hearts through the Holy Spirit."
  },
  {
    reference: "Lamentations 3:22-23",
    text: "The faithful love of the Lord never ends! His mercies never cease. Great is his faithfulness; his mercies begin afresh each morning."
  },
  {
    reference: "1 Corinthians 2:9",
    text: "What no eye has seen, what no ear has heard, and what no human mind has conceived — the things God has prepared for those who love him."
  },
  {
    reference: "Psalm 34:5",
    text: "Those who look to him are radiant; their faces are never covered with shame."
  },
  {
    reference: "John 16:33",
    text: "I have told you all this so that you may have peace in me. Here on earth you will have many trials and sorrows. But take heart, because I have overcome the world."
  }
];

// Kairos quote and Gen Z messages array from pass-display.tsx
const genZMessages = [
  "You didn't just show up. You aligned.",
  "God said now. And you moved.",
  "This moment isn't random. It's Kairos.",
  "You're not just on time. You're right on purpose.",
  "Heaven is clapping. You're here.",
  "You answered the call. This is divine timing.",
  "Anointed, appointed, and in the building.",
  "You are not a coincidence. You're alignment in motion.",
  "Kairos? That's your whole vibe right now.",
  "You unlocked something sacred.",
  "This is your timestamp. Mark it.",
  "God's favor fits you like couture.",
  "You're living proof of perfect timing.",
  "You pulled up spiritually and physically.",
  "This isn't just an event. This is your moment.",
  "You're walking in answered prayer.",
  "God whispered. You moved.",
  "Nothing about this was accidental.",
  "Grace got you here. Glory will carry you.",
  "The glow? It's spiritual.",
  "You were meant to be here. And it shows.",
  "Time obeyed. You showed up.",
  "You aligned in style.",
  "You're a living prophecy in motion.",
  "You're not late. You're chosen.",
  "Don't downplay this. You stepped into something holy.",
  "Look at you—walking in kairos like it's everyday.",
  "Holy Spirit said: 'pull up.' And you did.",
  "This isn't a pass. It's a reminder. You're called.",
  "You caught it. The moment. The vibe. The assignment."
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

    // Use the pass ID from the form data instead of generating a new one
    const passId = attendeeData.id;

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
          pass_id: passId
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
    const allAttendees = searchParams.get('all')

    // If 'all' parameter is present, return all attendees with photos
    if (allAttendees === 'true') {
      const cookieStore = cookies()
      const supabase = createClient(cookieStore)

      // Fetch all attendees
      const { data: attendees, error } = await supabase
        .from('kairos_passes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Database error:", error)
        return NextResponse.json(
          { success: false, error: "Database error" },
          { status: 500 }
        )
      }

      // For each attendee, fetch their photos
      const attendeesWithPhotos = await Promise.all(
        attendees.map(async (attendee) => {
          try {
            // Get photos for this attendee
            const { data: files } = await supabase.storage
              .from('kairos-photos')
              .list('pass-selfies', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' }
              })

            // Filter photos for this specific attendee
            const attendeePhotos = files
              ?.filter(file => file.name.startsWith(`${attendee.pass_id}-`))
              .map(file => ({
                name: file.name,
                url: supabase.storage
                  .from('kairos-photos')
                  .getPublicUrl(`pass-selfies/${file.name}`).data.publicUrl,
                created_at: file.created_at
              }))
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || []

            return {
              ...attendee,
              photos: attendeePhotos,
              latestPhoto: attendeePhotos.length > 0 ? attendeePhotos[0] : null
            }
          } catch (photoError) {
            console.error(`Error fetching photos for attendee ${attendee.pass_id}:`, photoError)
            return {
              ...attendee,
              photos: [],
              latestPhoto: null
            }
          }
        })
      )

      return NextResponse.json({
        success: true,
        data: attendeesWithPhotos
      })
    }

    // Original single attendee lookup logic
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
