import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  cc?: string
  bcc?: string
  subject: string
  text: string
  html?: string
  attachments?: any[]
}

interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  tls: {
    rejectUnauthorized: boolean
  }
}

class SMTPClient {
  private transporter: nodemailer.Transporter

  constructor() {
    // SMTP Configuration
    const smtpConfig: SMTPConfig = {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: parseInt(process.env.SMTP_PORT || '587') === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates for development
      }
    }

    this.transporter = nodemailer.createTransport(smtpConfig)
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Check if SMTP is configured
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('📧 SMTP not configured - simulating email send for development')
        return {
          success: true,
          messageId: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      }

      // Prepare email content
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        text: options.text,
        html: options.html || this.generateHTML(options.text),
        attachments: options.attachments,
        // Headers for better deliverability
        headers: {
          'X-Mailer': 'Webmail App v1.0',
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Importance': 'Normal',
          'Reply-To': process.env.EMAIL_FROM || process.env.SMTP_USER || '',
        }
      }

      const info = await this.transporter.sendMail(mailOptions)
      
      return {
        success: true,
        messageId: info.messageId
      }
    } catch (error) {
      console.error('SMTP Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private generateHTML(text: string): string {
    // Convert plain text to HTML with proper formatting
    const htmlBody = text
      .replace(/\n/g, '<br>')
      .replace(/\r/g, '')
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div>${htmlBody}</div>
          <div class="footer">
            <p>This email was sent from our webmail system.</p>
            <p>For Office 365 users, please check your inbox at <a href="https://outlook.office365.com">https://outlook.office365.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('📧 SMTP not configured - skipping connection verification')
        return true // Return true for development mode
      }
      await this.transporter.verify()
      return true
    } catch (error) {
      console.error('SMTP Connection Error:', error)
      return false
    }
  }
}

export const smtpClient = new SMTPClient() 