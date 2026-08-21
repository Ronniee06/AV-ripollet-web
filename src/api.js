const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:8000/api`
const CSRF_KEY = 'av-admin-csrf'

function getErrorMessage(data) {
  if (typeof data?.detail === 'string') return data.detail
  if (Array.isArray(data?.detail)) {
    const messages = data.detail
      .map((item) => item?.msg?.replace(/^Value error,\s*/i, ''))
      .filter(Boolean)
    if (messages.length) return messages.join('. ')
  }
  return 'No se ha podido completar la solicitud'
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const method = (options.method || 'GET').toUpperCase()
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = sessionStorage.getItem(CSRF_KEY)
    if (csrf) headers['X-CSRF-Token'] = csrf
  }

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers,
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('No se puede conectar con el servidor. Comprueba que la API esté iniciada e inténtalo de nuevo.', { cause: error })
    }
    throw error
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    if (response.status === 401) sessionStorage.removeItem(CSRF_KEY)
    throw new Error(getErrorMessage(data))
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
  prayerRequests: () => request('/admin/prayer-requests'),
  updatePrayerRequest: (id, changes) => authenticatedWrite(`/admin/prayer-requests/${id}`, {
    method: 'PATCH', body: JSON.stringify(changes),
  }),
  subscribeNewsletter: (payload) => request('/newsletter/subscribe', { method: 'POST', body: JSON.stringify(payload) }),

  login: async (email, password) => {
    const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    sessionStorage.setItem(CSRF_KEY, data.csrf_token)
    return data.user
  },
  me: () => request('/auth/me'),
  changePassword: (payload) => authenticatedWrite('/auth/change-password', {
    method: 'POST', body: JSON.stringify(payload),
  }),
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
  createRegistration: (eventId, payload) => authenticatedWrite(`/admin/events/${eventId}/registrations`, {
    method: 'POST', body: JSON.stringify(payload),
  }),
  updateRegistration: (id, changes) => authenticatedWrite(`/admin/registrations/${id}`, {
    method: 'PATCH', body: JSON.stringify(changes),
  }),
  eventManagement: (eventId) => request(`/admin/events/${eventId}/management`),
  createEventTable: (eventId, payload) => authenticatedWrite(`/admin/events/${eventId}/tables`, {
    method: 'POST', body: JSON.stringify(payload),
  }),
  updateEventTable: (eventId, tableId, payload) => authenticatedWrite(`/admin/events/${eventId}/tables/${tableId}`, {
    method: 'PATCH', body: JSON.stringify(payload),
  }),
  deleteEventTable: (eventId, tableId) => authenticatedWrite(`/admin/events/${eventId}/tables/${tableId}`, { method: 'DELETE' }),
  assignRegistrationTable: (registrationId, tableId, seats) => authenticatedWrite(`/admin/registrations/${registrationId}/table`, {
    method: 'PUT', body: JSON.stringify({ table_id: tableId, seats }),
  }),

  people: () => request('/admin/people'),
  createPerson: (payload) => authenticatedWrite('/admin/people', { method: 'POST', body: JSON.stringify(payload) }),
  updatePerson: (id, payload) => authenticatedWrite(`/admin/people/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  users: () => request('/admin/users'),
  createUser: (payload) => authenticatedWrite('/admin/users', { method: 'POST', body: JSON.stringify(payload) }),
  updateUser: (id, payload) => authenticatedWrite(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  updateUserPermissions: (id, permissions) => authenticatedWrite(`/admin/users/${id}/permissions`, {
    method: 'PATCH', body: JSON.stringify({ permissions }),
  }),
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
