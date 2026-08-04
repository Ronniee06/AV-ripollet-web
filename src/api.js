const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.detail || 'No se ha podido completar la solicitud')
  }
  return response.status === 204 ? null : response.json()
}

export const api = {
  events: (adminKey = '') => request(`/events${adminKey ? '?include_past=true&include_drafts=true' : ''}`, { headers: adminKey ? { 'X-Admin-Key': adminKey } : {} }),
  saveEvent: (event, adminKey) => request(event.id ? `/events/${event.id}` : '/events', {
    method: event.id ? 'PUT' : 'POST',
    headers: { 'X-Admin-Key': adminKey },
    body: JSON.stringify(event),
  }),
  deleteEvent: (id, adminKey) => request(`/events/${id}`, { method: 'DELETE', headers: { 'X-Admin-Key': adminKey } }),
  prayer: (payload) => request('/prayer-requests', { method: 'POST', body: JSON.stringify(payload) }),
}

