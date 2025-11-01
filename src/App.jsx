import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './components/Signup'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import HomeLayout from './components/HomeLayout'
import Inbox from './components/Inbox'
import Compose from './components/Compose'
import Sent from './components/Sent'

function App() {
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('authToken')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/home" element={<HomeLayout />}>
          <Route path="inbox" element={<Inbox />} />
          <Route path="compose" element={<Compose />} />
          <Route path="sent" element={<Sent />} />
          <Route index element={<Navigate to="inbox" replace />} />
        </Route>
        <Route path="/" element={<Navigate to={hasToken ? '/home/inbox' : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
