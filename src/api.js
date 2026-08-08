const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const CSRF_KEY = 'av-admin-csrf'

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const method = (options.method || 'GET').toUpperCase()
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = sessionStorage.getItem(CSRF_KEY)
    if (csrf) headers['X-CSRF-Token'] = csrf
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    if (response.status === 401) sessionStorage.removeItem(CSRF_KEY)
    throw new Error(data.detail || 'No se ha podido completar la solicitud')
  }
  return response.status === 204 ? null : response.json()
}

async function ensureCsrf() {
  if (sessionStorage.getItem(CSRF_KEY)) return
  const data = await request('/auth/csrf')
  sessionStorage.setItem(CSRF_KEY, data.csrf_token)
}

async function authenticatedWrite(path, options) {
  await ensureCsrf()
  return request(path, options)
}

export const api = {
  events: () => request('/events'),
  registerForEvent: (id, payload) => request(`/events/${id}/registrations`, { method: 'POST', body: JSON.stringify(payload) }),
  prayer: (payload) => request('/prayer-requests', { method: 'POST', body: JSON.stringify(payload) }),
  subscribeNewsletter: (payload) => request('/newsletter/subscribe', { method: 'POST', body: JSON.stringify(payload) }),

  login: async (email, password) => {
    const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    sessionStorage.setItem(CSRF_KEY, data.csrf_token)
    return data.user
  },
  me: () => request('/auth/me'),
  logout: async () => {
    await request('/auth/logout', { method: 'POST' })
    sessionStorage.removeItem(CSRF_KEY)
  },

  adminEvents: () => request('/admin/events'),
  saveEvent: (event) => authenticatedWrite(event.id ? `/events/${event.id}` : '/events', {
    method: event.id ? 'PUT' : 'POST',
    body: JSON.stringify(event),
  }),
  deleteEvent: (id) => authenticatedWrite(`/events/${id}`, { method: 'DELETE' }),

  registrations: (eventId = '') => request(`/admin/registrations${eventId ? `?event_id=${eventId}` : ''}`),
  updateRegistration: (id, changes) => authenticatedWrite(`/admin/registrations/${id}`, {
    method: 'PATCH', body: JSON.stringify(changes),
  }),

  users: () => request('/admin/users'),
  createUser: (payload) => authenticatedWrite('/admin/users', { method: 'POST', body: JSON.stringify(payload) }),
  updateUser: (id, payload) => authenticatedWrite(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteUser: (id) => authenticatedWrite(`/admin/users/${id}`, { method: 'DELETE' }),

  newsletterSubscribers: () => request('/admin/newsletter'),
  updateNewsletterSubscriber: (id, status) => authenticatedWrite(`/admin/newsletter/${id}?status_value=${encodeURIComponent(status)}`, { method: 'PATCH' }),
  newsletterCampaigns: () => request('/admin/newsletter/campaigns'),
  newsletterProviderStatus: () => request('/admin/newsletter/provider-status'),
  saveNewsletterCampaign: (id, payload) => authenticatedWrite(id ? `/admin/newsletter/campaigns/${id}` : '/admin/newsletter/campaigns', {
    method: id ? 'PUT' : 'POST', body: JSON.stringify(payload),
  }),
  deleteNewsletterCampaign: (id) => authenticatedWrite(`/admin/newsletter/campaigns/${id}`, { method: 'DELETE' }),
  newsletterCampaignPreview: (id) => request(`/admin/newsletter/campaigns/${id}/preview`),
  testNewsletterCampaign: (id, email) => authenticatedWrite(`/admin/newsletter/campaigns/${id}/test`, { method: 'POST', body: JSON.stringify({ email }) }),
  sendNewsletterCampaign: (id, scheduledAt = null) => authenticatedWrite(`/admin/newsletter/campaigns/${id}/send`, {
    method: 'POST', body: JSON.stringify({ scheduled_at: scheduledAt }),
  }),
  audit: () => request('/admin/audit'),
}
