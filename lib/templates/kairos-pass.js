import { DOMParser } from 'xmldom'
import fs from 'fs/promises'
import path from 'path'

// Helper function to find SVG elements by class
const findElement = (doc, className) => {
  // Try getElementsByClassName first
  if (doc.getElementsByClassName) {
    const elements = doc.getElementsByClassName(className)
    if (elements.length > 0) return elements[0]
  }
  
  // Fallback: search by class attribute
  const allElements = doc.getElementsByTagName('*')
  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i]
    if (element.getAttribute && element.getAttribute('class') === className) {
      return element
    }
  }
  
  return null
}

// Helper function to convert image to base64
const imageToBase64 = async (imagePath) => {
  try {
    console.log('🖼️ Loading image from path:', imagePath)
    const fullPath = path.join(process.cwd(), 'public', imagePath)
    console.log('📁 Full image path:', fullPath)
    
    // Check if file exists
    try {
      await fs.access(fullPath)
      console.log('✅ Image file exists')
    } catch (accessError) {
      console.error('❌ Image file not accessible:', accessError.message)
      return ''
    }
    
    const imageBuffer = await fs.readFile(fullPath)
    console.log('📊 Image buffer size:', imageBuffer.length, 'bytes')
    
    const base64 = imageBuffer.toString('base64')
    const ext = path.extname(imagePath).toLowerCase()
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg'
    const dataUrl = `data:${mimeType};base64,${base64}`
    
    console.log('✅ Image converted to base64 successfully, data URL length:', dataUrl.length)
    return dataUrl
  } catch (error) {
    console.error('❌ Error converting image to base64:', error)
    return ''
  }
}

// Helper function to get pass colors
const getPassColors = (color) => {
  const colorOptions = [
    { id: "dark-green", name: "Dark Green", bg: "#182b11" },
    { id: "dark-purple", name: "Dark Purple", bg: "#331A33" },
    { id: "midnight-blue", name: "Midnight Blue", bg: "#0f1419" },
    { id: "deep-burgundy", name: "Deep Burgundy", bg: "#4a1810" },
  ]
  
  const option = colorOptions.find(opt => opt.id === color)
  console.log('🎨 Color lookup:', { requested: color, found: option?.id, background: option?.bg })
  
  return {
    background: option?.bg || "#331A33",
    text: "#ffffff",
    accent: "#D4AF37"
  }
}

export const generateKairosPassTemplate = async (data) => {
  const {
    attendeeData,
    selectedColor = 'dark-purple',
    displayPhoto = null
  } = data

  if (!attendeeData) {
    throw new Error('Attendee data is required')
  }

  console.log('🚀 Starting Kairos pass SVG generation...')
  console.log('👤 Attendee:', attendeeData.first_name, attendeeData.last_name)
  console.log('🎨 Selected color:', selectedColor)

  // Read the SVG template
  const templatePath = path.join(process.cwd(), 'public', 'templates', 'kairos-pass.svg')
  let svgTemplate
  
  try {
    svgTemplate = await fs.readFile(templatePath, 'utf-8')
  } catch (error) {
    console.log('📝 Template not found, creating default SVG template...')
    svgTemplate = createDefaultSVGTemplate()
  }

  // Update background color using string replacement
  const colors = getPassColors(selectedColor)
  console.log('🎨 Using colors:', colors)
  
  // Update the background rect with the selected color (now class st14)
  svgTemplate = svgTemplate.replace(
    /<rect class="st14"[^>]*>/,
    `<rect class="st14" width="320" height="568" fill="${colors.background}"/>`
  )

  // Update attendee information using string replacement (now class st8)
  svgTemplate = svgTemplate.replace(
    /<text class="st8"[^>]*>.*?Attendee Name.*?<\/text>/,
    `<text class="st8" transform="translate(16 359)"><tspan x="0" y="0">${attendeeData.firstName || attendeeData.first_name} ${attendeeData.lastName || attendeeData.last_name}</tspan></text>`
  )

  // Update attendee name label (now class st9)
  svgTemplate = svgTemplate.replace(
    /<text class="st9"[^>]*>.*?Attendee Name.*?<\/text>/,
    `<text class="st9" transform="translate(16 369)"><tspan x="0" y="0">${attendeeData.firstName || attendeeData.first_name} ${attendeeData.lastName || attendeeData.last_name}</tspan></text>`
  )

  // Update pass ID using string replacement - use right-aligned positioning (now class st5)
  svgTemplate = svgTemplate.replace(
    /<text class="st5"[^>]*>.*?PASS ID.*?<\/text>/,
    `<text class="st5" transform="translate(253.6 359)" text-anchor="end"><tspan x="0" y="0">${attendeeData.passId || attendeeData.id}</tspan></text>`
  )

  // Update pass ID label (now class st9)
  svgTemplate = svgTemplate.replace(
    /<text class="st9"[^>]*>.*?PASS ID.*?<\/text>/,
    `<text class="st9" transform="translate(266.2 369)" text-anchor="end"><tspan x="0" y="0">${attendeeData.passId || attendeeData.id}</tspan></text>`
  )

  // Update message text (quote) using string replacement (now class st7)
  const quoteText = attendeeData.message_text || "This isn't just an event. This is your moment."
  // Split the quote into two parts for proper positioning
  const quoteParts = quoteText.split('. This is your')
  const firstPart = quoteParts[0] || "This isn't just an event"
  const secondPart = quoteParts[1] ? `. This is your${quoteParts[1]}` : " moment."
  
  // Replace the first part of the quote (more specific pattern)
  svgTemplate = svgTemplate.replace(
    /<text class="st7"[^>]*>.*?&quot;This isn&apos;t just an event\. This is your.*?<\/text>/,
    `<text class="st7" transform="translate(31.36 407.72)"><tspan x="0" y="0">"${firstPart}</tspan></text>`
  )
  
  // Replace the second part of the quote (more specific pattern)
  svgTemplate = svgTemplate.replace(
    /<text class="st7"[^>]*>.*?moment\..*?<\/text>/,
    `<text class="st7" transform="translate(123.99 427.72)"><tspan x="0" y="0">${secondPart}</tspan></text>`
  )

  // Update verse text using string replacement (now class st12)
  const verseText = attendeeData.verse_text || "No weapon formed against you will succeed, and you will silence every voice raised to accuse you."
  svgTemplate = svgTemplate.replace(
    /<text class="st12"[^>]*>.*?No weapon formed against you will succeed.*?<\/text>/,
    `<text class="st12" transform="translate(59.31 459.97)"><tspan x="0" y="0">${verseText}</tspan></text>`
  )

  // Update verse reference using string replacement (now class st1)
  const verseRef = attendeeData.verse_reference || "Isaiah 54:17"
  svgTemplate = svgTemplate.replace(
    /<text class="st1"[^>]*>.*?Isaiah 54:17.*?<\/text>/,
    `<text class="st1" transform="translate(131.2 510)"><tspan x="0" y="0">${verseRef}</tspan></text>`
  )

  // Update photo/QR code area (now class st13)
  if (displayPhoto) {
    // Replace the white rect with photo
    svgTemplate = svgTemplate.replace(
      /<rect class="st13"[^>]*\/>/,
      `<image href="${displayPhoto}" x="56.67" y="34.87" width="206.67" height="206.67" preserveAspectRatio="xMidYMid slice" class="photo-area"/>`
    )
  } else {
    // Replace the white rect with QR code placeholder
    svgTemplate = svgTemplate.replace(
      /<rect class="st13"[^>]*\/>/,
      `<rect class="st13" x="56.67" y="34.87" width="206.67" height="206.67" rx="16" ry="16" fill="white"/><text x="160" y="138" text-anchor="middle" font-family="JetBrains Mono" font-size="12" fill="#331A33">QR: ${attendeeData.passId || attendeeData.id}</text>`
    )
  }

  // Add logos using string replacement
  try {
    console.log('🖼️ Starting logo integration...')
    
    const kairosLogoBase64 = await imageToBase64('/images/kairos_PNG_UHD.png')
    const nriLogoBase64 = await imageToBase64('/images/1NRI Logo - Fixed - Transparent (1).png')
    
    // Replace Kairos logo text with actual image (now class st0)
    if (kairosLogoBase64) {
      console.log('✅ Kairos logo loaded successfully')
      const kairosLogoReplacement = `<image href="${kairosLogoBase64}" x="108.21" y="280" width="120" height="60" preserveAspectRatio="xMidYMid meet" class="kairos-logo"/>`
      
      // Replace the Kairos text element with the image
      svgTemplate = svgTemplate.replace(
        /<text class="st0"[^>]*>.*?<\/text>/,
        kairosLogoReplacement
      )
      console.log('✅ Kairos logo replaced successfully')
    } else {
      console.log('⚠️ Kairos logo not found, keeping text')
    }

    // Replace 1NRI logo text with actual image (now class st10)
    if (nriLogoBase64) {
      console.log('✅ 1NRI logo loaded successfully')
      const nriLogoReplacement = `<image href="${nriLogoBase64}" x="16" y="24" width="24" height="24" preserveAspectRatio="xMidYMid meet" class="nri-logo" opacity="0.8"/>`
      
      // Replace the 1NRI text element with the image
      svgTemplate = svgTemplate.replace(
        /<text class="st10"[^>]*>.*?<\/text>/,
        nriLogoReplacement
      )
      console.log('✅ 1NRI logo replaced successfully')
    } else {
      console.log('⚠️ 1NRI logo not found, keeping text')
    }
    
    console.log('✅ Logo integration completed')
  } catch (logoError) {
    console.error('❌ Error updating logos:', logoError)
  }

  console.log('✅ Kairos pass SVG generated successfully')
  return svgTemplate
}

// Generate QR code SVG - matches the exact positioning and size from the new SVG
const generateQRCodeSVG = (passId) => {
  // Create a group to hold the QR code elements
  const qrGroup = {
    tagName: 'g',
    attributes: { class: 'qr-code-area' },
    childNodes: [
      {
        tagName: 'rect',
        attributes: {
          x: '56.67',
          y: '34.87',
          width: '206.67',
          height: '206.67',
          rx: '16',
          ry: '16',
          fill: 'white'
        }
      },
      {
        tagName: 'text',
        attributes: {
          x: '160',
          y: '138',
          'text-anchor': 'middle',
          'font-family': 'JetBrains Mono',
          'font-size': '12',
          fill: '#331A33'
        },
        textContent: `QR: ${passId || 'PASS'}`
      }
    ]
  }
  
  // Convert the group structure to SVG string
  const serializeGroup = (group) => {
    let result = '<' + group.tagName
    
    // Add attributes
    if (group.attributes) {
      for (const [key, value] of Object.entries(group.attributes)) {
        result += ` ${key}="${value}"`
      }
    }
    
    if (group.childNodes && group.childNodes.length > 0) {
      result += '>'
      for (const child of group.childNodes) {
        if (child.textContent) {
          result += `<${child.tagName}`
          if (child.attributes) {
            for (const [key, value] of Object.entries(child.attributes)) {
              result += ` ${key}="${value}"`
            }
          }
          result += `>${child.textContent}</${child.tagName}>`
        } else {
          result += '<' + child.tagName
          if (child.attributes) {
            for (const [key, value] of Object.entries(child.attributes)) {
              result += ` ${key}="${value}"`
            }
          }
          result += ' />'
        }
      }
      result += '</' + group.tagName + '>'
    } else {
      result += ' />'
    }
    
    return result
  }
  
  return serializeGroup(qrGroup)
}

// Create a default SVG template if none exists - updated to match the new structure
const createDefaultSVGTemplate = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 320 568">
  <defs>
    <style>
      .st0 {
        fill: #d4af37;
        font-size: 24px;
      }

      .st0, .st1, .st2, .st3, .st4, .st5, .st6, .st7, .st8, .st9, .st10, .st11, .st12 {
        isolation: isolate;
      }

      .st0, .st5, .st7, .st8, .st10 {
        font-weight: 700;
      }

      .st0, .st10 {
        font-family: Arial-BoldMT, Arial;
      }

      .st1 {
        font-family: JetBrainsMono-SemiBoldItalic, 'JetBrains Mono';
      }

      .st1, .st4 {
        font-weight: 600;
      }

      .st1, .st4, .st5, .st13, .st7, .st8, .st9, .st10, .st11, .st12 {
        fill: #fff;
      }

      .st1, .st4, .st11 {
        font-size: 8px;
      }

      .st1, .st7, .st9 {
        font-style: italic;
      }

      .st2 {
        opacity: .7;
      }

      .st3 {
        opacity: .8;
      }

      .st4 {
        font-family: Poppins-SemiBold, Poppins;
      }

      .st5, .st8 {
        font-family: JetBrainsMono-Bold, 'JetBrains Mono';
      }

      .st5, .st10 {
        font-size: 12px;
      }

      .st14 {
        fill: #331a33;
      }

      .st7 {
        font-family: Poppins-BoldItalic, Poppins;
      }

      .st7, .st8 {
        font-size: 14px;
      }

      .st9 {
        font-family: JetBrainsMono-Italic, 'JetBrains Mono';
      }

      .st9, .st12 {
        font-size: 9px;
      }

      .st11, .st12 {
        font-family: Poppins-Regular, Poppins;
      }
    </style>
  </defs>
  
  <!-- Background -->
  <rect class="st14" width="320" height="568"/>
  
  <!-- 1NRI Logo - Top Left -->
  <text class="st10" transform="translate(16 24)"><tspan x="0" y="0">1NRI</tspan></text>
  
  <!-- QR Code/Photo Area - Top Center -->
  <rect class="st13" x="56.67" y="34.87" width="206.67" height="206.67" rx="16" ry="16"/>
  
  <!-- Kairos Logo - Center Below QR -->
  <text class="st0" transform="translate(108.21 280)"><tspan x="0" y="0">KAIROS</tspan></text>
  
  <!-- Attendee Information - Left Side -->
  <g>
    <text class="st8" transform="translate(16 359)"><tspan x="0" y="0">Attendee Name</tspan></text>
    <text class="st9" transform="translate(16 369)"><tspan x="0" y="0">Attendee Name</tspan></text>
  </g>
  
  <!-- Pass ID - Right Side -->
  <g>
    <text class="st5" transform="translate(253.6 359)"><tspan x="0" y="0">PASS ID</tspan></text>
    <text class="st9" transform="translate(266.2 369)"><tspan x="0" y="0">PASS ID</tspan></text>
  </g>
  
  <!-- Main Quote - Centered -->
  <text class="st7" transform="translate(31.36 407.72)"><tspan x="0" y="0">"This isn't just an event. This is your</tspan></text>
  <text class="st7" transform="translate(123.99 427.72)"><tspan x="0" y="0">moment."</tspan></text>
  
  <!-- Bible Verse - Centered -->
  <text class="st12" transform="translate(59.31 459.97)"><tspan x="0" y="0">No weapon formed against you will succeed,</tspan></text>
  
  <!-- Verse Reference - Centered -->
  <text class="st1" transform="translate(131.2 510)"><tspan x="0" y="0">Isaiah 54:17</tspan></text>
  
  <!-- Footer -->
  <g>
    <g class="st2">
      <text class="st11" transform="translate(16 555.14)"><tspan x="0" y="0">Updated</tspan></text>
      <text class="st4" transform="translate(53.04 555.14)"><tspan x="0" y="0">August 16, 2025</tspan></text>
    </g>
    <text class="st11" transform="translate(237.92 555.14)"><tspan x="0" y="0">WWW.1NRI.STORE</tspan></text>
  </g>
</svg>`
} 