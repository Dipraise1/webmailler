interface RateLimitEntry {
  count: number
  timestamp: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds
const MAX_EMAILS_PER_HOUR = 50 // Adjust based on your needs

export function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const userEntry = rateLimitMap.get(userId)

  if (!userEntry || (now - userEntry.timestamp) > RATE_LIMIT_WINDOW) {
    // First request or window expired
    rateLimitMap.set(userId, { count: 1, timestamp: now })
    return {
      allowed: true,
      remaining: MAX_EMAILS_PER_HOUR - 1,
      resetTime: now + RATE_LIMIT_WINDOW
    }
  }

  if (userEntry.count >= MAX_EMAILS_PER_HOUR) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: userEntry.timestamp + RATE_LIMIT_WINDOW
    }
  }

  // Increment count
  userEntry.count++
  return {
    allowed: true,
    remaining: MAX_EMAILS_PER_HOUR - userEntry.count,
    resetTime: userEntry.timestamp + RATE_LIMIT_WINDOW
  }
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  Array.from(rateLimitMap.entries()).forEach(([userId, entry]) => {
    if ((now - entry.timestamp) > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(userId)
    }
  })
}, RATE_LIMIT_WINDOW) // Run cleanup every hour 