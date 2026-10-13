import { toast } from 'sonner'

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

// Password validation
export const isValidPassword = (password) => {
  return password && password.length >= 6
}

// Rate Limiter class
export class LoginRateLimiter {
  constructor(maxAttempts = 3, blockDuration = 5 * 60 * 1000) {
    this.maxAttempts = maxAttempts
    this.blockDuration = blockDuration
    this.storageKey = 'login_rate_limit'
  }

  check() {
    try {
      const data = sessionStorage.getItem(this.storageKey)
      if (!data) {
        return { attempts: 0, isBlocked: false, waitSeconds: 0 }
      }

      const { attempts, blockedUntil } = JSON.parse(data)
      const now = Date.now()

      if (blockedUntil && now >= blockedUntil) {
        sessionStorage.removeItem(this.storageKey)
        return { attempts: 0, isBlocked: false, waitSeconds: 0 }
      }

      const isBlocked = blockedUntil && now < blockedUntil
      const waitSeconds = isBlocked ? Math.ceil((blockedUntil - now) / 1000) : 0

      return { attempts: attempts || 0, isBlocked, waitSeconds }
    } catch {
      toast.error('Erro ao verificar limite de tentativas de login.')
      return { attempts: 0, isBlocked: false, waitSeconds: 0 }
    }
  }

  recordAttempt() {
    try {
      const current = this.check()

      if (current.isBlocked) {
        return current
      }

      const newAttempts = current.attempts + 1
      const now = Date.now()
      const blockedUntil = newAttempts >= this.maxAttempts ? now + this.blockDuration : null

      const newData = {
        attempts: newAttempts,
        blockedUntil,
        firstAttempt: now,
      }

      sessionStorage.setItem(this.storageKey, JSON.stringify(newData))

      return {
        attempts: newAttempts,
        isBlocked: !!blockedUntil,
        waitSeconds: blockedUntil ? Math.ceil((blockedUntil - now) / 1000) : 0,
      }
    } catch {
      toast.error('Erro ao registrar tentativa de login.')
      return { attempts: 1, isBlocked: false, waitSeconds: 0 }
    }
  }

  reset() {
    try {
      sessionStorage.removeItem(this.storageKey)
    } catch {
      toast.error('Erro ao resetar limite de tentativas de login.')
    }
  }
}