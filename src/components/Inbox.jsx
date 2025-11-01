import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useInbox } from '../hooks/useInbox'

function Inbox() {
  const { user, token } = useAuth()
  const email = user?.email || ''
  const { items, loading, expandedId, openMessage, deleteMessage, unreadCount } = useInbox(email, token)

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
                      <div className="d-flex align-items-center gap-2">
                        <div className="small text-secondary">{new Date(m.createdAt).toLocaleString()}</div>
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={(e) => { e.stopPropagation(); deleteMessage(m.id) }}>Delete</button>
                      </div>
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
