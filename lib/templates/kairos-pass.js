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
    const fullPath = path.join(process.cwd(), 'public', imagePath)
    const imageBuffer = await fs.readFile(fullPath)
    const base64 = imageBuffer.toString('base64')
    const ext = path.extname(imagePath).toLowerCase()
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg'
    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    console.error('Error converting image to base64:', error)
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
  svgTemplate = svgTemplate.replace(/class="st10"[^>]*>/, `class="st10" width="320" height="568" fill="${colors.background}"/>`)

  // Update attendee information using string replacement
  svgTemplate = svgTemplate.replace(
    /<text class="st4"[^>]*>.*?<\/text>/,
    `<text class="st4" transform="translate(16 368)"><tspan x="0" y="0">${attendeeData.firstName || attendeeData.first_name} ${attendeeData.lastName || attendeeData.last_name}</tspan></text>`
  )

  // Update pass ID using string replacement
  svgTemplate = svgTemplate.replace(
    /<text class="st3"[^>]*>.*?<\/text>/,
    `<text class="st3" transform="translate(253.6 368)"><tspan x="0" y="0">${attendeeData.passId || attendeeData.id}</tspan></text>`
  )

  // Update message text using string replacement
  svgTemplate = svgTemplate.replace(
    /<text class="st9"[^>]*>.*?<\/text>/,
    `<text class="st9" transform="translate(31.53 420.51)"><tspan x="0" y="0">"${attendeeData.message_text || "This isn't just an event. This is your moment."}"</tspan></text>`
  )

  // Update verse text using string replacement
  svgTemplate = svgTemplate.replace(
    /<text class="st7"[^>]*>.*?<\/text>/,
    `<text class="st7" transform="translate(31.44 488)"><tspan x="0" y="0">${attendeeData.verse_text || "No weapon formed against you will succeed, and you will silence every voice raised to accuse you."}</tspan></text>`
  )

  // Update verse reference using string replacement
  svgTemplate = svgTemplate.replace(
    /<text class="st1"[^>]*>.*?<\/text>/,
    `<text class="st1" transform="translate(131.2 520)"><tspan x="0" y="0">${attendeeData.verse_reference || "Isaiah 54:17"}</tspan></text>`
  )

  // Update photo/QR code area
  if (displayPhoto) {
    // Replace the white rect with photo
    svgTemplate = svgTemplate.replace(
      /<rect class="st8"[^>]*\/>/,
      `<image href="${displayPhoto}" x="56.67" y="34.87" width="206.67" height="206.67" preserveAspectRatio="xMidYMid slice" class="photo-area"/>`
    )
  } else {
    // Replace the white rect with QR code placeholder
    svgTemplate = svgTemplate.replace(
      /<rect class="st8"[^>]*\/>/,
      `<rect class="st8" x="56.67" y="34.87" width="206.67" height="206.67" rx="16" ry="16" fill="white"/><text x="160" y="138" text-anchor="middle" font-family="JetBrains Mono" font-size="12" fill="#331A33">QR: ${attendeeData.passId || attendeeData.id}</text>`
    )
  }

  // Add logos using string replacement
  try {
    const kairosLogoBase64 = await imageToBase64('/images/kairos_PNG_UHD.png')
    const nriLogoBase64 = await imageToBase64('/images/1NRI Logo - Fixed - Transparent (1).png')
    
    // Replace Kairos logo placeholder with actual image
    if (kairosLogoBase64) {
      svgTemplate = svgTemplate.replace(
        /<g class="kairos-logo-placeholder">.*?<\/g>/,
        `<image href="${kairosLogoBase64}" x="40" y="190" width="240" height="120" preserveAspectRatio="xMidYMid meet" class="kairos-logo"/>`
      )
    }

    // Add 1NRI logo after the background rect
    if (nriLogoBase64) {
      svgTemplate = svgTemplate.replace(
        /<rect class="st10"[^>]*\/>/,
        `<rect class="st10" width="320" height="568" fill="${colors.background}"/><image href="${nriLogoBase64}" x="8" y="8" width="20" height="20" preserveAspectRatio="xMidYMid meet" class="nri-logo" opacity="0.6"/>`
      )
    }
  } catch (logoError) {
    console.error('Error updating logos:', logoError)
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
      .st0, .st1, .st2, .st3, .st4, .st5, .st6, .st7, .st8, .st9, .st10 {
        isolation: isolate;
      }
      .st0, .st2 { opacity: .7; }
      .st7, .st1, .st2, .st3, .st8, .st9, .st4, .st5, .st6 { fill: #fff; }
      .st8 { fill: #fff; }
      .st7, .st2 { font-family: Poppins-Regular, Poppins, Arial, sans-serif; }
      .st7, .st6 { font-size: 9px; }
      .st1 { font-family: JetBrainsMono-SemiBoldItalic, 'JetBrains Mono', 'Courier New', monospace; }
      .st1, .st2, .st5 { font-size: 8px; }
      .st1, .st9, .st6 { font-style: italic; }
      .st1, .st5 { font-weight: 600; }
      .st1, .st6 { opacity: .75; }
      .st3 { font-size: 12px; }
      .st3, .st9, .st4 { font-weight: 700; }
      .st3, .st4 { font-family: JetBrainsMono-Bold, 'JetBrains Mono', 'Courier New', monospace; }
      .st10 { fill: #331a33; }
      .st9 { font-family: Poppins-ExtraBoldItalic, Poppins, Arial, sans-serif; }
      .st9, .st4 { font-size: 14px; }
      .st5 { font-family: Poppins-SemiBold, Poppins, Arial, sans-serif; opacity: .9; }
      .st6 { font-family: JetBrainsMono-Italic, 'JetBrains Mono', 'Courier New', monospace; }
    </style>
  </defs>
  
  <rect class="st10" width="320" height="568"/>
  <rect class="st8" x="56.67" y="34.87" width="206.67" height="206.67" rx="16" ry="16"/>
  
  <!-- Kairos Logo Placeholder - will be replaced by actual image -->
  <g class="kairos-logo-placeholder">
    <text x="160" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="#D4AF37">KAIROS</text>
  </g>
  
  <g>
    <text class="st4" transform="translate(16 368)"><tspan x="0" y="0">Attendee Name</tspan></text>
    <text class="st6" transform="translate(16 378)"><tspan x="0" y="0">Attendee Name</tspan></text>
  </g>
  
  <g>
    <text class="st3" transform="translate(253.6 368)"><tspan x="0" y="0">PASS ID</tspan></text>
    <text class="st6" transform="translate(265.94 378)"><tspan x="0" y="0">PASS ID</tspan></text>
  </g>
  
  <g>
    <g class="st0">
      <text class="st2" transform="translate(16 555.14)"><tspan x="0" y="0">Updated </tspan></text>
      <text class="st5" transform="translate(53.04 555.14)"><tspan x="0" y="0">August 16, 2025</tspan></text>
    </g>
    <text class="st2" transform="translate(237.92 555.14)"><tspan x="0" y="0">WWW.1NRI.STORE</tspan></text>
  </g>
  
  <text class="st9" transform="translate(31.53 420.51)"><tspan x="0" y="0">"This isn't just an event. This is your </tspan><tspan x="91.75" y="16.8">moment."</tspan></text>
  <text class="st7" transform="translate(31.44 488)"><tspan x="0" y="0">No weapon formed against you will succeed, and you will </tspan><tspan x="36.96" y="10.8">silence every voice raised to accuse you.</tspan></text>
  <text class="st1" transform="translate(131.2 520)"><tspan x="0" y="0">Isaiah 54:17</tspan></text>
</svg>`
} 