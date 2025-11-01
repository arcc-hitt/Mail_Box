import { useEffect, useState } from 'react'
import { fetchUnreadCount } from '../services/mail'

export function useUnreadCount(email, token) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!email) return
      try {
        const c = await fetchUnreadCount(email, token)
        if (mounted) setCount(c)
      } catch (_) {}
    })()
    return () => { mounted = false }
  }, [email, token])

  useEffect(() => {
    const handler = (e) => {
      if (typeof e.detail?.delta === 'number') setCount((x) => Math.max(0, x + e.detail.delta))
      if (typeof e.detail?.count === 'number') setCount(e.detail.count)
    }
    window.addEventListener('mail:read-changed', handler)
    window.addEventListener('mail:unread-count', handler)
    return () => {
      window.removeEventListener('mail:read-changed', handler)
      window.removeEventListener('mail:unread-count', handler)
    }
  }, [])

  return { count, setCount }
}
