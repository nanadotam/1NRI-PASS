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

// Helper function to find SVG elements by tag and class
const findElementByTagAndClass = (doc, tagName, className) => {
  const elements = doc.getElementsByTagName(tagName)
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].getAttribute && elements[i].getAttribute('class') === className) {
      return elements[i]
    }
  }
  return null
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

  // Update background color - find the background rect (st10 class)
  const backgroundElement = findElement(svgDoc, 'st10')
  if (backgroundElement) {
    const colors = getPassColors(selectedColor)
    backgroundElement.setAttribute('fill', colors.background)
  }

  // Update attendee information - find text elements with st4 and st6 classes
  const attendeeNameElements = svgDoc.getElementsByClassName('st4')
  if (attendeeNameElements.length > 0) {
    // First st4 element is the attendee name
    attendeeNameElements[0].textContent = `${attendeeData.firstName || attendeeData.first_name} ${attendeeData.lastName || attendeeData.last_name}`
  }

  // Find pass ID elements (st3 class)
  const passIdElements = svgDoc.getElementsByClassName('st3')
  if (passIdElements.length > 0) {
    // First st3 element is the pass ID
    passIdElements[0].textContent = attendeeData.passId || attendeeData.id
  }

  // Update message text - find st9 class (Poppins-ExtraBoldItalic)
  const messageElements = svgDoc.getElementsByClassName('st9')
  if (messageElements.length > 0) {
    messageElements[0].textContent = attendeeData.message_text || "This isn't just an event. This is your moment."
  }

  // Update verse text - find st7 class (Poppins-Regular)
  const verseElements = svgDoc.getElementsByClassName('st7')
  if (verseElements.length > 0) {
    verseElements[0].textContent = attendeeData.verse_text || "No weapon formed against you will succeed, and you will silence every voice raised to accuse you."
  }

  // Update verse reference - find st1 class (JetBrainsMono-SemiBoldItalic)
  const verseRefElements = svgDoc.getElementsByClassName('st1')
  if (verseRefElements.length > 0) {
    verseRefElements[0].textContent = attendeeData.verse_reference || "Isaiah 54:17"
  }

  // Update photo/QR code area - find the white rect (st8 class) and replace with photo or QR code
  if (displayPhoto) {
    // Find the photo area rect (st8 class)
    const photoAreaRect = findElement(svgDoc, 'st8')
    if (photoAreaRect) {
      try {
        // Create a new group to hold the photo
        const photoGroup = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g')
        photoGroup.setAttribute('class', 'photo-area')
        
        // Add the photo image
        const imageElement = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'image')
        imageElement.setAttribute('href', displayPhoto)
        imageElement.setAttribute('x', '56.67')
        imageElement.setAttribute('y', '34.87')
        imageElement.setAttribute('width', '206.67')
        imageElement.setAttribute('height', '206.67')
        imageElement.setAttribute('preserveAspectRatio', 'xMidYMid slice')
        
        photoGroup.appendChild(imageElement)
        
        // Replace the rect with the photo group
        photoAreaRect.parentNode.replaceChild(photoGroup, photoAreaRect)
      } catch (photoError) {
        console.error('Error adding photo to SVG:', photoError)
        // Fallback to QR code if photo fails
        const qrCodeSVG = generateQRCodeSVG()
        photoAreaRect.parentNode.replaceChild(qrCodeSVG, photoAreaRect)
      }
    }
  } else {
    // Generate QR code SVG - replace the white rect (st8 class)
    const photoAreaRect = findElement(svgDoc, 'st8')
    if (photoAreaRect) {
      const qrCodeSVG = generateQRCodeSVG(attendeeData.passId || attendeeData.id)
      photoAreaRect.parentNode.replaceChild(qrCodeSVG, photoAreaRect)
    }
  }

  // Add logos - we need to insert them into the SVG
  try {
    const kairosLogoBase64 = await imageToBase64('/images/kairos_PNG_UHD.png')
    const nriLogoBase64 = await imageToBase64('/images/1NRI Logo - Fixed - Transparent (1).png')
    
    // Add Kairos logo - insert after the photo area
    if (kairosLogoBase64) {
      const kairosLogo = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'image')
      kairosLogo.setAttribute('href', kairosLogoBase64)
      kairosLogo.setAttribute('x', '40')
      kairosLogo.setAttribute('y', '190')
      kairosLogo.setAttribute('width', '240')
      kairosLogo.setAttribute('height', '120')
      kairosLogo.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      kairosLogo.setAttribute('class', 'kairos-logo')
      
      // Insert after the background rect
      const backgroundRect = findElement(svgDoc, 'st10')
      if (backgroundRect && backgroundRect.parentNode) {
        backgroundRect.parentNode.insertBefore(kairosLogo, backgroundRect.nextSibling)
      }
    }

    // Add 1NRI logo - insert at the top left
    if (nriLogoBase64) {
      const nriLogo = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'image')
      nriLogo.setAttribute('href', nriLogoBase64)
      nriLogo.setAttribute('x', '8')
      nriLogo.setAttribute('y', '8')
      nriLogo.setAttribute('width', '20')
      nriLogo.setAttribute('height', '20')
      nriLogo.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      nriLogo.setAttribute('class', 'nri-logo')
      nriLogo.setAttribute('opacity', '0.6')
      
      // Insert after the background rect
      const backgroundRect = findElement(svgDoc, 'st10')
      if (backgroundRect && backgroundRect.parentNode) {
        backgroundRect.parentNode.insertBefore(nriLogo, backgroundRect.nextSibling)
      }
    }
  } catch (logoError) {
    console.error('Error updating logos:', logoError)
  }

  // Serialize the SVG back to string
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
  
  // Add XML declaration
  finalSVG = '<?xml version="1.0" encoding="UTF-8"?>\n' + finalSVG

  console.log('✅ Kairos pass SVG generated successfully')
  return finalSVG
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
      .st0, .st1, .st2, .st3, .st4, .st5, .st6 {
        isolation: isolate;
      }
      .st0, .st2 { opacity: .7; }
      .st7, .st1, .st2, .st3, .st8, .st9, .st4, .st5, .st6 { fill: #fff; }
      .st7, .st2 { font-family: Poppins-Regular, Poppins; }
      .st7, .st6 { font-size: 9px; }
      .st1 { font-family: JetBrainsMono-SemiBoldItalic, 'JetBrains Mono'; }
      .st1, .st2, .st5 { font-size: 8px; }
      .st1, .st9, .st6 { font-style: italic; }
      .st1, .st5 { font-weight: 600; }
      .st1, .st6 { opacity: .75; }
      .st3 { font-size: 12px; }
      .st3, .st9, .st4 { font-weight: 700; }
      .st3, .st4 { font-family: JetBrainsMono-Bold, 'JetBrains Mono'; }
      .st10 { fill: #331a33; }
      .st9 { font-family: Poppins-ExtraBoldItalic, Poppins; }
      .st9, .st4 { font-size: 14px; }
      .st5 { font-family: Poppins-SemiBold, Poppins; opacity: .9; }
      .st6 { font-family: JetBrainsMono-Italic, 'JetBrains Mono'; }
    </style>
  </defs>
  
  <rect class="st10" width="320" height="568"/>
  <rect class="st8" x="56.67" y="34.87" width="206.67" height="206.67" rx="16" ry="16"/>
  
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