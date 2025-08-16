import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { passId, email, attendeeName, passHtml } = await request.json()

    if (!passId || !email || !attendeeName || !passHtml) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send email with HTML pass
    const { data, error } = await resend.emails.send({
      from: `Kairos Pass <${process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com'}>`,
      to: [email],
      subject: `Your Kairos Pass is ready, ${attendeeName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Kairos Pass is Ready</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #172C11;
              color: #FFFBF3;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background: #172C11;
              border-radius: 0;
              overflow: hidden;
            }
            .logo-header {
              background: #172C11;
              padding: 60px 40px 40px;
              text-align: center;
              border-bottom: 1px solid #333;
            }
            .logo-header img {
              max-width: 280px;
              height: auto;
              filter: brightness(1.2) contrast(1.1);
            }
            .content {
              padding: 60px 40px;
              text-align: center;
            }
            .greeting {
              font-size: 28px;
              font-weight: 700;
              margin: 0 0 20px 0;
              color: #FFFBF3;
              background: none;
              text-align: center;
            }
            .subtitle {
              font-size: 18px;
              font-weight: 600;
              margin: 0 0 30px 0;
              color: #FFFBF3;
              line-height: 1.4;
              background: none;
            }
            .main-copy {
              font-size: 16px;
              line-height: 1.6;
              margin: 0 0 40px 0;
              color: #FFFBF3;
              max-width: 480px;
              margin-left: auto;
              margin-right: auto;
            }
            .cta-button {
              display: inline-block;
              background: #FFFBF3;
              color: #1A1A1A;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              margin: 30px 0;
              transition: all 0.3s ease;
              box-shadow: 0 4px 12px rgba(23, 44, 17, 0.3);
            }
            .cta-button:hover {
              transform: translateY(-1px);
              box-shadow: 0 6px 16px rgba(23, 44, 17, 0.4);
            }
            .fun-message {
              background: #000;
              border: 1px solid #172C11;
              border-radius: 16px;
              padding: 30px;
              margin: 40px 0;
              text-align: center;
            }
            .fun-message h3 {
              font-size: 20px;
              font-weight: 600;
              margin: 0 0 15px 0;
              color: #FFFBF3;
              background: none;
            }
            .fun-message p {
              font-size: 14px;
              margin: 0 0 15px 0;
              color: #FFFBF3;
              line-height: 1.5;
            }
            .store-link {
              color: #FFFBF3;
              text-decoration: none;
              font-weight: 600;
              border-bottom: 1px solid #FFFBF3;
              transition: all 0.3s ease;
            }
            .store-link:hover {
              border-bottom-color: #172C11;
            }
            .footer {
              background: #000;
              padding: 30px;
              text-align: center;
              color: #FFFBF3;
              font-size: 12px;
              border-top: 1px solid #333;
            }
            .footer p {
              margin: 6px 0;
            }
            .footer a {
              color: #FFFBF3;
              text-decoration: none;
            }
            .social-proof {
              background: #172C11;
              border-radius: 8px;
              padding: 20px;
              margin: 30px 0;
              font-style: italic;
              color: #FFFBF3;
              font-size: 14px;
              border: 1px solid #000;
            }
            .unsubscribe {
              font-size: 11px;
              color: #999;
              margin-top: 20px;
            }
            .unsubscribe a {
              color: #999;
              text-decoration: underline;
            }
            @media (max-width: 600px) {
              .content {
                padding: 40px 20px;
              }
              .greeting {
                font-size: 24px;
              }
              .subtitle {
                font-size: 16px;
              }
              .cta-button {
                padding: 14px 28px;
                font-size: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="logo-header">
              <img 
                src="https://1-nri-pass-plum.vercel.app/images/kairos_PNG_UHD.png" 
                alt="Kairos"
                style="display: block; margin: 0 auto;"
              />
            </div>
            
            <div class="content">
              <h1 class="greeting">Hey ${attendeeName}!</h1>
              
              <p class="subtitle">Your Kairos pass is ready and waiting for you</p>
              
              <div class="main-copy">
                <p>Thanks for joining us at Kairos! Your presence made the event even more special. We hope you had an amazing time and we're excited to see you again.</p>
                
                <p>Your personalized pass is ready to view and share. Click below to access it.</p>
              </div>

              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://1-nri-pass-plum.vercel.app'}/pass/${passId}" class="cta-button">
                View My Pass
              </a>

              <div class="fun-message">
                <h3>Thank you for coming to Kairos!</h3>
                <p>
                  You experienced one of the most meaningful Christian events of the year. 
                  We hope you enjoyed the clothes, movie, and community.
                </p>
                <p>
                  Love what we do? Check out more at 
                  <a href="https://1nri.store/" class="store-link" target="_blank">1nri.store</a> 
                  for clothing and other products.
                </p>
              </div>

              <p style="font-size: 12px; color: #FFFBF3; margin-top: 40px;">
                Visit the website to screenshot your pass and share it on social media.
              </p>
            </div>
            
            <div class="footer">
              <p><strong>Kairos: A 1NRI Experience</strong></p>
              <p>August 16, 2025</p>
              <p>Questions? Contact us at <a href="https://1nri.store/">1nri.store</a></p>
              
              <div class="unsubscribe">
                <p>You received this email because you registered for Kairos.</p>
                <p>1NRI, Ghana | <a href="mailto:support@1nri.store">Contact Support</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: { emailId: data?.id }
    })

  } catch (error) {
    console.error('Send pass email error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 