import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSent } from '../hooks/useSent'

function Sent() {
  const { user, token } = useAuth()
  const email = user?.email || ''
  const { items, loading, deleteMessage } = useSent(email, token)

  if (loading) return <div className="text-secondary">Loading…</div>

  return (
    <div className="card shadow-sm">
      <div className="card-body p-3 p-md-4">
        <h5 className="mb-3">Sent</h5>
        {items.length === 0 ? (
          <div className="text-secondary">No sent messages.</div>
        ) : (
          <div className="list-group">
            {items.map((m) => (
              <div key={m.id} className="list-group-item list-group-item-action">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold">{m.subject || '(no subject)'}</div>
                    <div className="small text-secondary">To: {m.to}</div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="small text-secondary">{new Date(m.createdAt).toLocaleString()}</div>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteMessage(m.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Sent
