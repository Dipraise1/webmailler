'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SentMail {
  id: string
  to: string
  cc?: string
  bcc?: string
  subject: string
  body: string
  status: string
  sentAt: string
  messageId?: string
}

interface SentMailsResponse {
  emails: SentMail[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [emails, setEmails] = useState<SentMail[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchSentEmails()
    }
  }, [status, router])

  const fetchSentEmails = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sent?page=${page}&limit=20`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch emails')
      }

      const data: SentMailsResponse = await response.json()
      setEmails(data.emails)
      setPagination(data.pagination)
    } catch (err) {
      setError('Failed to load sent emails')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto mobile-container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-0 sm:h-16 space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Webmail Dashboard</h1>
            </div>
            
            <div className="mobile-nav w-full sm:w-auto">
              <span className="text-xs sm:text-sm text-gray-600 order-last sm:order-first">
                Welcome, {session.user?.email}
              </span>
              <Link href="/compose" className="btn-primary text-center">
                Compose Email
              </Link>
              <button
                onClick={handleSignOut}
                className="btn-secondary text-center"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 mobile-container">
        <div className="mobile-spacing">
          <div className="card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">
                Sent Emails ({pagination.total})
              </h2>
              <Link href="/compose" className="btn-primary w-full sm:w-auto text-center">
                Send New Email
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading sent emails...</div>
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">No emails sent yet</div>
                <Link href="/compose" className="btn-primary">
                  Send your first email
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden sm:block overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sent At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {emails.map((email) => (
                        <tr key={email.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {email.to}
                            {email.cc && (
                              <div className="text-xs text-gray-500">CC: {email.cc}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {email.subject}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              email.status === 'sent' 
                                ? 'bg-green-100 text-green-800'
                                : email.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {email.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(email.sentAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden space-y-3">
                  {emails.map((email) => (
                    <div key={email.id} className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            To: {email.to}
                          </p>
                          {email.cc && (
                            <p className="text-xs text-gray-500 truncate">CC: {email.cc}</p>
                          )}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          email.status === 'sent' 
                            ? 'bg-green-100 text-green-800'
                            : email.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {email.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 font-medium">
                        {email.subject}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(email.sentAt)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-6 py-3 border-t border-gray-200 space-y-2 sm:space-y-0">
                    <div className="text-xs sm:text-sm text-gray-700">
                      Page {pagination.page} of {pagination.pages}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => fetchSentEmails(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => fetchSentEmails(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 