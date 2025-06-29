export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateEmailList = (emails: string): string[] => {
  if (!emails.trim()) return []
  
  return emails
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0)
    .filter(email => isValidEmail(email))
}

export const sanitizeSubject = (subject: string): string => {
  return subject
    .replace(/[\r\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 998) // RFC 5322 line length limit
}

export const sanitizeBody = (body: string): string => {
  return body
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
}

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Password must contain at least one letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
} 