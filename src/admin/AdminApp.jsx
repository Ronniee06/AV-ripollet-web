import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, CalendarDays, Check, ClipboardList, CreditCard, FileClock, Images,
  LayoutDashboard, LogOut, Mail, Menu, Pencil, Plus, ShieldCheck, Trash2, Users, X,
} from 'lucide-react'
import { api } from '../api'
import { NewsletterAdmin } from './NewsletterAdmin'
import './admin.css'

const roleLabels = {
  developer: 'Desarrollador',
  admin: 'Administrador',
  event_manager: 'Gestor de eventos',
  communications: 'Comunicaciones',
  viewer: 'Solo lectura',
}

const emptyEvent = {
  title: '', description: '', starts_at: '', location: 'Alcance Victoria Barcelona Norte',
  category: 'Celebración', featured: false, published: true, status: 'scheduled',
  registration_enabled: false, registration_opens_at: '', registration_closes_at: '',
  capacity: '', price_cents: 0, pricing_mode: 'single', adult_price_cents: 0,
  child_price_cents: 0, child_age_limit: 12, currency: 'EUR', allow_photo_uploads: false,
}

const emptyUser = { email: '', full_name: '', password: '', role: 'event_manager' }

function toLocalInputValue(value) {
  if (!value) return ''
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function toEventForm(event) {
  if (!event) return emptyEvent
  return {
    ...emptyEvent,
    ...event,
    starts_at: toLocalInputValue(event.starts_at),
    registration_opens_at: toLocalInputValue(event.registration_opens_at),
    registration_closes_at: toLocalInputValue(event.registration_closes_at),
    capacity: event.capacity ?? '',
  }
}

function toEventPayload(form) {
  return {
    ...form,
    starts_at: new Date(form.starts_at).toISOString(),
    registration_opens_at: form.registration_opens_at ? new Date(form.registration_opens_at).toISOString() : null,
    registration_closes_at: form.registration_closes_at ? new Date(form.registration_closes_at).toISOString() : null,
    capacity: form.capacity === '' ? null : Number(form.capacity),
    price_cents: Number(form.price_cents || 0),
    adult_price_cents: Number(form.adult_price_cents || 0),
    child_price_cents: Number(form.child_price_cents || 0),
    child_age_limit: Number(form.child_age_limit || 12),
  }
}

function eventPriceLabel(event) {
  const money = (cents) => (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: event.currency })
  if (event.pricing_mode === 'adult_child') return `Adulto ${money(event.adult_price_cents)} · Niño ${money(event.child_price_cents)}`
  return event.price_cents > 0 ? money(event.price_cents) : 'Gratis'
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      onLogin(await api.login(email, password))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-login">
      <a className="admin-login__back" href="/"><ArrowLeft size={17} /> Volver a la web</a>
      <section className="admin-login__card">
        <img src="/brand/av-barcelona-norte.png" alt="Alcance Victoria Barcelona Norte" />
        <p className="admin-kicker">Acceso restringido</p>
        <h1>Panel de administración</h1>
        <p>Solo pueden entrar usuarios autorizados por la organización.</p>
        <form onSubmit={submit}>
          <label>Email<input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Contraseña<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button className="admin-primary" disabled={loading}>{loading ? 'Comprobando…' : 'Entrar'}</button>
        </form>
        <small>Las sesiones caducan automáticamente y los intentos fallidos quedan limitados.</small>
      </section>
    </main>
  )
}

function EventEditor({ value, onSave, onClose }) {
  const [form, setForm] = useState(toEventForm(value))
  const update = (key, next) => setForm((current) => ({ ...current, [key]: next }))

  return (
    <div className="admin-modal" role="presentation">
      <button className="admin-modal__backdrop" onClick={onClose} aria-label="Cerrar editor" />
      <form className="admin-modal__panel" onSubmit={(e) => { e.preventDefault(); onSave(toEventPayload(form)) }}>
        <header><div><p className="admin-kicker">Configuración</p><h2>{value?.id ? 'Editar evento' : 'Nuevo evento'}</h2></div><button type="button" className="admin-icon" onClick={onClose} aria-label="Cerrar"><X /></button></header>
        <div className="admin-form-grid">
          <label className="wide">Título<input value={form.title} onChange={(e) => update('title', e.target.value)} required minLength="3" /></label>
          <label className="wide">Descripción<textarea value={form.description} onChange={(e) => update('description', e.target.value)} required minLength="10" rows="4" /></label>
          <label>Fecha y hora<input type="datetime-local" value={form.starts_at} onChange={(e) => update('starts_at', e.target.value)} required /></label>
          <label>Estado<select value={form.status} onChange={(e) => update('status', e.target.value)}><option value="draft">Borrador</option><option value="scheduled">Programado</option><option value="open">Abierto</option><option value="closed">Cerrado</option><option value="cancelled">Cancelado</option><option value="completed">Finalizado</option></select></label>
          <label>Lugar<input value={form.location} onChange={(e) => update('location', e.target.value)} required /></label>
          <label>Categoría<input value={form.category} onChange={(e) => update('category', e.target.value)} required /></label>
          <label>Capacidad<input type="number" min="1" value={form.capacity} onChange={(e) => update('capacity', e.target.value)} placeholder="Sin límite" /></label>
          <label>Configuración del menú<select value={form.pricing_mode} onChange={(e) => update('pricing_mode', e.target.value)}><option value="single">Menú combinado · mismo precio</option><option value="adult_child">Menús diferentes · adulto/niño</option></select></label>
          {form.pricing_mode === 'single' ? <label>Precio por persona (€)<input type="number" min="0" step="0.01" value={(form.price_cents / 100).toString()} onChange={(e) => update('price_cents', Math.round(Number(e.target.value || 0) * 100))} /></label> : <>
            <label>Precio adulto (€)<input type="number" min="0" step="0.01" value={(form.adult_price_cents / 100).toString()} onChange={(e) => update('adult_price_cents', Math.round(Number(e.target.value || 0) * 100))} /></label>
            <label>Precio niño (€)<input type="number" min="0" step="0.01" value={(form.child_price_cents / 100).toString()} onChange={(e) => update('child_price_cents', Math.round(Number(e.target.value || 0) * 100))} /></label>
            <label>Se considera niño hasta<input type="number" min="1" max="17" value={form.child_age_limit} onChange={(e) => update('child_age_limit', e.target.value)} /><small>Años incluidos</small></label>
          </>}
          <label>Apertura de inscripciones<input type="datetime-local" value={form.registration_opens_at} onChange={(e) => update('registration_opens_at', e.target.value)} /></label>
          <label>Cierre de inscripciones<input type="datetime-local" value={form.registration_closes_at} onChange={(e) => update('registration_closes_at', e.target.value)} /></label>
        </div>
        <div className="admin-checks">
          <label><input type="checkbox" checked={form.published} onChange={(e) => update('published', e.target.checked)} /> Publicado</label>
          <label><input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} /> Destacado</label>
          <label><input type="checkbox" checked={form.registration_enabled} onChange={(e) => update('registration_enabled', e.target.checked)} /> Permitir inscripciones</label>
          <label><input type="checkbox" checked={form.allow_photo_uploads} onChange={(e) => update('allow_photo_uploads', e.target.checked)} /> Permitir fotos</label>
        </div>
        <footer><button type="button" className="admin-secondary" onClick={onClose}>Cancelar</button><button className="admin-primary">Guardar evento <Check size={17} /></button></footer>
      </form>
    </div>
  )
}

function UserEditor({ currentUser, onSave, onClose }) {
  const [form, setForm] = useState(emptyUser)
  const update = (key, next) => setForm((current) => ({ ...current, [key]: next }))
  const allowedRoles = currentUser.role === 'developer'
    ? Object.keys(roleLabels)
    : ['event_manager', 'communications', 'viewer']

  return (
    <div className="admin-modal" role="presentation">
      <button className="admin-modal__backdrop" onClick={onClose} aria-label="Cerrar editor" />
      <form className="admin-modal__panel admin-modal__panel--small" onSubmit={(e) => { e.preventDefault(); onSave(form) }}>
        <header><div><p className="admin-kicker">Equipo</p><h2>Nuevo usuario</h2></div><button type="button" className="admin-icon" onClick={onClose} aria-label="Cerrar"><X /></button></header>
        <label>Nombre completo<input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required minLength="2" /></label>
        <label>Email<input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required /></label>
        <label>Contraseña temporal<input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength="12" /><small>Mínimo 12 caracteres. Se almacenará únicamente su hash Argon2.</small></label>
        <label>Rol<select value={form.role} onChange={(e) => update('role', e.target.value)}>{allowedRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</select></label>
        <footer><button type="button" className="admin-secondary" onClick={onClose}>Cancelar</button><button className="admin-primary">Crear usuario</button></footer>
      </form>
    </div>
  )
}

export function AdminApp() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const [section, setSection] = useState('overview')
  const [navOpen, setNavOpen] = useState(false)
  const [events, setEvents] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [users, setUsers] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [newsletterProvider, setNewsletterProvider] = useState(null)
  const [audit, setAudit] = useState([])
  const [eventEditor, setEventEditor] = useState(null)
  const [userEditor, setUserEditor] = useState(false)
  const [notice, setNotice] = useState('')

  const canEditEvents = user && ['developer', 'admin', 'event_manager'].includes(user.role)
  const canManageUsers = user && ['developer', 'admin'].includes(user.role)
  const canManageNewsletter = user && ['developer', 'admin', 'communications'].includes(user.role)

  const loadData = async (profile) => {
    const safe = async (promise, fallback = []) => { try { return await promise } catch { return fallback } }
    const canReadNewsletter = ['developer', 'admin', 'communications', 'viewer'].includes(profile.role)
    const [eventData, registrationData, userData, subscriberData, campaignData, providerData, auditData] = await Promise.all([
      safe(api.adminEvents()), safe(api.registrations()),
      ['developer', 'admin'].includes(profile.role) ? safe(api.users()) : [],
      canReadNewsletter ? safe(api.newsletterSubscribers()) : [],
      canReadNewsletter ? safe(api.newsletterCampaigns()) : [],
      canReadNewsletter ? safe(api.newsletterProviderStatus(), {}) : {},
      ['developer', 'admin'].includes(profile.role) ? safe(api.audit()) : [],
    ])
    setEvents(eventData); setRegistrations(registrationData); setUsers(userData); setSubscribers(subscriberData); setCampaigns(campaignData); setNewsletterProvider(providerData); setAudit(auditData)
  }

  const reloadNewsletter = async () => {
    const [subscriberData, campaignData, providerData] = await Promise.all([
      api.newsletterSubscribers(), api.newsletterCampaigns(), api.newsletterProviderStatus(),
    ])
    setSubscribers(subscriberData); setCampaigns(campaignData); setNewsletterProvider(providerData)
  }

  useEffect(() => {
    api.me().then((profile) => { setUser(profile); return loadData(profile) }).catch(() => setUser(null)).finally(() => setChecking(false))
  }, [])

  const saveEvent = async (payload) => {
    try {
      await api.saveEvent(eventEditor?.id ? { ...payload, id: eventEditor.id } : payload)
      setEventEditor(null); setNotice('Evento guardado correctamente'); setEvents(await api.adminEvents())
    } catch (error) { setNotice(error.message) }
  }

  const removeEvent = async (id) => {
    if (!window.confirm('El evento se moverá a la papelera. ¿Continuar?')) return
    try { await api.deleteEvent(id); setEvents(await api.adminEvents()); setNotice('Evento movido a la papelera') } catch (error) { setNotice(error.message) }
  }

  const createUser = async (payload) => {
    try { await api.createUser(payload); setUsers(await api.users()); setUserEditor(false); setNotice('Usuario creado') } catch (error) { setNotice(error.message) }
  }

  const deactivateUser = async (id) => {
    if (!window.confirm('Este usuario perderá el acceso y se cerrarán sus sesiones. ¿Continuar?')) return
    try { await api.deleteUser(id); setUsers(await api.users()); setNotice('Usuario desactivado') } catch (error) { setNotice(error.message) }
  }

  const updateUser = async (id, changes) => {
    try {
      await api.updateUser(id, changes)
      setUsers(await api.users())
      setNotice('Usuario actualizado')
    } catch (error) { setNotice(error.message) }
  }

  const updateRegistration = async (id, changes) => {
    try { await api.updateRegistration(id, changes); setRegistrations(await api.registrations()) } catch (error) { setNotice(error.message) }
  }

  const logout = async () => { await api.logout().catch(() => {}); setUser(null) }
  const switchSection = (next) => { setSection(next); setNavOpen(false) }

  const metrics = useMemo(() => ({
    upcoming: events.filter((event) => new Date(event.starts_at) >= new Date()).length,
    registrations: registrations.filter((item) => item.status !== 'cancelled').reduce((total, item) => total + item.attendees, 0),
    pendingPayments: registrations.filter((item) => item.payment_status === 'pending').length,
    subscribers: subscribers.filter((item) => item.status === 'active').length,
  }), [events, registrations, subscribers])

  if (checking) return <div className="admin-loading">Comprobando sesión…</div>
  if (!user) return <Login onLogin={(profile) => { setUser(profile); loadData(profile) }} />

  const navigation = [
    ['overview', LayoutDashboard, 'Resumen'], ['events', CalendarDays, 'Eventos'],
    ['registrations', ClipboardList, 'Inscripciones'], ['photos', Images, 'Fotos'],
    ...(canManageUsers ? [['users', Users, 'Usuarios']] : []),
    ['newsletter', Mail, 'Newsletter'],
    ...(canManageUsers ? [['audit', FileClock, 'Auditoría']] : []),
  ]

  return (
    <div className="admin-shell">
      <button className="admin-mobile-toggle" onClick={() => setNavOpen(true)} aria-label="Abrir navegación"><Menu /></button>
      {navOpen && <button className="admin-mobile-backdrop" onClick={() => setNavOpen(false)} aria-label="Cerrar navegación" />}
      <aside className={navOpen ? 'admin-sidebar is-open' : 'admin-sidebar'}>
        <header><img src="/brand/av-barcelona-norte.png" alt="Alcance Victoria Barcelona Norte" /><button className="admin-sidebar__close" onClick={() => setNavOpen(false)} aria-label="Cerrar"><X /></button></header>
        <nav>{navigation.map(([key, Icon, label]) => <button key={key} className={section === key ? 'active' : ''} onClick={() => switchSection(key)}><Icon size={18} /> {label}</button>)}</nav>
        <footer><div><strong>{user.full_name}</strong><span>{roleLabels[user.role]}</span></div><button onClick={logout} aria-label="Cerrar sesión"><LogOut size={18} /></button></footer>
      </aside>

      <main className="admin-content">
        <header className="admin-topbar"><div><p className="admin-kicker">Organización</p><h1>{navigation.find(([key]) => key === section)?.[2]}</h1></div><a href="/">Ver web <ArrowLeft size={16} /></a></header>
        {notice && <div className="admin-notice">{notice}<button onClick={() => setNotice('')} aria-label="Cerrar"><X size={16} /></button></div>}

        {section === 'overview' && <>
          <section className="admin-metrics">
            <article><CalendarDays /><span>Próximos eventos</span><strong>{metrics.upcoming}</strong></article>
            <article><Users /><span>Personas inscritas</span><strong>{metrics.registrations}</strong></article>
            <article><CreditCard /><span>Pagos pendientes</span><strong>{metrics.pendingPayments}</strong></article>
            <article><Mail /><span>Newsletter</span><strong>{metrics.subscribers}</strong></article>
          </section>
          <section className="admin-panel"><div className="admin-panel__heading"><div><p className="admin-kicker">Actividad</p><h2>Lo siguiente que requiere atención</h2></div></div>
            <div className="admin-priorities">
              <button onClick={() => setSection('registrations')}><ClipboardList /><div><strong>{registrations.filter((r) => r.status === 'pending').length} inscripciones pendientes</strong><span>Confirmar plazas y revisar información</span></div></button>
              <button onClick={() => setSection('events')}><CalendarDays /><div><strong>{events.filter((e) => !e.published).length} eventos en borrador</strong><span>Completar configuración y publicar</span></div></button>
              <button onClick={() => setSection('newsletter')}><Mail /><div><strong>{metrics.subscribers} contactos activos</strong><span>Preparados para futuras comunicaciones</span></div></button>
            </div>
          </section>
        </>}

        {section === 'events' && <section className="admin-panel">
          <div className="admin-panel__heading"><div><p className="admin-kicker">Programación</p><h2>Eventos</h2><p>Configura plazas, precio, inscripción y subida de fotos en cada actividad.</p></div>{canEditEvents && <button className="admin-primary" onClick={() => setEventEditor({})}><Plus size={18} /> Nuevo evento</button>}</div>
          <div className="admin-list">{events.map((event) => <article key={event.id}><div className="admin-date"><strong>{new Date(event.starts_at).getDate()}</strong><span>{new Date(event.starts_at).toLocaleDateString('es-ES', { month: 'short' })}</span></div><div className="admin-list__body"><div className="admin-tags"><span>{event.category}</span><span>{event.status}</span>{event.registration_enabled && <span>Inscripción</span>}<span>{eventPriceLabel(event)}</span></div><h3>{event.title}</h3><p>{event.location} · {new Date(event.starts_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</p></div>{canEditEvents && <div className="admin-row-actions"><button onClick={() => setEventEditor(event)} aria-label="Editar"><Pencil /></button><button className="danger" onClick={() => removeEvent(event.id)} aria-label="Eliminar"><Trash2 /></button></div>}</article>)}</div>
        </section>}

        {section === 'registrations' && <section className="admin-panel"><div className="admin-panel__heading"><div><p className="admin-kicker">Participación</p><h2>Inscripciones</h2><p>Asistencia, necesidades, transporte y estado del pago.</p></div></div><div className="admin-table-wrap"><table><thead><tr><th>Persona</th><th>Evento</th><th>Plazas</th><th>Adultos / niños</th><th>Estado</th><th>Pago</th><th>Acciones</th></tr></thead><tbody>{registrations.map((item) => <tr key={item.id}><td><strong>{item.full_name}</strong><small>{item.email}</small></td><td>{item.event_title}</td><td>{item.attendees}</td><td>{item.adults ?? item.attendees} / {item.children ?? 0}</td><td><span className={`admin-status ${item.status}`}>{item.status}</span></td><td>{item.payment_status}</td><td>{canEditEvents && <div className="admin-inline-actions"><button onClick={() => updateRegistration(item.id, { status: 'confirmed' })}>Confirmar</button>{item.payment_status === 'pending' && <button onClick={() => updateRegistration(item.id, { payment_status: 'paid' })}>Marcar pagado</button>}</div>}</td></tr>)}</tbody></table></div></section>}

        {section === 'photos' && <section className="admin-empty-module"><Images /><h2>Galerías por evento</h2><p>La base de datos ya relaciona fotos, eventos e inscripciones. La subida de archivos se conectará cuando se decida el almacenamiento definitivo.</p></section>}

        {section === 'users' && canManageUsers && <section className="admin-panel"><div className="admin-panel__heading"><div><p className="admin-kicker">Accesos</p><h2>Usuarios y roles</h2><p>Desactiva cuentas, asigna responsabilidades y crea nuevos administradores.</p></div><button className="admin-primary" onClick={() => setUserEditor(true)}><Plus size={18} /> Nuevo usuario</button></div><div className="admin-user-grid">{users.map((item) => {
          const canEditTarget = item.id !== user.id && (user.role === 'developer' || !['developer', 'admin'].includes(item.role))
          const assignableRoles = user.role === 'developer' ? Object.keys(roleLabels) : ['event_manager', 'communications', 'viewer']
          return <article key={item.id}><div className="admin-avatar">{item.full_name.slice(0, 2).toUpperCase()}</div><div><h3>{item.full_name}</h3><p>{item.email}</p>{canEditTarget ? <label className="admin-role-select"><ShieldCheck size={14} /><select value={item.role} onChange={(event) => updateUser(item.id, { role: event.target.value })} aria-label={`Rol de ${item.full_name}`}>{assignableRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</select></label> : <span className="admin-role"><ShieldCheck size={14} /> {roleLabels[item.role]}</span>}</div><div className="admin-user-state"><span className={item.active ? 'active' : 'inactive'}>{item.active ? 'Activo' : 'Inactivo'}</span>{canEditTarget && (item.active ? <button className="admin-icon danger" onClick={() => deactivateUser(item.id)} aria-label="Desactivar"><Trash2 /></button> : <button className="admin-secondary admin-reactivate" onClick={() => updateUser(item.id, { active: true })}>Reactivar</button>)}</div></article>
        })}</div></section>}

        {section === 'newsletter' && <NewsletterAdmin subscribers={subscribers} campaigns={campaigns} provider={newsletterProvider} canManage={canManageNewsletter} reload={reloadNewsletter} notify={setNotice} />}

        {section === 'audit' && canManageUsers && <section className="admin-panel"><div className="admin-panel__heading"><div><p className="admin-kicker">Seguridad</p><h2>Auditoría</h2><p>Registro de accesos y cambios administrativos.</p></div></div><div className="admin-audit-list">{audit.map((item) => <article key={item.id}><FileClock /><div><strong>{item.action} · {item.entity_type}</strong><span>{item.user_email || 'Sistema'} · {new Date(item.created_at).toLocaleString('es-ES')}</span></div></article>)}</div></section>}
      </main>

      {eventEditor && <EventEditor value={eventEditor.id ? eventEditor : null} onSave={saveEvent} onClose={() => setEventEditor(null)} />}
      {userEditor && <UserEditor currentUser={user} onSave={createUser} onClose={() => setUserEditor(false)} />}
    </div>
  )
}
