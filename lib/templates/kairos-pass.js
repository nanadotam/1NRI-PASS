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

// Helper function to find SVG elements by tag and class (unused but kept for future use)
// const findElementByTagAndClass = (doc, tagName, className) => {
//   const elements = doc.getElementsByTagName(tagName)
//   for (let i = 0; i < elements.length; i++) {
//     if (elements[i].getAttribute('class') === className) {
//       return elements[i]
//     }
//   }
//   return null
// }

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

export const generateKairosPassTemplate = async (data) => {
  const {
    attendeeData,
    selectedColor = 'dark-green',
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

  const parser = new DOMParser()
  const svgDoc = parser.parseFromString(svgTemplate, 'text/xml')
  
  // Check if parsing was successful
  if (!svgDoc || !svgDoc.documentElement) {
    console.error('Failed to parse SVG template')
    throw new Error('Failed to parse SVG template')
  }

  // Update background color
  const backgroundElement = findElement(svgDoc, 'background')
  if (backgroundElement) {
    const colors = getPassColors(selectedColor)
    backgroundElement.setAttribute('fill', colors.background)
  }

  // Update attendee information
  const attendeeNameElement = findElement(svgDoc, 'attendee-name')
  if (attendeeNameElement) {
    attendeeNameElement.textContent = `${attendeeData.firstName || attendeeData.first_name} ${attendeeData.lastName || attendeeData.last_name}`
  }

  const passIdElement = findElement(svgDoc, 'pass-id')
  if (passIdElement) {
    passIdElement.textContent = attendeeData.passId || attendeeData.id
  }

  const messageElement = findElement(svgDoc, 'message-text')
  if (messageElement) {
    messageElement.textContent = attendeeData.message_text || "This isn't just an event. This is your moment."
  }

  const verseElement = findElement(svgDoc, 'verse-text')
  if (verseElement) {
    verseElement.textContent = attendeeData.verse_text || "No weapon formed against you will succeed, and you will silence every voice raised to accuse you."
  }

  const verseRefElement = findElement(svgDoc, 'verse-reference')
  if (verseRefElement) {
    verseRefElement.textContent = attendeeData.verse_reference || "Isaiah 54:17"
  }

  // Update photo/QR code area - matches the exact positioning from pass viewer
  if (displayPhoto) {
    const photoArea = findElement(svgDoc, 'photo-area')
    if (photoArea) {
      try {
        // Replace the placeholder with the actual photo
        const imageElement = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'image')
        imageElement.setAttribute('href', displayPhoto)
        imageElement.setAttribute('x', '270')
        imageElement.setAttribute('y', '108')
        imageElement.setAttribute('width', '540')
        imageElement.setAttribute('height', '540')
        imageElement.setAttribute('preserveAspectRatio', 'xMidYMid slice')
        
        // Clear existing content and add the image
        photoArea.innerHTML = ''
        photoArea.appendChild(imageElement)
      } catch (photoError) {
        console.error('Error adding photo to SVG:', photoError)
        // Fallback to QR code if photo fails
        const qrCodeSVG = generateQRCodeSVG(attendeeData.passId || attendeeData.id)
        photoArea.innerHTML = qrCodeSVG
      }
    }
  } else {
    // Generate QR code SVG - matches the 170x170 size from pass viewer
    const photoArea = findElement(svgDoc, 'photo-area')
    if (photoArea) {
      const qrCodeSVG = generateQRCodeSVG(attendeeData.passId || attendeeData.id)
      photoArea.innerHTML = qrCodeSVG
    }
  }

  // Update logos with base64 data - matches exact positioning from pass viewer
  try {
    const kairosLogoBase64 = await imageToBase64('/images/kairos_PNG_UHD.png')
    const nriLogoBase64 = await imageToBase64('/images/1NRI Logo - Fixed - Transparent (1).png')
    
    // Replace Kairos logo placeholder with actual image - matches top-[150px] positioning
    const logoArea = findElement(svgDoc, 'logo-area')
    if (logoArea && kairosLogoBase64) {
      const logoImage = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'image')
      logoImage.setAttribute('href', kairosLogoBase64)
      logoImage.setAttribute('x', '420')
      logoImage.setAttribute('y', '675')
      logoImage.setAttribute('width', '240')
      logoImage.setAttribute('height', '120')
      logoImage.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      
      logoArea.innerHTML = ''
      logoArea.appendChild(logoImage)
    }

    // Replace 1NRI logo placeholder with actual image - matches top-2 left-2 positioning
    const nriLogoArea = findElement(svgDoc, 'nri-logo')
    if (nriLogoArea && nriLogoBase64) {
      const nriImage = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'image')
      nriImage.setAttribute('href', nriLogoBase64)
      nriImage.setAttribute('x', '68')
      nriImage.setAttribute('y', '68')
      nriImage.setAttribute('width', '68')
      nriImage.setAttribute('height', '68')
      nriImage.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      
      nriLogoArea.innerHTML = ''
      nriLogoArea.appendChild(nriImage)
    }
  } catch (logoError) {
    console.error('Error updating logos:', logoError)
  }

  // Serialize the SVG back to string - use a Node.js compatible method
  let finalSVG = ''
  
  // Simple XML serialization for Node.js environment
  const serializeElement = (element) => {
    let result = ''
    
    if (element.nodeType === 1) { // Element node
      result += '<' + element.tagName
      
      // Add attributes
      if (element.attributes) {
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i]
          result += ' ' + attr.name + '="' + attr.value + '"'
        }
      }
      
      if (element.childNodes && element.childNodes.length > 0) {
        result += '>'
        for (let i = 0; i < element.childNodes.length; i++) {
          result += serializeElement(element.childNodes[i])
        }
        result += '</' + element.tagName + '>'
      } else {
        result += ' />'
      }
    } else if (element.nodeType === 3) { // Text node
      result += element.textContent || element.nodeValue || ''
    } else if (element.nodeType === 8) { // Comment node
      result += '<!--' + (element.textContent || element.nodeValue || '') + '-->'
    } else if (element.nodeType === 4) { // CDATA node
      result += '<![CDATA[' + (element.textContent || element.nodeValue || '') + ']]>'
    }
    
    return result
  }
  
  finalSVG = serializeElement(svgDoc.documentElement)
  
  // Add XML declaration and DOCTYPE
  finalSVG = '<?xml version="1.0" encoding="UTF-8"?>\n' + finalSVG

  console.log('✅ Kairos pass SVG generated successfully')
  return finalSVG
}

// Generate QR code SVG - matches the exact positioning and size from pass viewer
const generateQRCodeSVG = (passId) => {
  // This is a simple QR code representation
  // In production, you might want to use a proper QR code library
  return `
    <rect x="270" y="108" width="540" height="540" rx="36" ry="36" fill="white"/>
    <text x="540" y="378" text-anchor="middle" dy=".3em" font-family="JetBrains Mono" font-size="32" fill="#331A33">QR: ${passId}</text>
  `
}

// Create a default SVG template if none exists
const createDefaultSVGTemplate = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Google Fonts Import -->
    <style>
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&amp;family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&amp;display=swap');
      
      .background { fill: #331A33; }
      .attendee-name { font-family: 'JetBrains Mono', monospace; font-size: 54px; font-weight: 700; fill: white; }
      .attendee-label { font-family: 'JetBrains Mono', monospace; font-size: 36px; font-weight: 400; font-style: italic; fill: white; opacity: 0.75; }
      .pass-id { font-family: 'JetBrains Mono', monospace; font-size: 48px; font-weight: 700; fill: white; }
      .pass-id-label { font-family: 'JetBrains Mono', monospace; font-size: 36px; font-weight: 400; font-style: italic; fill: white; opacity: 0.75; }
      .message-text { font-family: 'Poppins', sans-serif; font-size: 54px; font-weight: 800; font-style: italic; fill: white; }
      .verse-text { font-family: 'Poppins', sans-serif; font-size: 40px; font-weight: 400; fill: white; opacity: 0.95; }
      .verse-reference { font-family: 'JetBrains Mono', monospace; font-size: 36px; font-weight: 400; font-style: italic; fill: white; opacity: 0.75; }
      .footer-text { font-family: 'Poppins', sans-serif; font-size: 36px; font-weight: 400; fill: white; opacity: 0.7; }
      .footer-bold { font-family: 'Poppins', sans-serif; font-size: 36px; font-weight: 600; fill: white; opacity: 0.9; }
      .nri-text { font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: 600; fill: white; opacity: 0.6; }
    </style>
  </defs>
  
  <!-- Background with rounded corners - matches the rounded-2xl class -->
  <rect class="background" width="1080" height="1920" rx="48" ry="48"/>
  
  <!-- 1NRI Logo - Top Left - matches top-2 left-2 positioning -->
  <g class="nri-logo" opacity="0.6">
    <text x="68" y="68" class="nri-text">INRI</text>
  </g>
  
  <!-- Photo/QR Code Area - matches top-8 positioning and 170x170 size -->
  <g class="photo-area">
    <!-- White background with rounded corners - matches bg-white p-3 rounded-2xl -->
    <rect x="270" y="108" width="540" height="540" rx="36" ry="36" fill="white"/>
    <!-- Placeholder text - will be replaced by actual photo or QR code -->
    <text x="540" y="378" text-anchor="middle" dy=".3em" font-family="JetBrains Mono" font-size="32" fill="#331A33">Photo/QR Code</text>
  </g>
  
  <!-- Kairos Logo - matches top-[150px] positioning and 240x120 size -->
  <g class="logo-area">
    <!-- Logo placeholder - will be replaced by actual image -->
    <rect x="420" y="675" width="240" height="120" fill="transparent"/>
    <text x="540" y="735" text-anchor="middle" font-family="Poppins" font-size="48" font-weight="900" fill="#D4AF37">KAIROS</text>
  </g>
  
  <!-- Attendee Information - Left Side - matches bottom-[200px] left-4 -->
  <g class="attendee-info">
    <text class="attendee-name" x="108" y="1080">Attendee Name</text>
    <text class="attendee-label" x="108" y="1134">Attendee Name</text>
  </g>
  
  <!-- Pass ID - Right Side - matches bottom-[200px] right-4 -->
  <g class="pass-id-info">
    <text class="pass-id" x="972" y="1080" text-anchor="end">PASS ID</text>
    <text class="pass-id-label" x="972" y="1134" text-anchor="end">PASS ID</text>
  </g>
  
  <!-- Message Text - matches bottom-[150px] positioning -->
  <text class="message-text" x="540" y="1215" text-anchor="middle">"This isn't just an event. This is your moment."</text>
  
  <!-- Bible Verse - matches bottom-[50px] positioning -->
  <g class="verse-area">
    <text class="verse-text" x="540" y="1350" text-anchor="middle">No weapon formed against you will succeed, and you will silence every voice raised to accuse you.</text>
    <text class="verse-reference" x="540" y="1404" text-anchor="middle">Isaiah 54:17</text>
  </g>
  
  <!-- Footer - matches bottom-2 positioning -->
  <g class="footer">
    <text class="footer-text" x="108" y="1836">Updated <tspan class="footer-bold">August 16, 2025</tspan></text>
    <text class="footer-text" x="972" y="1836" text-anchor="end">WWW.1NRI.STORE</text>
  </g>
</svg>`
} 