import { NextRequest, NextResponse } from "next/server"
import { getTemplateGenerator } from '@/lib/templates'
import puppeteer from 'puppeteer'

export async function POST(request: NextRequest) {
  try {
    const { 
      template = 'kairos-pass', 
      attendeeData, 
      selectedColor, 
      displayPhoto, 
      size = { width: 1080, height: 1920 },
      format = 'svg'
    } = await request.json()

    if (!attendeeData) {
      return NextResponse.json({ error: 'Attendee data is required' }, { status: 400 })
    }

    console.log('🚀 Starting pass export...')
    console.log('📏 Format:', format)
    console.log('📏 Dimensions:', size.width, 'x', size.height)

    // Get the appropriate template generator
    const generateTemplate = getTemplateGenerator(template)

    // Generate the SVG using the template
    const svgContent = await generateTemplate({
      attendeeData,
      selectedColor,
      displayPhoto,
      size
    })

    console.log('✅ SVG generated successfully')

    // For SVG format, return the original content directly
    if (format === 'svg') {
      return new NextResponse(svgContent, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': `attachment; filename="kairos-pass-${attendeeData.first_name?.toLowerCase()}.svg"`
        },
      })
    }

    // For other formats (PNG, JPG, PDF), use Puppeteer
    console.log('🖥️ Converting to', format, 'using Puppeteer...')
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()

    // Set content with proper scaling
    await page.setContent(`
      <html>
        <head>
          <style>
            body { margin: 0; padding: 0; }
            svg { width: 100%; height: 100%; }
          </style>
        </head>
        <body>${svgContent}</body>
      </html>
    `)

    // Set viewport size
    await page.setViewport({
      width: Math.ceil(size.width),
      height: Math.ceil(size.height),
      deviceScaleFactor: 1,
    })

    let buffer
    let contentType
    let fileExtension

    if (format === 'png') {
      buffer = await page.screenshot({ 
        type: 'png',
        fullPage: false,
        omitBackground: false
      })
      contentType = 'image/png'
      fileExtension = 'png'
    } else if (format === 'jpg' || format === 'jpeg') {
      buffer = await page.screenshot({ 
        type: 'jpeg',
        fullPage: false,
        omitBackground: false,
        quality: 90
      })
      contentType = 'image/jpeg'
      fileExtension = 'jpg'
    } else if (format === 'pdf') {
      buffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        width: `${size.width}px`,
        height: `${size.height}px`
      })
      contentType = 'application/pdf'
      fileExtension = 'pdf'
    } else {
      throw new Error(`Unsupported format: ${format}`)
    }

    await browser.close()

    console.log('✅ Export completed successfully')

    // Return the file for download
    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="kairos-pass-${attendeeData.first_name?.toLowerCase()}.${fileExtension}"`,
      },
    })

  } catch (error) {
    console.error('❌ Export error:', error)
    return NextResponse.json({ 
      error: 'Failed to export pass',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 