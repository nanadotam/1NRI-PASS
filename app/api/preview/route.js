import { NextResponse } from 'next/server'
import { getTemplateGenerator } from '@/lib/templates'

export async function POST(request) {
  try {
    const { template = 'kairos-pass', attendeeData, selectedColor, displayPhoto, size } = await request.json()

    if (!attendeeData) {
      return NextResponse.json({ error: 'Attendee data is required' }, { status: 400 })
    }

    console.log('🖼️ Generating preview for template:', template)

    // Get the appropriate template generator
    const generateTemplate = getTemplateGenerator(template)

    // Generate the SVG using the template
    const svgData = await generateTemplate({
      attendeeData,
      selectedColor,
      displayPhoto,
      size
    })

    console.log('✅ Preview generated successfully')

    // Return the SVG data
    return NextResponse.json({
      success: true,
      svg: svgData,
      template,
      dimensions: size
    })

  } catch (error) {
    console.error('❌ Preview generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate preview',
      details: error.message 
    }, { status: 500 })
  }
} 