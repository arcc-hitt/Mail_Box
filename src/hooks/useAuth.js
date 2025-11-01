import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(auth.currentUser || null)
  const [loading, setLoading] = useState(!auth.currentUser)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''
  return { user, token, loading }
}

export async function logout() {
  try { await signOut(auth) } catch (_) {}
  if (typeof window !== 'undefined') localStorage.removeItem('authToken')
}
