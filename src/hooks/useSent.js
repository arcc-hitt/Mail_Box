import { useEffect, useState } from 'react'
import { fetchSent, deleteSentMail } from '../services/mail'

export function useSent(email, token) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!email) { setItems([]); setLoading(false); return }
      setLoading(true)
      try {
        const data = await fetchSent(email, token)
        if (mounted) setItems(data)
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [email, token])

  const deleteMessage = async (id) => {
    try {
      await deleteSentMail(email, id, token)
      setItems((prev) => prev.filter((x) => x.id !== id))
    } catch (e) {
      console.error('Failed to delete', e)
      alert('Failed to delete message. Please try again.')
    }
  }

  return { items, loading, deleteMessage }
}
