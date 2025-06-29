import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Fetch sent emails for the user
    const sentMails = await prisma.sentMail.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        sentAt: 'desc'
      },
      skip,
      take: limit,
      select: {
        id: true,
        to: true,
        cc: true,
        bcc: true,
        subject: true,
        body: true,
        status: true,
        sentAt: true,
        messageId: true,
      }
    })

    // Get total count for pagination
    const total = await prisma.sentMail.count({
      where: {
        userId: session.user.id
      }
    })

    return NextResponse.json({
      emails: sentMails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Fetch sent emails error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 