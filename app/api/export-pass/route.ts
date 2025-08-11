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
      size = { width: 320, height: 568 }, // Fixed: Updated to match new SVG template dimensions
      format = 'jpg', // Default to JPG for automatic conversion
      scale = 3 // Default to 3x scale for high quality
    } = await request.json()

    if (!attendeeData) {
      return NextResponse.json({ error: 'Attendee data is required' }, { status: 400 })
    }

    console.log('🚀 Starting pass export...')
    console.log('📏 Format:', format)
    console.log('📏 Base dimensions:', size.width, 'x', size.height)
    console.log('📏 Scale:', scale + 'x')
    console.log('📏 Final dimensions:', size.width * scale, 'x', size.height * scale)

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
    console.log('📄 SVG content length:', svgContent.length)

    // For SVG format, return the original content directly
    if (format === 'svg') {
      return new NextResponse(svgContent, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': `attachment; filename="kairos-pass-${attendeeData.first_name?.toLowerCase()}.svg"`
        },
      })
    }

    // For other formats (PNG, JPG, PDF), use Puppeteer with scaling
    console.log('🖥️ Converting to', format, 'using Puppeteer at', scale + 'x scale...')
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
    })

    const page = await browser.newPage()

    // Set content with proper scaling and ensure SVG renders correctly
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              background: transparent;
              overflow: hidden;
              width: 100vw;
              height: 100vh;
            }
            svg { 
              width: 100%; 
              height: 100%; 
              display: block;
              background: transparent;
            }
            * {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>${svgContent}</body>
      </html>
    `

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

    // Set viewport size at the scaled dimensions
    const scaledWidth = Math.ceil(size.width * scale)
    const scaledHeight = Math.ceil(size.height * scale)
    
    await page.setViewport({
      width: scaledWidth,
      height: scaledHeight,
      deviceScaleFactor: 1,
    })

    // Wait for SVG to fully render
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Debug: Check if SVG is rendering correctly
    const svgElement = await page.$('svg')
    if (svgElement) {
      const svgInfo = await page.evaluate((svg) => {
        return {
          width: svg.getAttribute('width'),
          height: svg.getAttribute('height'),
          viewBox: svg.getAttribute('viewBox'),
          hasContent: svg.children.length > 0,
          computedStyle: {
            width: window.getComputedStyle(svg).width,
            height: window.getComputedStyle(svg).height
          }
        }
      }, svgElement)
      console.log('🔍 SVG Debug Info:', svgInfo)
    } else {
      console.log('⚠️ No SVG element found on page')
    }

    // Debug: Check page content
    const pageContent = await page.content()
    console.log('📄 Page content length:', pageContent.length)
    console.log('🔍 SVG in page:', pageContent.includes('<svg'))

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
        quality: 95 // High quality for 3x scale
      })
      contentType = 'image/jpeg'
      fileExtension = 'jpg'
    } else if (format === 'pdf') {
      buffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`
      })
      contentType = 'application/pdf'
      fileExtension = 'pdf'
    } else {
      throw new Error(`Unsupported format: ${format}`)
    }

    await browser.close()

    console.log('✅ Export completed successfully at', scale + 'x scale')

    // Return the file for download
    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="kairos-pass-${attendeeData.first_name?.toLowerCase()}-${scale}x.${fileExtension}"`,
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