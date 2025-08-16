export interface PassData {
  id: string
  passId?: string
  first_name: string
  last_name: string
  firstName?: string
  lastName?: string
  email: string
  phone_number: string
  heard_about: string
  verse_reference: string
  verse_text: string
  message_text: string
  theme: string
  passColor?: string
  photoUrl?: string | null
}

export interface PassColors {
  background: string
  text: string
  accent: string
}

const colorOptions = [
  { id: "dark-green", name: "Dark Green", bg: "#182b11" },
  { id: "dark-purple", name: "Dark Purple", bg: "#331A33" },
  { id: "midnight-blue", name: "Midnight Blue", bg: "#0f1419" },
  { id: "deep-burgundy", name: "Deep Burgundy", bg: "#4a1810" },
]

const getPassColors = (color: string): PassColors => {
  const option = colorOptions.find(opt => opt.id === color)
  return {
    background: option?.bg || "#182b11",
    text: "#ffffff",
    accent: "#22c55e"
  }
}

// For better email compatibility, we'll use the full URL to images
// This ensures they load properly in all email clients

export function generatePassHTML(passData: PassData, baseUrl: string): string {
  const colors = getPassColors(passData.passColor || passData.theme || "dark-green")
  const firstName = passData.firstName || passData.first_name || 'Attendee'
  const lastName = passData.lastName || passData.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim()
  const passId = passData.passId || passData.id
  const passUrl = `${baseUrl}/pass/${passId}`
  
  // Generate QR code using a reliable service
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(passUrl)}&format=png&bgcolor=FFFFFF&color=000000`
  
  const qrCodeHTML = `
    <img 
      src="${qrCodeImageUrl}" 
      alt="QR Code for ${passId}"
      style="
        width: 170px;
        height: 170px;
        display: block;
      "
    />
  `

  return `
    <div style="
      width: 320px;
      height: 568px;
      background-color: ${colors.background};
      position: relative;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0 auto;
      display: block;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    ">
      <!-- QR Code or Photo Area - Top Section -->
      <div style="
        position: absolute;
        top: 32px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 12px;
        border-radius: 16px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      ">
        ${passData.photoUrl ? `
          <div style="
            width: 170px;
            height: 170px;
            border-radius: 12px;
            overflow: hidden;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <img 
              src="${passData.photoUrl}" 
              alt="Attendee photo"
              style="
                width: 100%;
                height: 100%;
                object-fit: cover;
              "
            />
          </div>
        ` : qrCodeHTML}
      </div>

      <!-- Main Kairos Logo - Center -->
      <div style="
        position: absolute;
        top: 190px;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        padding: 0 16px;
        text-align: center;
      ">
        <div style="
          display: flex;
          justify-content: center;
          align-items: center;
        ">
          <img 
            src="${baseUrl}/images/kairos_PNG_UHD.png"
            alt="Kairos Logo"
            style="
              width: 240px;
              height: 120px;
              object-fit: contain;
              filter: drop-shadow(0 8px 16px rgba(0,0,0,0.4));
            "
          />
        </div>
      </div>

      <!-- Attendee Information - Left Side -->
      <div style="
        position: absolute;
        bottom: 200px;
        left: 16px;
      ">
        <h3 style="
          font-weight: bold;
          color: ${colors.text};
          font-size: 14px;
          margin: 0 0 4px 0;
          line-height: 1.2;
        ">
          ${fullName}
        </h3>
        <p style="
          font-style: italic;
          color: ${colors.text};
          font-size: 10px;
          opacity: 0.75;
          margin: 0;
        ">
          Attendee Name
        </p>
      </div>

      <!-- Pass ID - Right Side -->
      <div style="
        position: absolute;
        bottom: 200px;
        right: 16px;
        text-align: right;
      ">
        <h4 style="
          font-weight: bold;
          color: ${colors.text};
          font-size: 12px;
          margin: 0 0 4px 0;
          line-height: 1.2;
        ">
          ${passId}
        </h4>
        <p style="
          font-style: italic;
          color: ${colors.text};
          font-size: 8px;
          opacity: 0.75;
          margin: 0;
        ">
          PASS ID
        </p>
      </div>

      <!-- Main Quote -->
      <div style="
        position: absolute;
        bottom: 150px;
        left: 16px;
        right: 16px;
        text-align: center;
      ">
        <h2 style="
          font-weight: 800;
          font-style: italic;
          color: ${colors.text};
          font-size: 14px;
          line-height: 1.3;
          margin: 0;
        ">
          &ldquo;${passData.message_text}&rdquo;
        </h2>
      </div>

      <!-- Bible Verse from Database -->
      <div style="
        position: absolute;
        bottom: 50px;
        left: 16px;
        right: 16px;
        text-align: center;
      ">
        <p style="
          color: ${colors.text};
          font-size: 9px;
          margin: 0 0 4px 0;
          line-height: 1.4;
          opacity: 0.95;
        ">
          ${passData.verse_text}
        </p>
        <p style="
          font-style: italic;
          color: ${colors.text};
          font-size: 8px;
          opacity: 0.75;
          margin: 0;
        ">
          ${passData.verse_reference}
        </p>
      </div>

      <!-- Footer -->
      <div style="
        position: absolute;
        bottom: 8px;
        left: 16px;
        right: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div style="text-align: left;">
          <span style="
            color: ${colors.text};
            font-size: 8px;
            opacity: 0.7;
          ">Updated </span>
          <span style="
            color: ${colors.text};
            font-size: 8px;
            opacity: 0.9;
            font-weight: bold;
          ">August 16, 2025</span>
        </div>
        <div style="text-align: right;">
          <span style="
            color: ${colors.text};
            font-size: 8px;
            opacity: 0.7;
          ">WWW.1NRI.STORE</span>
        </div>
      </div>

      <!-- 1NRI Logo - Top Left -->
      <div style="
        position: absolute;
        top: 8px;
        left: 8px;
      ">
        <img 
          src="${baseUrl}/images/1NRI Logo - Fixed - Transparent (1).png"
          alt="1NRI Logo"
          style="
            width: 20px;
            height: 20px;
            object-fit: contain;
            opacity: 0.6;
          "
        />
      </div>
    </div>
  `
} 