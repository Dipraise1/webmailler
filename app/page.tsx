import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center mobile-container py-8">
      <div className="max-w-md w-full mobile-spacing">
        <div className="text-center">
          <h1 className="mobile-header font-bold text-gray-900 mb-2">
            Webmail App
          </h1>
          <p className="mobile-text text-gray-600 mb-6 sm:mb-8 px-4 sm:px-0">
            Professional email delivery with excellent inbox placement
          </p>
        </div>
        
        <div className="mobile-spacing px-4 sm:px-0">
          <Link href="/login" className="btn-primary w-full block text-center">
            Sign In
          </Link>
          <Link href="/register" className="btn-secondary w-full block text-center">
            Create Account
          </Link>
        </div>

        <div className="text-center text-xs sm:text-sm text-gray-500 px-4 sm:px-0">
          <p>Built with Next.js, NextAuth, and enterprise-grade email delivery</p>
        </div>
      </div>
    </div>
  )
} 