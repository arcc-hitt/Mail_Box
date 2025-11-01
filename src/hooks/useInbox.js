import { useEffect, useMemo, useState } from 'react'
import { fetchInbox, markAsRead, deleteInboxMail } from '../services/mail'

export function useInbox(email, token) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!email) { setItems([]); setLoading(false); return }
      setLoading(true)
      try {
        const data = await fetchInbox(email, token)
        if (mounted) setItems(data)
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [email, token])

  const unreadCount = useMemo(() => items.filter((m) => !m.read).length, [items])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('mail:unread-count', { detail: { count: unreadCount } }))
  }, [unreadCount])

  const openMessage = async (id) => {
    setExpandedId((cur) => (cur === id ? null : id))
    const idx = items.findIndex((x) => x.id === id)
    if (idx >= 0 && !items[idx].read) {
      try {
        await markAsRead(email, id, token)
        setItems((prev) => prev.map((x) => (x.id === id ? { ...x, read: true } : x)))
        window.dispatchEvent(new CustomEvent('mail:read-changed', { detail: { delta: -1 } }))
      } catch (e) {
        console.error('Failed to mark as read', e)
      }
    }
  }

  const deleteMessage = async (id) => {
    const msg = items.find((x) => x.id === id)
    try {
      await deleteInboxMail(email, id, token)
      setItems((prev) => prev.filter((x) => x.id !== id))
      if (msg && !msg.read) {
        window.dispatchEvent(new CustomEvent('mail:read-changed', { detail: { delta: -1 } }))
      }
    } catch (e) {
      console.error('Failed to delete message', e)
      alert('Failed to delete message. Please try again.')
    }
  }

  return { items, loading, expandedId, openMessage, deleteMessage, unreadCount }
}
