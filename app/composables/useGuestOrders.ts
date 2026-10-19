const STORAGE_KEY = 'cct-guest-orders'
const NOTICE_KEY = 'cct-guest-notice'

export interface GuestOrderNotice {
  orderId: number
  email: string
  accountCreated: boolean
  emailSent: boolean
}

function readTokens(): Record<string, string> {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as unknown
    return parsed && typeof parsed === 'object' ? parsed as Record<string, string> : {}
  }
  catch {
    return {}
  }
}

export function useGuestOrders() {
  function tokenFor(orderId: number | string) {
    return readTokens()[String(orderId)] ?? null
  }

  function remember(orderId: number | string, token: string) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readTokens(), [String(orderId)]: token }))
  }

  function setNotice(notice: GuestOrderNotice) {
    sessionStorage.setItem(NOTICE_KEY, JSON.stringify(notice))
  }

  function takeNotice(orderId: number | string): GuestOrderNotice | null {
    try {
      const notice = JSON.parse(sessionStorage.getItem(NOTICE_KEY) || 'null') as GuestOrderNotice | null
      if (!notice || String(notice.orderId) !== String(orderId)) return null
      sessionStorage.removeItem(NOTICE_KEY)
      return notice
    }
    catch {
      return null
    }
  }

  return { tokenFor, remember, setNotice, takeNotice }
}
