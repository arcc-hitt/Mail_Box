import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import { fetchUnreadCount } from '../services/mail'

function HomeLayout() {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState('')
  const [unread, setUnread] = useState(0)
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUserEmail(u?.email || '')
      if (!u && !localStorage.getItem('authToken')) {
        navigate('/login', { replace: true })
      }
      if (u) {
        try {
          const cnt = await fetchUnreadCount(u.email, token)
          setUnread(cnt)
        } catch (_) {}
      }
    })
    return () => unsub()
  }, [navigate])

  useEffect(() => {
    const handler = (e) => {
      const delta = e.detail?.delta
      if (typeof delta === 'number') setUnread((x) => Math.max(0, x + delta))
      if (typeof e.detail?.count === 'number') setUnread(e.detail.count)
    }
    window.addEventListener('mail:read-changed', handler)
    window.addEventListener('mail:unread-count', handler)
    return () => {
      window.removeEventListener('mail:read-changed', handler)
      window.removeEventListener('mail:unread-count', handler)
    }
  }, [])

  const doLogout = async () => {
    try { await signOut(auth) } catch (_) {}
    localStorage.removeItem('authToken')
    navigate('/login', { replace: true })
  }

  return (
    <div className="container-fluid py-3">
      <div className="row">
        <aside className="col-12 col-md-3 col-lg-2 mb-3 mb-md-0">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="mb-3">
                <div className="small text-secondary">Signed in as</div>
                <div className="fw-semibold">{userEmail || '—'}</div>
              </div>
              <div className="list-group">
                <NavLink to="/home/inbox" className={({isActive}) => `d-flex justify-content-between align-items-center list-group-item list-group-item-action ${isActive ? 'active' : ''}`}>
                  <span>Inbox</span>
                  <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle">{unread}</span>
                </NavLink>
                <NavLink to="/home/compose" className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}>Compose</NavLink>
                <NavLink to="/home/sent" className={({isActive}) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}>Sent</NavLink>
                <button type="button" className="list-group-item list-group-item-action text-start" onClick={doLogout}>Logout</button>
              </div>
            </div>
          </div>
        </aside>

        <main className="col-12 col-md-9 col-lg-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default HomeLayout
