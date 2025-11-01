import React, { useEffect, useMemo, useState } from 'react'
import { fetchInbox, markAsRead } from '../services/mail'
import { auth } from '../firebase'

function Inbox() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
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

  const unreadCount = useMemo(() => items.filter((m) => !m.read).length, [items])

  useEffect(() => {
    // Broadcast unread count for sidebar badge
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

  if (loading) return <div className="text-secondary">Loading…</div>

  return (
    <div className="card shadow-sm">
      <div className="card-body p-3 p-md-4">
        <h5 className="mb-3">Inbox {unreadCount > 0 && (<span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle">{unreadCount}</span>)}</h5>
        {items.length === 0 ? (
          <div className="text-secondary">No messages.</div>
        ) : (
          <div className="list-group">
            {items.map((m) => {
              const isOpen = expandedId === m.id
              return (
                <div key={m.id} className="list-group-item list-group-item-action">
                  <button className="btn btn-link text-decoration-none w-100 text-start p-0" onClick={() => openMessage(m.id)}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          {!m.read && <span className="mail-dot" aria-label="unread" />}
                          <span className="fw-semibold">{m.subject || '(no subject)'}</span>
                        </div>
                        <div className="small text-secondary">From: {m.from}</div>
                      </div>
                      <div className="small text-secondary">{new Date(m.createdAt).toLocaleString()}</div>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="mt-2 p-3 border rounded bg-light-subtle">
                      {/* render HTML body */}
                      <div dangerouslySetInnerHTML={{ __html: m.html || '<p>(No content)</p>' }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Inbox
