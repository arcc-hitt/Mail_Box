// Mail service using Firebase Realtime Database REST API
// Requires VITE_FIREBASE_DATABASE_URL and an ID token (authToken) for authenticated requests.

const BASE_URL = import.meta.env.VITE_FIREBASE_DATABASE_URL

function sanitizeEmail(email) {
  // Firebase keys cannot contain '.', '#', '$', '[', or ']'
  return (email || '').trim().toLowerCase().replaceAll('.', ',')
}

async function rest(path, method = 'GET', body, token) {
  const url = `${BASE_URL}${path}.json${token ? `?auth=${token}` : ''}`
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Firebase REST error ${res.status}: ${text}`)
  }
  return res.json()
}

export async function sendMail({ from, to, subject, html, token }) {
  const senderKey = sanitizeEmail(from)
  const receiverKey = sanitizeEmail(to)
  const payload = {
    from,
    to,
    subject,
    html,
    createdAt: new Date().toISOString(),
    read: false,
  }

  // Post to receiver inbox and sender sentbox. Each POST generates its own unique key.
  const [inboxRes, sentRes] = await Promise.all([
    rest(`/userInbox/${receiverKey}`, 'POST', payload, token),
    rest(`/userSent/${senderKey}`, 'POST', payload, token),
  ])
  return { inboxId: inboxRes?.name, sentId: sentRes?.name }
}

export async function fetchInbox(email, token) {
  const key = sanitizeEmail(email)
  const data = await rest(`/userInbox/${key}`, 'GET', undefined, token)
  // Convert object map to array sorted by createdAt desc
  return Object.entries(data || {}).map(([id, v]) => ({ id, ...v })).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
}

export async function fetchSent(email, token) {
  const key = sanitizeEmail(email)
  const data = await rest(`/userSent/${key}`, 'GET', undefined, token)
  return Object.entries(data || {}).map(([id, v]) => ({ id, ...v })).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
}

export async function markAsRead(email, messageId, token) {
  const key = sanitizeEmail(email)
  const patch = { read: true, readAt: new Date().toISOString() }
  return rest(`/userInbox/${key}/${messageId}`, 'PATCH', patch, token)
}

export async function fetchUnreadCount(email, token) {
  const all = await fetchInbox(email, token)
  return all.filter((m) => !m.read).length
}

export async function deleteInboxMail(email, messageId, token) {
  const key = sanitizeEmail(email)
  return rest(`/userInbox/${key}/${messageId}`, 'DELETE', undefined, token)
}

export async function deleteSentMail(email, messageId, token) {
  const key = sanitizeEmail(email)
  return rest(`/userSent/${key}/${messageId}`, 'DELETE', undefined, token)
}

export { sanitizeEmail }
