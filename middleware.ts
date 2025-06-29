import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Add security headers
    const response = NextResponse.next()
    
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect dashboard and compose routes
        if (req.nextUrl.pathname.startsWith('/dashboard') || 
            req.nextUrl.pathname.startsWith('/compose')) {
          return !!token
        }
        
        // Protect API routes except auth and register
        if (req.nextUrl.pathname.startsWith('/api/')) {
          if (req.nextUrl.pathname.startsWith('/api/auth') ||
              req.nextUrl.pathname.startsWith('/api/register')) {
            return true
          }
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/compose/:path*',
    '/api/send/:path*',
    '/api/sent/:path*'
  ]
} 