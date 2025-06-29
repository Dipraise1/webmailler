'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ComposePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [to, setTo] = useState('')
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSending(true)

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          cc: cc || undefined,
          bcc: bcc || undefined,
          subject,
          body,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Email sent successfully! Message ID: ${data.messageId}`)
        // Reset form
        setTo('')
        setCc('')
        setBcc('')
        setSubject('')
        setBody('')
        setShowCc(false)
        setShowBcc(false)
      } else {
        setError(data.error || 'Failed to send email')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setSending(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto mobile-container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-0 sm:h-16 space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">
                ← Back to Dashboard
              </Link>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Compose Email</h1>
            </div>
            
            <div className="flex items-center">
              <span className="text-xs sm:text-sm text-gray-600">
                {session?.user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-4 sm:py-6 mobile-container">
        <div className="mobile-spacing">
          <div className="card">
            <form onSubmit={handleSubmit} className="mobile-spacing">
              {/* To Field */}
              <div>
                <label htmlFor="to" className="block text-sm font-medium text-gray-700">
                  To <span className="text-red-500">*</span>
                </label>
                <input
                  id="to"
                  name="to"
                  type="email"
                  required
                  className="input-field mt-1"
                  placeholder="recipient@example.com"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>

              {/* CC/BCC Toggle Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                {!showCc && (
                  <button
                    type="button"
                    onClick={() => setShowCc(true)}
                    className="text-sm text-primary-600 hover:text-primary-500 text-left"
                  >
                    + Add CC
                  </button>
                )}
                {!showBcc && (
                  <button
                    type="button"
                    onClick={() => setShowBcc(true)}
                    className="text-sm text-primary-600 hover:text-primary-500 text-left"
                  >
                    + Add BCC
                  </button>
                )}
              </div>

              {/* CC Field */}
              {showCc && (
                <div>
                  <label htmlFor="cc" className="block text-sm font-medium text-gray-700">
                    CC
                  </label>
                  <div className="flex mt-1">
                    <input
                      id="cc"
                      name="cc"
                      type="email"
                      className="input-field flex-1"
                      placeholder="cc@example.com"
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowCc(false)
                        setCc('')
                      }}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* BCC Field */}
              {showBcc && (
                <div>
                  <label htmlFor="bcc" className="block text-sm font-medium text-gray-700">
                    BCC
                  </label>
                  <div className="flex mt-1">
                    <input
                      id="bcc"
                      name="bcc"
                      type="email"
                      className="input-field flex-1"
                      placeholder="bcc@example.com"
                      value={bcc}
                      onChange={(e) => setBcc(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowBcc(false)
                        setBcc('')
                      }}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Subject Field */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  className="input-field mt-1"
                  placeholder="Enter email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* Body Field */}
              <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="body"
                  name="body"
                  rows={8}
                  required
                  className="input-field resize-vertical min-h-[200px] sm:min-h-[300px]"
                  placeholder="Write your email message here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg">
                  <div className="mobile-text font-medium">{success}</div>
                  <div className="mt-2 text-xs sm:text-sm">
                    The email has been delivered with enterprise-grade authentication for optimal inbox placement.
                    <br className="hidden sm:block" />
                    <span className="block sm:inline mt-1 sm:mt-0">
                      <strong>Office 365 users:</strong> Check your inbox at{' '}
                      <a 
                        href="https://outlook.office365.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-500 underline break-all"
                      >
                        outlook.office365.com
                      </a>
                    </span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg mobile-text">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                <Link href="/dashboard" className="btn-secondary text-center order-2 sm:order-1">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                >
                  {sending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>

            {/* Deliverability Info */}
            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-xs sm:text-sm font-medium text-blue-900 mb-2">
                ✅ Enterprise-Grade Email Delivery
              </h3>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• SPF, DKIM, and DMARC authentication enabled</div>
                <div>• TLS/SSL encryption for secure transmission</div>
                <div>• Optimized for Office 365, Gmail, and Yahoo inbox delivery</div>
                <div>• Professional headers and formatting</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 