import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth, logout } from '../hooks/useAuth'
import { useUnreadCount } from '../hooks/useUnreadCount'

function HomeLayout() {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const userEmail = user?.email || ''
  const { count: unread, setCount: setUnread } = useUnreadCount(userEmail, token)

  useEffect(() => {
    if (!user && !token) navigate('/login', { replace: true })
  }, [user, token, navigate])

  const doLogout = async () => {
    await logout()
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
