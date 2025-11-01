import React, { useEffect, useState } from 'react'
import { fetchInbox } from '../services/mail'
import { auth } from '../firebase'

function Inbox() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''
  const email = auth.currentUser?.email || ''

  useEffect(() => {
    let mounted = true
    ;(async () => {
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

  if (loading) return <div className="text-secondary">Loading…</div>

  return (
    <div className="card shadow-sm">
      <div className="card-body p-3 p-md-4">
        <h5 className="mb-3">Inbox</h5>
        {items.length === 0 ? (
          <div className="text-secondary">No messages.</div>
        ) : (
          <div className="list-group">
            {items.map((m) => (
              <div key={m.id} className="list-group-item list-group-item-action">
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="fw-semibold">{m.subject || '(no subject)'}</div>
                    <div className="small text-secondary">From: {m.from}</div>
                  </div>
                  <div className="small text-secondary">{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Inbox
