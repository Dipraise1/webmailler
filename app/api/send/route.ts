import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { smtpClient } from '@/lib/smtpClient'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'
import { isValidEmail, sanitizeSubject, sanitizeBody } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

      const { to, cc, bcc, subject, body } = await request.json()

  // Validate input
  if (!to || !subject || !body) {
    return NextResponse.json(
      { error: 'To, subject, and body are required' },
      { status: 400 }
    )
  }

  // Validate email addresses
  if (!isValidEmail(to)) {
    return NextResponse.json(
      { error: 'Invalid recipient email address' },
      { status: 400 }
    )
  }

  if (cc && !isValidEmail(cc)) {
    return NextResponse.json(
      { error: 'Invalid CC email address' },
      { status: 400 }
    )
  }

  if (bcc && !isValidEmail(bcc)) {
    return NextResponse.json(
      { error: 'Invalid BCC email address' },
      { status: 400 }
    )
  }

  // Check rate limit
  const rateLimitResult = checkRateLimit(session.user.id)
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded. Please try again later.',
        resetTime: rateLimitResult.resetTime
      },
      { status: 429 }
    )
  }

  // Sanitize input
  const sanitizedSubject = sanitizeSubject(subject)
  const sanitizedBody = sanitizeBody(body)

      // Send email using SMTP client
  const result = await smtpClient.sendEmail({
    to,
    cc,
    bcc,
    subject: sanitizedSubject,
    text: sanitizedBody,
  })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

      // Save sent email to database
  const sentMail = await prisma.sentMail.create({
    data: {
      userId: session.user.id,
      to,
      cc: cc || null,
      bcc: bcc || null,
      subject: sanitizedSubject,
      body: sanitizedBody,
      messageId: result.messageId,
      status: 'sent',
    }
  })

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      sentMail: {
        id: sentMail.id,
        to: sentMail.to,
        subject: sentMail.subject,
        sentAt: sentMail.sentAt,
      }
    })

  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 