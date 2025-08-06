import { NextRequest, NextResponse } from "next/server"
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { html, width = 1080, height = 1920 } = await request.json()

    if (!html) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 })
    }

    console.log('🚀 Starting Puppeteer export...')
    console.log('📏 Dimensions:', width, 'x', height)

    // Convert images to base64
    const imageToBase64 = (imagePath: string): string => {
      try {
        const fullPath = path.join(process.cwd(), 'public', imagePath)
        const imageBuffer = fs.readFileSync(fullPath)
        const base64 = imageBuffer.toString('base64')
        const ext = path.extname(imagePath).toLowerCase()
        const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg'
        return `data:${mimeType};base64,${base64}`
      } catch (error) {
        console.error('Error converting image to base64:', error)
        return ''
      }
    }

    const kairosLogoBase64 = imageToBase64('/images/kairos_PNG_UHD.png')
    const nriLogoBase64 = imageToBase64('/images/1NRI Logo - Fixed - Transparent (1).png')
    
    console.log('🖼️ Kairos logo base64 length:', kairosLogoBase64.length)
    console.log('🖼️ 1NRI logo base64 length:', nriLogoBase64.length)

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    await page.setViewport({ width, height })

    // Replace image paths with base64 data
    const processedHtml = html
      .replace('/images/kairos_PNG_UHD.png', kairosLogoBase64)
      .replace('/images/1NRI Logo - Fixed - Transparent (1).png', nriLogoBase64)

    // Set content and wait for everything to load
    await page.setContent(processedHtml, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
    })

    // Wait a bit more for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000))

    const buffer = await page.screenshot({ 
      type: 'png',
      fullPage: false,
      omitBackground: false,
      clip: {
        x: 0,
        y: 0,
        width: width,
        height: height
      }
    })

    await browser.close()

    console.log('✅ Export completed successfully')

    // Return the image as a downloadable blob
    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="kairos-pass.png"',
      },
    })

  } catch (error) {
    console.error('❌ Export error:', error)
    return NextResponse.json({ error: 'Failed to export pass' }, { status: 500 })
  }
} 