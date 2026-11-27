import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, Bus, CalendarDays, Check, ChevronLeft, ChevronRight, CircleDollarSign, ClipboardList, ContactRound, CreditCard, Eye, EyeOff, FileClock, Images,
  Heart, KeyRound, LayoutDashboard, LogOut, Mail, Menu, Pencil, Plus, Settings2, ShieldCheck, Trash2, Users, X,
  TableProperties, UserCheck,
} from 'lucide-react'
import { api } from '../api'
import { buildChurchOptions } from '../churches'
import { PeopleAdmin } from './PeopleAdmin'
import { NewsletterAdmin } from './NewsletterAdmin'
import { PrayerAdmin } from './PrayerAdmin'
import { RolesAdmin } from './RolesAdmin'
import { SettingsAdmin } from './SettingsAdmin'
import { WelcomeAdmin } from './WelcomeAdmin'
import './admin.css'

const roleLabels = {
  developer: 'Desarrollador',
  admin: 'Administrador',
  event_manager: 'Gestor de eventos',
  communications: 'Comunicaciones',
  viewer: 'Solo lectura',
}

const permissionScreens = [
  ['overview', 'Resumen'], ['events', 'Eventos'], ['registrations', 'Inscripciones'], ['people', 'Personas'], ['welcome', 'Bienvenidas'],
  ['prayer', 'Oración'], ['photos', 'Fotos'], ['users', 'Usuarios'], ['roles', 'Roles'], ['newsletter', 'Newsletter'], ['settings', 'Configuración'], ['audit', 'Auditoría'],
]
const permissionLevelLabels = { none: 'Sin acceso', view: 'Solo ver', manage: 'Administrar' }
const permissionRank = { none: 0, view: 1, manage: 2 }
const rolePermissionFallback = {
  developer: Object.fromEntries(permissionScreens.map(([screen]) => [screen, 'manage'])),
  admin: Object.fromEntries(permissionScreens.map(([screen]) => [screen, 'manage'])),
  event_manager: { overview: 'view', events: 'manage', registrations: 'manage', people: 'view', welcome: 'none', prayer: 'view', photos: 'manage', users: 'none', roles: 'none', newsletter: 'none', settings: 'none', audit: 'none' },
  communications: { overview: 'view', events: 'view', registrations: 'none', people: 'none', welcome: 'none', prayer: 'manage', photos: 'view', users: 'none', roles: 'none', newsletter: 'manage', settings: 'none', audit: 'none' },
  viewer: { overview: 'view', events: 'view', registrations: 'view', people: 'none', welcome: 'none', prayer: 'none', photos: 'view', users: 'none', roles: 'none', newsletter: 'view', settings: 'none', audit: 'none' },
}

function hasScreenAccess(profile, screen, required = 'view') {
  if (!profile) return false
  const granted = profile.permissions?.[screen] || rolePermissionFallback[profile.role]?.[screen] || 'none'
  return permissionRank[granted] >= permissionRank[required]
}

function allowedSection(profile, preferred = 'overview') {
  if (hasScreenAccess(profile, preferred)) return preferred
  return permissionScreens.find(([screen]) => hasScreenAccess(profile, screen))?.[0] || 'overview'
}

const emptyEvent = {
  title: '', description: '', starts_at: '', location: 'Alcance Victoria Barcelona Norte',
  category: 'Celebración', featured: false, published: true, status: 'scheduled',
  registration_enabled: false, registration_opens_at: '', registration_closes_at: '',
  capacity: '', price_cents: 0, pricing_mode: 'free', adult_price_cents: 0,
  child_price_cents: 0, child_age_limit: 12, menu_enabled: false, adult_menu_price_cents: 0,
  child_menu_price_cents: 0, contact_name: '', contact_phone: '', contact_email: '',
  payment_instructions: '', currency: 'EUR', allow_photo_uploads: false,
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
    price_cents: form.pricing_mode === 'single' ? Number(form.price_cents || 0) : 0,
    adult_price_cents: form.pricing_mode === 'adult_child' ? Number(form.adult_price_cents || 0) : 0,
    child_price_cents: form.pricing_mode === 'adult_child' ? Number(form.child_price_cents || 0) : 0,
    child_age_limit: Number(form.child_age_limit || 12),
    adult_menu_price_cents: form.menu_enabled ? Number(form.adult_menu_price_cents || 0) : 0,
    child_menu_price_cents: form.menu_enabled ? Number(form.child_menu_price_cents || 0) : 0,
    contact_name: form.registration_enabled ? '' : form.contact_name.trim(),
    contact_phone: form.registration_enabled ? '' : form.contact_phone.trim(),
    contact_email: form.registration_enabled ? '' : form.contact_email.trim(),
  }
}

function eventPriceLabel(event) {
  const money = (cents) => (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: event.currency })
  if (event.pricing_mode === 'free') return 'Gratis'
  if (event.pricing_mode === 'adult_child') return `Adulto ${money(event.adult_price_cents)} · Niño ${money(event.child_price_cents)}`
  return event.price_cents > 0 ? money(event.price_cents) : 'Gratis'
}

function eventMenuLabel(event) {
  if (!event.menu_enabled) return 'Sin menús'
  const money = (cents) => (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: event.currency || 'EUR' })
  return `Menú adulto ${money(event.adult_menu_price_cents)} · infantil ${money(event.child_menu_price_cents)}`
}

const eventTypeOptions = [
  { value: 'Celebración', label: 'Celebración', description: 'Cultos, aniversarios y reuniones especiales.' },
  { value: 'Comunidad', label: 'Comunidad', description: 'Comidas, convivencias y encuentros abiertos.' },
  { value: 'Formación', label: 'Formación', description: 'Cursos, talleres y discipulado.' },
  { value: 'Juventud', label: 'Juventud', description: 'Actividades de jóvenes y adolescentes.' },
  { value: 'Familias', label: 'Familias', description: 'Encuentros para matrimonios, padres o niños.' },
  { value: 'Otro', label: 'Otro tipo', description: 'Escribe una categoría diferente.' },
]

const eventWizardSteps = ['Tipo de evento', 'Cuándo y dónde', 'Inscripciones', 'Precio y menús', 'Resumen']

const eventStatusLabels = {
  draft: 'Borrador', scheduled: 'Programado', open: 'Abierto', closed: 'Cerrado',
  cancelled: 'Cancelado', completed: 'Finalizado',
}
const registrationStatusLabels = { pending: 'Pendiente', confirmed: 'Confirmada', waitlist: 'En espera', cancelled: 'Cancelada' }
const paymentStatusLabels = { not_required: 'No requiere', pending: 'Pendiente', paid: 'Pagado', refunded: 'Reembolsado', failed: 'Fallido' }

function formatEventDate(value) {
  if (!value) return 'Sin indicar'
  return new Date(value).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })
}

function PasswordInput({ label, value, onChange, autoComplete, helper }) {
  const [visible, setVisible] = useState(false)
  return <label>{label}<div className="admin-password-field"><input type={visible ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)} required minLength="12" autoComplete={autoComplete} /><button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`} aria-pressed={visible} title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</button></div>{helper && <small>{helper}</small>}</label>
}

function PasswordEditor({ forced = false, target = null, onSave, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const isReset = Boolean(target)

  const submit = async (event) => {
    event.preventDefault()
    if (newPassword !== confirmation) {
      setError('Las contraseñas nuevas no coinciden')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave(isReset ? newPassword : {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmation,
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return <div className={`admin-modal ${forced ? 'admin-password-required' : ''}`} role="presentation">
    {forced ? <div className="admin-modal__backdrop" /> : <button className="admin-modal__backdrop" onClick={onClose} aria-label="Cerrar cambio de contraseña" />}
    <form className="admin-modal__panel admin-modal__panel--small admin-password-editor" onSubmit={submit} aria-label={isReset ? `Restablecer contraseña de ${target.full_name}` : 'Cambiar mi contraseña'}>
      <header><div><p className="admin-kicker">{forced ? 'Primer acceso' : isReset ? 'Seguridad del usuario' : 'Mi cuenta'}</p><h2>{forced ? 'Crea tu contraseña' : isReset ? 'Restablecer contraseña' : 'Cambiar contraseña'}</h2></div>{!forced && <button type="button" className="admin-icon" onClick={onClose} aria-label="Cerrar"><X /></button>}</header>
      <p className="admin-password-editor__intro">{forced ? 'La contraseña entregada era temporal. Elige una personal antes de continuar al panel.' : isReset ? `Asigna una contraseña temporal a ${target.full_name}. Tendrá que cambiarla al iniciar sesión.` : 'Introduce tu contraseña actual y elige una nueva. Cerraremos tus demás sesiones abiertas.'}</p>
      {!isReset && <PasswordInput label="Contraseña actual" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />}
      <PasswordInput label={isReset ? 'Nueva contraseña temporal' : 'Nueva contraseña'} value={newPassword} onChange={setNewPassword} autoComplete="new-password" helper="Mínimo 12 caracteres." />
      <PasswordInput label="Repetir nueva contraseña" value={confirmation} onChange={setConfirmation} autoComplete="new-password" />
      {error && <p className="admin-error" role="alert">{error}</p>}
      <footer>{forced && <button type="button" className="admin-secondary" onClick={onClose}>Cerrar sesión</button>}{!forced && <button type="button" className="admin-secondary" onClick={onClose}>Cancelar</button>}<button className="admin-primary" disabled={saving}>{saving ? 'Guardando…' : isReset ? 'Guardar contraseña temporal' : 'Cambiar contraseña'} <KeyRound size={17} /></button></footer>
    </form>
  </div>
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  const slides = [
    { src: '/media/hero-barcelona-1280.webp', position: 'center', eyebrow: 'Nuestra ciudad', title: 'Barcelona, nuestro campo de misión.', copy: 'Una iglesia con el corazón abierto a Ripollet y a toda Barcelona Norte.' },
    { src: '/community/pastors-juan-capi-banner.png', position: 'center', eyebrow: 'Nuestros pastores', title: 'Liderando con fe y cercanía.', copy: 'El Pastor Juan y la Pastora Capi sirven a cada generación con un mismo propósito.' },
    { src: '/community/adoracion.webp', position: 'center', eyebrow: 'Adoración', title: 'Un lugar para encontrarnos con Dios.', copy: 'Cada encuentro es una oportunidad para celebrar, agradecer y volver a casa.' },
    { src: '/community/predicacion.webp', position: 'center', eyebrow: 'La Palabra', title: 'Una fe que transforma la vida.', copy: 'Crecemos juntos para llevar esperanza a nuestra ciudad y mucho más allá.' },
  ]

  const logos = [
    { src: '/brand/av-barcelona-norte.png', alt: 'Alcance Victoria Barcelona Norte' },
    { src: '/brand/av-espana.png', alt: 'Alcance Victoria España' },
    { src: '/brand/gang-white.png', alt: "G.A.N.G. God's Anointed Now Generation" },
    { src: '/brand/gang_circle_white.PNG', alt: 'G.A.N.G. internacional' },
    { src: '/brand/gang_girls_white.png', alt: 'G.A.N.G. Girls' },
    { src: '/brand/gang_girls_roses.png', alt: 'G.A.N.G. Girls Roses' },
    { src: '/brand/gang_warriors.PNG', alt: 'G.A.N.G. Warriors', className: 'is-dark-logo' },
    { src: '/brand/impact_white.PNG', alt: 'Impact' },
    { src: '/brand/LOGONEW.png', alt: 'Victory Outreach Barcelona Norte' },
    { src: '/brand/VO_Original_White_pequeño.png', alt: 'Victory Outreach Barcelona Norte' },
  ]

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const interval = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 6000)
    return () => window.clearInterval(interval)
  }, [slides.length])

  const moveSlide = (direction) => {
    setActiveSlide((current) => (current + direction + slides.length) % slides.length)
  }

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
      <a className="admin-login__back" href="/"><ArrowLeft size={17} /> Ir al inicio</a>
      <section className="admin-login__shell">
        <div className="admin-login__visual" aria-roledescription="carrusel" aria-label="Alcance Victoria en el mundo">
          {slides.map((slide, index) => (
            <article className={`admin-login__slide ${index === activeSlide ? 'is-active' : ''}`} key={slide.src} aria-hidden={index !== activeSlide}>
              <img src={slide.src} alt="" style={{ objectPosition: slide.position }} />
              <div className="admin-login__slide-copy">
                <p>{slide.eyebrow}</p>
                <h2>{slide.title}</h2>
                <span>{slide.copy}</span>
              </div>
            </article>
          ))}
          <div className="admin-login__carousel-controls">
            <div className="admin-login__dots" aria-label="Seleccionar imagen">
              {slides.map((slide, index) => <button type="button" className={index === activeSlide ? 'is-active' : ''} onClick={() => setActiveSlide(index)} aria-label={`Ver imagen ${index + 1}: ${slide.eyebrow}`} aria-current={index === activeSlide ? 'true' : undefined} key={slide.eyebrow} />)}
            </div>
            <div className="admin-login__arrows">
              <button type="button" onClick={() => moveSlide(-1)} aria-label="Imagen anterior"><ChevronLeft /></button>
              <button type="button" onClick={() => moveSlide(1)} aria-label="Imagen siguiente"><ChevronRight /></button>
            </div>
          </div>
          <div className="admin-login__logo-strip" aria-label="Ministerios de Alcance Victoria">
            <div className="admin-login__logo-track">
              {[...logos, ...logos].map((logo, index) => <img className={logo.className || ''} src={logo.src} alt={index < logos.length ? logo.alt : ''} aria-hidden={index >= logos.length ? 'true' : undefined} key={`${logo.src}-${index}`} />)}
            </div>
          </div>
        </div>

        <div className="admin-login__form-panel">
          <div className="admin-login__form-wrap">
            <img className="admin-login__brand" src="/brand/av-barcelona-norte.png" alt="Alcance Victoria Barcelona Norte" />
            <div className="admin-login__heading">
              <p className="admin-kicker">Gestión interna</p>
              <h1>Bienvenido de nuevo</h1>
              <p>Accede para gestionar la vida y las actividades de nuestra iglesia.</p>
            </div>
            <form onSubmit={submit} aria-busy={loading}>
              <label>Email<input type="email" autoComplete="username" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
              <label>Contraseña<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
              <button className="admin-primary" disabled={loading} aria-busy={loading}>{loading ? 'Comprobando…' : 'Entrar al panel'}</button>
            </form>
            <div className={`admin-login__feedback ${error ? 'has-error' : ''}`} aria-live="polite">
              {error ? <p className="admin-error" role="alert">{error}</p> : <small>Acceso exclusivo para el equipo autorizado.</small>}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function EventEditor({ value, onSave, onClose }) {
  const [form, setForm] = useState(toEventForm(value))
  const initialCategory = eventTypeOptions.some((option) => option.value === (value?.category || emptyEvent.category))
    ? (value?.category || emptyEvent.category)
    : 'Otro'
  const [categoryChoice, setCategoryChoice] = useState(initialCategory)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')

  const update = (key, next) => {
    setForm((current) => ({ ...current, [key]: next }))
    setError('')
  }

  const chooseCategory = (next) => {
    setCategoryChoice(next)
    if (next === 'Otro') {
      if (eventTypeOptions.some((option) => option.value === form.category && option.value !== 'Otro')) update('category', '')
    } else {
      update('category', next)
    }
  }

  const validateStep = (index) => {
    if (index === 0) {
      if (!form.category.trim()) return 'Indica qué tipo de evento es.'
      if (form.title.trim().length < 3) return 'Escribe un título de al menos 3 caracteres.'
      if (form.description.trim().length < 10) return 'Añade una descripción breve de al menos 10 caracteres.'
    }
    if (index === 1) {
      if (!form.starts_at) return 'Indica la fecha y la hora del evento.'
      if (!form.location.trim()) return 'Indica dónde se celebrará el evento.'
    }
    if (index === 2 && form.registration_enabled) {
      if (form.capacity !== '' && Number(form.capacity) < 1) return 'La capacidad debe ser de al menos una persona o dejarse vacía.'
      if (form.registration_opens_at && form.registration_closes_at && new Date(form.registration_opens_at) > new Date(form.registration_closes_at)) {
        return 'La apertura de inscripciones debe ser anterior al cierre.'
      }
    }
    if (index === 2 && !form.registration_enabled) {
      if (form.contact_name.trim().length < 2) return 'Indica el nombre del hermano o hermana de contacto.'
      if (!form.contact_phone.trim() && !form.contact_email.trim()) return 'Añade un teléfono o un email para poder consultar.'
    }
    if (index === 3 && form.registration_enabled) {
      if (form.pricing_mode === 'single' && Number(form.price_cents) <= 0) return 'Indica el precio por persona.'
      if (form.pricing_mode === 'adult_child' && Number(form.adult_price_cents) <= 0) return 'Indica el precio para adultos.'
      if (form.menu_enabled && Number(form.adult_menu_price_cents) <= 0) return 'Indica el precio del menú para adultos.'
      const hasCharge = (form.pricing_mode === 'single' && Number(form.price_cents) > 0)
        || (form.pricing_mode === 'adult_child' && (Number(form.adult_price_cents) > 0 || Number(form.child_price_cents) > 0))
        || (form.menu_enabled && (Number(form.adult_menu_price_cents) > 0 || Number(form.child_menu_price_cents) > 0))
      if (hasCharge && form.payment_instructions.trim().length < 5) return 'Explica cómo debe realizarse el pago.'
    }
    return ''
  }

  const goToNextStep = () => {
    const validationError = validateStep(step)
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setStep((current) => Math.min(current + 1, eventWizardSteps.length - 1))
  }

  const submit = (event) => {
    event.preventDefault()
    if (step < eventWizardSteps.length - 1) {
      goToNextStep()
      return
    }
    onSave(toEventPayload(form))
  }

  const selectRegistration = (enabled) => {
    update('registration_enabled', enabled)
    if (!enabled) setForm((current) => ({ ...current, pricing_mode: 'free', menu_enabled: false }))
  }

  const priceSummary = !form.registration_enabled ? 'No necesita inscripción' : eventPriceLabel(form)

  return (
    <div className="admin-modal" role="presentation">
      <button className="admin-modal__backdrop" onClick={onClose} aria-label="Cerrar editor" />
      <form className="admin-modal__panel admin-event-wizard" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="event-editor-title">
        <header><div><p className="admin-kicker">Paso {step + 1} de {eventWizardSteps.length}</p><h2 id="event-editor-title">{value?.id ? 'Editar evento' : 'Nuevo evento'}</h2></div><button type="button" className="admin-icon" onClick={onClose} aria-label="Cerrar"><X /></button></header>

        <nav className="admin-wizard-progress" aria-label="Progreso de creación del evento">
          {eventWizardSteps.map((label, index) => (
            <button type="button" key={label} className={index === step ? 'is-active' : index < step ? 'is-complete' : ''} onClick={() => index < step && setStep(index)} disabled={index > step} aria-current={index === step ? 'step' : undefined}>
              <span>{index < step ? <Check size={14} /> : index + 1}</span><small>{label}</small>
            </button>
          ))}
        </nav>

        <section className="admin-wizard-stage">
          {step === 0 && <>
            <div className="admin-wizard-heading"><p className="admin-kicker">Empecemos por lo esencial</p><h3>¿Qué tipo de evento quieres crear?</h3><p>Elige una opción y ponle un nombre fácil de reconocer.</p></div>
            <div className="admin-choice-grid admin-choice-grid--types">
              {eventTypeOptions.map((option) => <button type="button" key={option.value} className={categoryChoice === option.value ? 'is-selected' : ''} onClick={() => chooseCategory(option.value)} aria-pressed={categoryChoice === option.value}><strong>{option.label}</strong><span>{option.description}</span></button>)}
            </div>
            <div className="admin-wizard-fields admin-wizard-fields--intro">
              {categoryChoice === 'Otro' && <label>Nombre de la categoría<input value={form.category} onChange={(e) => update('category', e.target.value)} placeholder="Por ejemplo, conferencia" autoFocus /></label>}
              <label>Título del evento<input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Por ejemplo, Encuentro de familias" autoFocus={categoryChoice !== 'Otro'} /></label>
              <label>Descripción breve<textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Cuenta en pocas palabras qué ocurrirá y para quién es." rows="3" /></label>
            </div>
          </>}

          {step === 1 && <>
            <div className="admin-wizard-heading"><p className="admin-kicker">Organización</p><h3>¿Cuándo y dónde será?</h3><p>Estos datos aparecerán en la información pública del evento.</p></div>
            <div className="admin-wizard-fields admin-wizard-fields--two">
              <label>Fecha y hora<input type="datetime-local" value={form.starts_at} onChange={(e) => update('starts_at', e.target.value)} autoFocus /></label>
              <label>Lugar<input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Dirección o nombre del lugar" /></label>
              <label>Estado<select value={form.status} onChange={(e) => update('status', e.target.value)}><option value="draft">Borrador</option><option value="scheduled">Programado</option><option value="open">Abierto</option><option value="closed">Cerrado</option><option value="cancelled">Cancelado</option><option value="completed">Finalizado</option></select><small>Normalmente puedes dejarlo como “Programado”.</small></label>
            </div>
          </>}

          {step === 2 && <>
            <div className="admin-wizard-heading"><p className="admin-kicker">Asistencia</p><h3>¿La gente necesita inscribirse?</h3><p>También puedes crear actividades informativas sin formulario de inscripción.</p></div>
            <div className="admin-choice-grid admin-choice-grid--binary">
              <button type="button" className={form.registration_enabled ? 'is-selected' : ''} onClick={() => selectRegistration(true)} aria-pressed={form.registration_enabled}><strong>Sí, necesita inscripción</strong><span>Pediremos los datos de las personas asistentes.</span></button>
              <button type="button" className={!form.registration_enabled ? 'is-selected' : ''} onClick={() => selectRegistration(false)} aria-pressed={!form.registration_enabled}><strong>No necesita inscripción</strong><span>Se publicará como una actividad informativa.</span></button>
            </div>
            {form.registration_enabled && <div className="admin-wizard-fields admin-wizard-fields--three">
              <label>Capacidad máxima <small>(opcional)</small><input type="number" min="1" value={form.capacity} onChange={(e) => update('capacity', e.target.value)} placeholder="Sin límite" /></label>
              <label>Abrir inscripciones <small>(opcional)</small><input type="datetime-local" value={form.registration_opens_at} onChange={(e) => update('registration_opens_at', e.target.value)} /></label>
              <label>Cerrar inscripciones <small>(opcional)</small><input type="datetime-local" value={form.registration_closes_at} onChange={(e) => update('registration_closes_at', e.target.value)} /></label>
            </div>}
            {!form.registration_enabled && <div className="admin-info-contact">
              <div><p className="admin-wizard-subheading">Persona de contacto</p><span>La gente verá con quién puede consultar dentro de la iglesia.</span></div>
              <div className="admin-wizard-fields admin-wizard-fields--three">
                <label>Nombre del hermano/a<input value={form.contact_name} onChange={(e) => update('contact_name', e.target.value)} placeholder="Por ejemplo, Hna. Marta" /></label>
                <label>Teléfono <small>(uno de los dos)</small><input type="tel" value={form.contact_phone} onChange={(e) => update('contact_phone', e.target.value)} placeholder="600 000 000" /></label>
                <label>Email <small>(uno de los dos)</small><input type="email" value={form.contact_email} onChange={(e) => update('contact_email', e.target.value)} placeholder="contacto@ejemplo.com" /></label>
              </div>
            </div>}
          </>}

          {step === 3 && <>
            <div className="admin-wizard-heading"><p className="admin-kicker">Últimos ajustes</p><h3>{form.registration_enabled ? '¿Qué se cobrará?' : '¿Cómo quieres publicarlo?'}</h3><p>{form.registration_enabled ? 'La inscripción y los menús se configuran por separado.' : 'Revisa estas opciones antes de continuar.'}</p></div>
            {form.registration_enabled && <>
              <p className="admin-wizard-subheading">Precio de la inscripción</p>
              <div className="admin-choice-grid admin-choice-grid--price">
                <button type="button" className={form.pricing_mode === 'free' ? 'is-selected' : ''} onClick={() => update('pricing_mode', 'free')} aria-pressed={form.pricing_mode === 'free'}><strong>Gratis</strong><span>No se cobrará nada.</span></button>
                <button type="button" className={form.pricing_mode === 'single' ? 'is-selected' : ''} onClick={() => update('pricing_mode', 'single')} aria-pressed={form.pricing_mode === 'single'}><strong>Precio único</strong><span>El mismo importe para todos.</span></button>
                <button type="button" className={form.pricing_mode === 'adult_child' ? 'is-selected' : ''} onClick={() => update('pricing_mode', 'adult_child')} aria-pressed={form.pricing_mode === 'adult_child'}><strong>Adulto y niño</strong><span>Dos importes diferentes.</span></button>
              </div>
              {form.pricing_mode === 'single' && <div className="admin-wizard-fields admin-wizard-fields--price"><label>Precio por persona (€)<input type="number" min="0" step="0.01" value={(form.price_cents / 100).toString()} onChange={(e) => update('price_cents', Math.round(Number(e.target.value || 0) * 100))} autoFocus /></label></div>}
              {form.pricing_mode === 'adult_child' && <div className="admin-wizard-fields admin-wizard-fields--three">
                <label>Precio adulto (€)<input type="number" min="0" step="0.01" value={(form.adult_price_cents / 100).toString()} onChange={(e) => update('adult_price_cents', Math.round(Number(e.target.value || 0) * 100))} autoFocus /></label>
                <label>Precio niño (€)<input type="number" min="0" step="0.01" value={(form.child_price_cents / 100).toString()} onChange={(e) => update('child_price_cents', Math.round(Number(e.target.value || 0) * 100))} /></label>
                <label>Se considera niño hasta<input type="number" min="1" max="17" value={form.child_age_limit} onChange={(e) => update('child_age_limit', e.target.value)} /><small>Años incluidos</small></label>
              </div>}
              <p className="admin-wizard-subheading">Menús <small>· se cobran aparte de la inscripción</small></p>
              <div className="admin-choice-grid admin-choice-grid--binary">
                <button type="button" className={!form.menu_enabled ? 'is-selected' : ''} onClick={() => update('menu_enabled', false)} aria-pressed={!form.menu_enabled}><strong>No habrá menús</strong><span>El evento no ofrecerá comida reservable.</span></button>
                <button type="button" className={form.menu_enabled ? 'is-selected' : ''} onClick={() => update('menu_enabled', true)} aria-pressed={form.menu_enabled}><strong>Sí, habrá menús</strong><span>Cada persona podrá elegir si quiere uno.</span></button>
              </div>
              {form.menu_enabled && <section className="admin-menu-pricing" aria-labelledby="menu-pricing-title">
                <header><div><strong id="menu-pricing-title">Precios de los menús</strong><span>Importe por cada menú reservado</span></div><small>Se sumarán aparte al coste de inscripción.</small></header>
                <div className="admin-menu-pricing__grid">
                  <label className="admin-menu-price-card"><span>Menú adulto</span><div className="admin-money-input"><input type="number" min="0" step="0.01" inputMode="decimal" value={(form.adult_menu_price_cents / 100).toString()} onChange={(e) => update('adult_menu_price_cents', Math.round(Number(e.target.value || 0) * 100))} aria-label="Precio del menú adulto en euros" /><b>€</b></div><small>Precio por persona adulta</small></label>
                  <label className="admin-menu-price-card"><span>Menú infantil</span><div className="admin-money-input"><input type="number" min="0" step="0.01" inputMode="decimal" value={(form.child_menu_price_cents / 100).toString()} onChange={(e) => update('child_menu_price_cents', Math.round(Number(e.target.value || 0) * 100))} aria-label="Precio del menú infantil en euros" /><b>€</b></div><small>Pon 0 si es gratuito</small></label>
                </div>
              </section>}
              {((form.pricing_mode === 'single' && Number(form.price_cents) > 0) || (form.pricing_mode === 'adult_child' && (Number(form.adult_price_cents) > 0 || Number(form.child_price_cents) > 0)) || (form.menu_enabled && (Number(form.adult_menu_price_cents) > 0 || Number(form.child_menu_price_cents) > 0))) && <div className="admin-payment-instructions"><label>¿Cómo debe pagarse?<textarea rows="3" value={form.payment_instructions} onChange={(e) => update('payment_instructions', e.target.value)} placeholder="Ej.: entrega el importe a la Hna. Marta después del culto o haz una transferencia indicando tu nombre." maxLength="1000" /></label><small>Estas instrucciones aparecerán justo después de enviar la inscripción. No escribas números de tarjeta.</small></div>}
            </>}
            <div className="admin-wizard-toggles">
              <label><input type="checkbox" checked={form.published} onChange={(e) => update('published', e.target.checked)} /><span><strong>Publicar el evento</strong><small>Será visible en la web.</small></span></label>
              <label><input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} /><span><strong>Marcar como destacado</strong><small>Tendrá más presencia en la web.</small></span></label>
              <label><input type="checkbox" checked={form.allow_photo_uploads} onChange={(e) => update('allow_photo_uploads', e.target.checked)} /><span><strong>Permitir fotos</strong><small>Se podrán añadir imágenes después.</small></span></label>
            </div>
          </>}

          {step === 4 && <>
            <div className="admin-wizard-heading"><p className="admin-kicker">Todo preparado</p><h3>Revisa el evento antes de guardarlo</h3><p>Aún no se ha guardado nada. Puedes volver a cualquier apartado para corregirlo.</p></div>
            <div className="admin-event-summary">
              <article><div><span>Evento</span><strong>{form.title}</strong><p>{form.category} · {form.description}</p></div><button type="button" onClick={() => setStep(0)}>Editar</button></article>
              <article><div><span>Fecha y lugar</span><strong>{formatEventDate(form.starts_at)}</strong><p>{form.location} · {eventStatusLabels[form.status]}</p></div><button type="button" onClick={() => setStep(1)}>Editar</button></article>
              <article><div><span>Inscripciones</span><strong>{form.registration_enabled ? `Sí${form.capacity ? ` · Hasta ${form.capacity} personas` : ' · Sin límite'}` : 'Evento informativo · sin inscripción'}</strong><p>{form.registration_enabled && (form.registration_opens_at || form.registration_closes_at) ? `${form.registration_opens_at ? `Abre ${formatEventDate(form.registration_opens_at)}` : 'Sin fecha de apertura'} · ${form.registration_closes_at ? `Cierra ${formatEventDate(form.registration_closes_at)}` : 'Sin fecha de cierre'}` : !form.registration_enabled ? `Contacto: ${form.contact_name} · ${form.contact_phone || form.contact_email}` : 'Sin fechas adicionales'}</p></div><button type="button" onClick={() => setStep(2)}>Editar</button></article>
              <article><div><span>Precio, menús y publicación</span><strong>{priceSummary}</strong><p>{form.registration_enabled ? eventMenuLabel(form) : 'Sin menús'} · {form.published ? 'Publicado' : 'Oculto'}{form.featured ? ' · Destacado' : ''}{form.allow_photo_uploads ? ' · Admite fotos' : ''}</p>{form.payment_instructions && <p><b>Pago:</b> {form.payment_instructions}</p>}</div><button type="button" onClick={() => setStep(3)}>Editar</button></article>
            </div>
          </>}
        </section>

        <div className={`admin-wizard-feedback ${error ? 'has-error' : ''}`} aria-live="polite">{error || 'Completa este paso para continuar.'}</div>
        <footer className="admin-wizard-actions">
          <button type="button" className="admin-secondary" onClick={step === 0 ? onClose : () => { setError(''); setStep((current) => current - 1) }}>{step === 0 ? 'Cancelar' : <><ChevronLeft size={17} /> Atrás</>}</button>
          {step < eventWizardSteps.length - 1
            ? <button className="admin-primary">Siguiente <ChevronRight size={17} /></button>
            : <button className="admin-primary">Guardar evento <Check size={17} /></button>}
        </footer>
      </form>
    </div>
  )
}

function UserEditor({ currentUser, roles, onSave, onClose }) {
  const availableRoles = roles.filter((role) => currentUser.role === 'developer' || role.base_role !== 'admin')
  const initialRole = availableRoles.find((role) => role.base_role === 'event_manager') || availableRoles[0]
  const [form, setForm] = useState({ ...emptyUser, role: initialRole?.base_role || 'viewer', role_template_id: initialRole?.id })
  const update = (key, next) => setForm((current) => ({ ...current, [key]: next }))

  return (
    <div className="admin-modal" role="presentation">
      <button className="admin-modal__backdrop" onClick={onClose} aria-label="Cerrar editor" />
      <form className="admin-modal__panel admin-modal__panel--small" onSubmit={(e) => { e.preventDefault(); onSave(form) }}>
        <header><div><p className="admin-kicker">Equipo</p><h2>Nuevo usuario</h2></div><button type="button" className="admin-icon" onClick={onClose} aria-label="Cerrar"><X /></button></header>
        <label>Nombre completo<input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required minLength="2" /></label>
        <label>Email<input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required /></label>
        <PasswordInput label="Contraseña temporal" value={form.password} onChange={(value) => update('password', value)} autoComplete="new-password" helper="Mínimo 12 caracteres. El usuario tendrá que cambiarla al iniciar sesión." />
        <label>Rol<select value={form.role_template_id || ''} onChange={(e) => { const selected = availableRoles.find((role) => role.id === Number(e.target.value)); setForm((current) => ({ ...current, role_template_id: selected.id, role: selected.base_role })) }}>{availableRoles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label>
        <footer><button type="button" className="admin-secondary" onClick={onClose}>Cancelar</button><button className="admin-primary">Crear usuario</button></footer>
      </form>
    </div>
  )
}

function RegistrationEditor({ events, churches, onSave, onClose }) {
  const [form, setForm] = useState({
    event_id: events[0]?.id?.toString() || '', full_name: '', email: '', phone: '',
    church_affiliation: 'unknown', church_name: '', city: '', country: '',
    adults: 1, children: 0, adult_menus: 0, child_menus: 0, dietary_notes: '', transport_notes: '', status: 'confirmed',
    privacy_accepted: false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const churchOptions = buildChurchOptions(churches)
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const selectedEvent = events.find((item) => item.id === Number(form.event_id))

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave({
        eventId: Number(form.event_id),
        payload: {
          ...form,
          event_id: undefined,
          adults: Number(form.adults),
          children: Number(form.children),
          adult_menus: Number(form.adult_menus),
          child_menus: Number(form.child_menus),
        },
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-modal" role="presentation">
      <button className="admin-modal__backdrop" onClick={onClose} aria-label="Cerrar formulario" />
      <form className="admin-modal__panel admin-modal__panel--small admin-registration-editor" onSubmit={submit}>
        <header><div><p className="admin-kicker">Alta asistida</p><h2>Nueva inscripción</h2></div><button type="button" className="admin-icon" onClick={onClose} aria-label="Cerrar"><X /></button></header>
        <p className="admin-registration-editor__intro">Añade a una persona que necesita ayuda para inscribirse.</p>
        <div className="admin-registration-grid">
          <label className="wide">Evento<select value={form.event_id} onChange={(e) => setForm((current) => ({ ...current, event_id: e.target.value, adult_menus: 0, child_menus: 0 }))} required>{events.map((item) => <option value={item.id} key={item.id}>{item.title} · {new Date(item.starts_at).toLocaleDateString('es-ES')}</option>)}</select></label>
          <label className="wide">Nombre y apellidos<input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required minLength="2" /></label>
          <label>Email <small>(opcional)</small><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></label>
          <label>Teléfono <small>(opcional)</small><input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} /></label>
          <label className="wide">Iglesia de procedencia <small>(opcional)</small><select value={form.church_affiliation} onChange={(e) => update('church_affiliation', e.target.value)}>{churchOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          {['other_church', 'av_other'].includes(form.church_affiliation) && <label className="wide">Nombre de la iglesia<input value={form.church_name} onChange={(e) => update('church_name', e.target.value)} /></label>}
          <label>Ciudad<input value={form.city} onChange={(e) => update('city', e.target.value)} /></label>
          <label>País<input value={form.country} onChange={(e) => update('country', e.target.value)} /></label>
          <label>Adultos<input type="number" min="0" max="20" value={form.adults} onChange={(e) => update('adults', e.target.value)} required /></label>
          <label>Niños<input type="number" min="0" max="20" value={form.children} onChange={(e) => update('children', e.target.value)} required /></label>
          {selectedEvent?.menu_enabled && <><label>Menús de adulto<input type="number" min="0" max={form.adults || 0} value={form.adult_menus} onChange={(e) => update('adult_menus', e.target.value)} /></label><label>Menús infantiles<input type="number" min="0" max={form.children || 0} value={form.child_menus} onChange={(e) => update('child_menus', e.target.value)} /></label></>}
          <label className="wide">Estado inicial<select value={form.status} onChange={(e) => update('status', e.target.value)}><option value="confirmed">Confirmada</option><option value="pending">Pendiente</option></select></label>
          <label className="wide">Alergias o necesidades alimentarias<textarea rows="2" value={form.dietary_notes} onChange={(e) => update('dietary_notes', e.target.value)} /></label>
          <label className="wide">Necesidades de transporte<textarea rows="2" value={form.transport_notes} onChange={(e) => update('transport_notes', e.target.value)} /></label>
        </div>
        <label className="admin-registration-consent"><input type="checkbox" checked={form.privacy_accepted} onChange={(e) => update('privacy_accepted', e.target.checked)} required /> La persona ha autorizado el tratamiento de sus datos para gestionar la inscripción y mantener su ficha de contacto.</label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <footer><button type="button" className="admin-secondary" onClick={onClose}>Cancelar</button><button className="admin-primary" disabled={saving || events.length === 0}>{saving ? 'Guardando…' : 'Añadir inscripción'} <Check size={17} /></button></footer>
      </form>
    </div>
  )
}

function EventManagement({ eventId, canManage, onBack, notify, onRegistrationsChanged }) {
  const [data, setData] = useState(null)
  const [activeView, setActiveView] = useState('people')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tableForm, setTableForm] = useState({ name: '', capacity: 8, notes: '' })

  const reload = async () => {
    try {
      setError('')
      setData(await api.eventManagement(eventId))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    api.eventManagement(eventId)
      .then((result) => { if (active) setData(result) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [eventId])

  const updateRegistration = async (registrationId, changes, message) => {
    try {
      await api.updateRegistration(registrationId, changes)
      await reload()
      await onRegistrationsChanged()
      if (message) notify(message)
    } catch (requestError) { notify(requestError.message) }
  }

  const createTable = async (event) => {
    event.preventDefault()
    try {
      await api.createEventTable(eventId, { ...tableForm, capacity: Number(tableForm.capacity) })
      setTableForm({ name: '', capacity: 8, notes: '' })
      await reload()
      notify('Mesa creada correctamente')
    } catch (requestError) { notify(requestError.message) }
  }

  const removeTable = async (table) => {
    if (!window.confirm(`Se eliminará ${table.name} y sus asignaciones. ¿Continuar?`)) return
    try { await api.deleteEventTable(eventId, table.id); await reload(); notify('Mesa eliminada') } catch (requestError) { notify(requestError.message) }
  }

  const assignTable = async (registration, tableId) => {
    try {
      await api.assignRegistrationTable(registration.id, tableId ? Number(tableId) : null, tableId ? registration.attendees : null)
      await reload()
      notify(tableId ? 'Mesa asignada' : 'Asignación de mesa eliminada')
    } catch (requestError) { notify(requestError.message) }
  }

  if (loading) return <section className="admin-event-management admin-panel"><p>Cargando gestión del evento…</p></section>
  if (error) return <section className="admin-event-management admin-panel"><button className="admin-secondary" onClick={onBack}><ArrowLeft size={17} /> Volver</button><p className="admin-error" role="alert">{error}</p></section>
  if (!data) return null

  const activeRegistrations = data.registrations.filter((item) => item.status !== 'cancelled')
  const people = activeRegistrations.reduce((total, item) => total + item.attendees, 0)
  const paid = activeRegistrations.filter((item) => item.payment_status === 'paid').length
  const pendingPayments = activeRegistrations.filter((item) => item.payment_status === 'pending').length
  const transportPending = activeRegistrations.filter((item) => item.transport_status === 'pending').length
  const money = (item) => Number(item.amount_cents || 0).toLocaleString('es-ES', { style: 'currency', currency: item.payment_currency || data.event.currency || 'EUR' })

  return <section className="admin-event-management">
    <header className="admin-event-management__hero">
      <button className="admin-event-management__back" onClick={onBack}><ArrowLeft size={17} /> Todos los eventos</button>
      <div><p className="admin-kicker">Coordinación del evento</p><h2>{data.event.title}</h2><span>{formatEventDate(data.event.starts_at)} · {data.event.location}</span></div>
    </header>

    <div className="admin-event-management__metrics">
      <article><Users /><span>Personas</span><strong>{people}</strong></article>
      <article><UserCheck /><span>Inscripciones</span><strong>{activeRegistrations.length}</strong></article>
      <article><CircleDollarSign /><span>Pagos pendientes</span><strong>{pendingPayments}</strong><small>{paid} pagados</small></article>
      <article><Bus /><span>Transporte pendiente</span><strong>{transportPending}</strong></article>
    </div>

    <nav className="admin-event-management__tabs" aria-label="Áreas de gestión">
      <button className={activeView === 'people' ? 'active' : ''} onClick={() => setActiveView('people')}><Users /> Personas y pagos</button>
      <button className={activeView === 'tables' ? 'active' : ''} onClick={() => setActiveView('tables')}><TableProperties /> Mesas</button>
      <button className={activeView === 'transport' ? 'active' : ''} onClick={() => setActiveView('transport')}><Bus /> Transporte</button>
    </nav>

    {activeView === 'people' && <div className="admin-management-sheet">
      <div className="admin-management-sheet__heading"><div><p className="admin-kicker">Lista operativa</p><h3>Personas inscritas</h3></div><span>{people} plazas en total</span></div>
      {data.registrations.length === 0 ? <div className="admin-management-empty"><Users /><strong>Todavía no hay inscripciones</strong><span>Las personas aparecerán aquí cuando se apunten.</span></div> : <div className="admin-table-wrap"><table><thead><tr><th>Persona</th><th>Plazas</th><th>Menús</th><th>Estado</th><th>Importe</th><th>Pago</th></tr></thead><tbody>{data.registrations.map((item) => <tr key={item.id}><td><strong>{item.full_name}</strong><small>{item.email || item.phone || 'Sin contacto'}</small></td><td>{item.attendees}<small>{item.adults} adultos · {item.children} niños</small></td><td>{item.adult_menus + item.child_menus}<small>{item.dietary_notes || 'Sin observaciones'}</small></td><td>{canManage ? <select value={item.status} onChange={(event) => updateRegistration(item.id, { status: event.target.value }, 'Estado de inscripción actualizado')}><option value="pending">Pendiente</option><option value="confirmed">Confirmada</option><option value="waitlist">En espera</option><option value="cancelled">Cancelada</option></select> : item.status}</td><td>{money(item)}</td><td>{item.payment_status === 'not_required' ? <span className="admin-payment-tag is-free">No requiere</span> : canManage ? <button className={`admin-payment-toggle ${item.payment_status === 'paid' ? 'is-paid' : ''}`} onClick={() => updateRegistration(item.id, { payment_status: item.payment_status === 'paid' ? 'pending' : 'paid' }, item.payment_status === 'paid' ? 'Pago marcado como pendiente' : 'Pago confirmado')}>{item.payment_status === 'paid' ? <><Check /> Pagado</> : 'Marcar pagado'}</button> : item.payment_status}</td></tr>)}</tbody></table></div>}
    </div>}

    {activeView === 'tables' && <div className="admin-management-sheet admin-management-tables">
      <div className="admin-management-sheet__heading"><div><p className="admin-kicker">Distribución</p><h3>Plano de mesas</h3><p>Crea las mesas solo cuando el evento las necesite.</p></div></div>
      {canManage && <form className="admin-table-creator" onSubmit={createTable}><label>Nombre<input value={tableForm.name} onChange={(event) => setTableForm((current) => ({ ...current, name: event.target.value }))} placeholder="Mesa 1" required /></label><label>Plazas<input type="number" min="1" max="100" value={tableForm.capacity} onChange={(event) => setTableForm((current) => ({ ...current, capacity: event.target.value }))} required /></label><label>Observaciones<input value={tableForm.notes} onChange={(event) => setTableForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Familias, jóvenes…" /></label><button className="admin-primary"><Plus size={17} /> Crear mesa</button></form>}
      {data.tables.length === 0 ? <div className="admin-management-empty"><TableProperties /><strong>Este evento todavía no tiene mesas</strong><span>Si no hacen falta, puedes dejar esta sección vacía.</span></div> : <div className="admin-table-plan">{data.tables.map((table) => <article key={table.id}><div className="admin-table-plan__circle"><strong>{table.occupied}</strong><span>de {table.capacity}</span></div><div><h4>{table.name}</h4><p>{table.notes || 'Sin observaciones'}</p><div className="admin-table-plan__bar"><span style={{ width: `${Math.min(100, (table.occupied / table.capacity) * 100)}%` }} /></div></div>{canManage && <button onClick={() => removeTable(table)} aria-label={`Eliminar ${table.name}`}><Trash2 /></button>}</article>)}</div>}
      <div className="admin-table-assignments"><h4>Asignar personas</h4>{activeRegistrations.map((item) => <label key={item.id}><span><strong>{item.full_name}</strong><small>{item.attendees} plazas</small></span><select value={item.table_id || ''} disabled={!canManage || data.tables.length === 0} onChange={(event) => assignTable(item, event.target.value)}><option value="">Sin mesa</option>{data.tables.map((table) => <option key={table.id} value={table.id}>{table.name} · {table.capacity - table.occupied} libres</option>)}</select></label>)}</div>
    </div>}

    {activeView === 'transport' && <div className="admin-management-sheet">
      <div className="admin-management-sheet__heading"><div><p className="admin-kicker">Llegadas y salidas</p><h3>Transporte</h3><p>Registra quién necesita ayuda y qué vehículo o responsable se le ha asignado.</p></div></div>
      {activeRegistrations.length === 0 ? <div className="admin-management-empty"><Bus /><strong>No hay personas para coordinar</strong></div> : <div className="admin-transport-list">{activeRegistrations.map((item) => <article key={item.id}><div><strong>{item.full_name}</strong><span>{item.phone || item.email || 'Sin contacto'} · {item.attendees} personas</span></div><label>Estado<select value={item.transport_status || 'not_required'} disabled={!canManage} onChange={(event) => updateRegistration(item.id, { transport_status: event.target.value }, 'Transporte actualizado')}><option value="not_required">No necesita</option><option value="pending">Necesita transporte</option><option value="assigned">Asignado</option><option value="completed">Completado</option></select></label><label>Vehículo o responsable<input defaultValue={item.transport_vehicle || ''} disabled={!canManage} placeholder="Furgoneta 1 · Hno. Luis" onBlur={(event) => { if (event.target.value !== (item.transport_vehicle || '')) updateRegistration(item.id, { transport_vehicle: event.target.value }, 'Vehículo actualizado') }} /></label><label className="wide">Observaciones<input defaultValue={item.transport_notes || ''} disabled={!canManage} placeholder="Punto de recogida, horario…" onBlur={(event) => { if (event.target.value !== (item.transport_notes || '')) updateRegistration(item.id, { transport_notes: event.target.value }, 'Observaciones actualizadas') }} /></label></article>)}</div>}
    </div>}
  </section>
}

export function AdminApp() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const [section, setSection] = useState('overview')
  const [navOpen, setNavOpen] = useState(false)
  const [events, setEvents] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [people, setPeople] = useState([])
  const [peopleRegistrationRequests, setPeopleRegistrationRequests] = useState([])
  const [churches, setChurches] = useState([])
  const [prayerRequests, setPrayerRequests] = useState([])
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [newsletterProvider, setNewsletterProvider] = useState(null)
  const [audit, setAudit] = useState([])
  const [eventEditor, setEventEditor] = useState(null)
  const [userEditor, setUserEditor] = useState(false)
  const [registrationEditor, setRegistrationEditor] = useState(false)
  const [passwordEditor, setPasswordEditor] = useState(false)
  const [passwordResetUser, setPasswordResetUser] = useState(null)
  const [eventManagementId, setEventManagementId] = useState(null)
  const [notice, setNotice] = useState('')

  const canEditEvents = hasScreenAccess(user, 'events', 'manage')
  const canManageRegistrations = hasScreenAccess(user, 'registrations', 'manage')
  const canManageUsers = hasScreenAccess(user, 'users', 'manage')
  const canManageNewsletter = hasScreenAccess(user, 'newsletter', 'manage')
  const canViewRegistrations = hasScreenAccess(user, 'registrations')
  const canManagePeople = hasScreenAccess(user, 'people', 'manage')
  const canManageSettings = hasScreenAccess(user, 'settings', 'manage')

  const loadData = async (profile) => {
    const safe = async (promise, fallback = []) => { try { return await promise } catch (error) { if (error.status === 401) throw error; return fallback } }
    const canReadNewsletter = hasScreenAccess(profile, 'newsletter')
    const [eventData, registrationData, peopleData, peopleRequestData, churchData, prayerData, userData, roleData, subscriberData, campaignData, providerData, auditData] = await Promise.all([
      hasScreenAccess(profile, 'events') ? safe(api.adminEvents()) : [],
      hasScreenAccess(profile, 'registrations') ? safe(api.registrations()) : [],
      hasScreenAccess(profile, 'people') ? safe(api.people()) : [],
      hasScreenAccess(profile, 'people') ? safe(api.peopleRegistrationRequests()) : [],
      hasScreenAccess(profile, 'settings') ? safe(api.adminChurches()) : (hasScreenAccess(profile, 'people') || hasScreenAccess(profile, 'registrations')) ? safe(api.churches()) : [],
      hasScreenAccess(profile, 'prayer') ? safe(api.prayerRequests()) : [],
      hasScreenAccess(profile, 'users') ? safe(api.users()) : [],
      hasScreenAccess(profile, 'roles') ? safe(api.roles()) : hasScreenAccess(profile, 'users') ? safe(api.userRoleOptions()) : [],
      canReadNewsletter ? safe(api.newsletterSubscribers()) : [],
      canReadNewsletter ? safe(api.newsletterCampaigns()) : [],
      canReadNewsletter ? safe(api.newsletterProviderStatus(), {}) : {},
      hasScreenAccess(profile, 'audit') ? safe(api.audit()) : [],
    ])
    setEvents(eventData); setRegistrations(registrationData); setPeople(peopleData); setPeopleRegistrationRequests(peopleRequestData); setChurches(churchData); setPrayerRequests(prayerData); setUsers(userData); setRoles(roleData); setSubscribers(subscriberData); setCampaigns(campaignData); setNewsletterProvider(providerData); setAudit(auditData)
  }

  const reloadRoles = async () => setRoles(await api.roles())

  const reloadPeople = async () => setPeople(await api.people())
  const reloadPeopleRegistrations = async () => setPeopleRegistrationRequests(await api.peopleRegistrationRequests())
  const reloadChurches = async () => setChurches(await api.adminChurches())
  const reloadPrayer = async () => setPrayerRequests(await api.prayerRequests())

  const reloadNewsletter = async () => {
    const [subscriberData, campaignData, providerData] = await Promise.all([
      api.newsletterSubscribers(), api.newsletterCampaigns(), api.newsletterProviderStatus(),
    ])
    setSubscribers(subscriberData); setCampaigns(campaignData); setNewsletterProvider(providerData)
  }

  useEffect(() => {
    api.me().then((profile) => { setUser(profile); setSection((current) => allowedSection(profile, current)); return profile.must_change_password ? undefined : loadData(profile) }).catch(() => setUser(null)).finally(() => setChecking(false))
  }, [])

  useEffect(() => {
    const expired = (event) => { setUser(null); setNotice(event.detail || 'Tu sesión ha caducado. Inicia sesión de nuevo.') }
    window.addEventListener('av:session-expired', expired)
    return () => window.removeEventListener('av:session-expired', expired)
  }, [])

  const permissionSignature = JSON.stringify(user?.permissions || {})
  useEffect(() => {
    if (!user?.id || user.must_change_password) return undefined
    let active = true
    const refreshPermissions = async () => {
      try {
        const profile = await api.me()
        if (!active) return
        const changed = JSON.stringify(profile.permissions || {}) !== permissionSignature || profile.role !== user.role
        setUser(profile)
        setSection((current) => allowedSection(profile, current))
        if (changed) {
          await loadData(profile)
          setNotice('Tus permisos se han actualizado automáticamente.')
        }
      } catch (error) {
        if (error.status !== 401 && active) setNotice(error.message)
      }
    }
    const onVisibility = () => { if (document.visibilityState === 'visible') refreshPermissions() }
    const interval = window.setInterval(refreshPermissions, 12000)
    window.addEventListener('focus', refreshPermissions)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      active = false
      window.clearInterval(interval)
      window.removeEventListener('focus', refreshPermissions)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [user?.id, user?.role, user?.must_change_password, permissionSignature])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 5000)
    return () => window.clearTimeout(timer)
  }, [notice])

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

  const permanentlyDeleteUser = async (id) => {
    if (!window.confirm('Esta eliminación es definitiva y no se puede deshacer. ¿Continuar?')) return
    try { await api.deleteUser(id); setUsers(await api.users()); setNotice('Usuario eliminado definitivamente') } catch (error) { setNotice(error.message) }
  }

  const updateUser = async (id, changes) => {
    try {
      await api.updateUser(id, changes)
      setUsers(await api.users())
      setNotice('Usuario actualizado')
    } catch (error) { setNotice(error.message) }
  }

  const changeOwnPassword = async (payload) => {
    const profile = await api.changePassword(payload)
    setUser(profile)
    setPasswordEditor(false)
    await loadData(profile)
    setNotice('Contraseña cambiada correctamente. Las demás sesiones se han cerrado.')
  }

  const resetUserPassword = async (password) => {
    await api.updateUser(passwordResetUser.id, { password })
    setUsers(await api.users())
    setPasswordResetUser(null)
    setNotice('Contraseña temporal restablecida. El usuario deberá cambiarla al iniciar sesión.')
  }

  const updateUserPermissions = async (id, permissions) => {
    try {
      await api.updateUserPermissions(id, permissions)
      setUsers(await api.users())
      setNotice('Directivas actualizadas. El usuario las recibirá automáticamente sin cerrar sesión.')
    } catch (error) { setNotice(error.message) }
  }

  const updateRegistration = async (id, changes) => {
    try { await api.updateRegistration(id, changes); setRegistrations(await api.registrations()) } catch (error) { setNotice(error.message) }
  }

  const createRegistration = async ({ eventId, payload }) => {
    const created = await api.createRegistration(eventId, payload)
    setRegistrations(await api.registrations())
    if (hasScreenAccess(user, 'people')) setPeople(await api.people())
    setRegistrationEditor(false)
    setNotice(created.status === 'waitlist' ? 'Inscripción añadida a la lista de espera' : 'Inscripción añadida correctamente')
  }

  const logout = async () => { await api.logout().catch(() => {}); setUser(null) }
  const switchSection = (next) => {
    setSection(next); setEventManagementId(null); setNavOpen(false)
    if (next === 'people') Promise.all([reloadPeople(), reloadPeopleRegistrations()]).catch((error) => setNotice(error.message))
    if (next === 'settings') reloadChurches().catch((error) => setNotice(error.message))
  }

  const metrics = useMemo(() => ({
    upcoming: events.filter((event) => new Date(event.starts_at) >= new Date()).length,
    registrations: registrations.filter((item) => item.status !== 'cancelled').reduce((total, item) => total + item.attendees, 0),
    pendingPayments: registrations.filter((item) => item.payment_status === 'pending').length,
    subscribers: subscribers.filter((item) => item.status === 'active').length,
  }), [events, registrations, subscribers])

  if (checking) return <div className="admin-loading">Comprobando sesión…</div>
  if (!user) return <Login onLogin={(profile) => { setUser(profile); setSection(allowedSection(profile)); if (!profile.must_change_password) loadData(profile) }} />
  if (user.must_change_password) return <PasswordEditor forced onSave={changeOwnPassword} onClose={logout} />

  const navigation = [
    ['overview', LayoutDashboard, 'Resumen'], ['events', CalendarDays, 'Eventos'],
    ['registrations', ClipboardList, 'Inscripciones'], ['people', ContactRound, 'Personas'], ['welcome', UserCheck, 'Bienvenidas'], ['prayer', Heart, 'Oración'], ['photos', Images, 'Fotos'],
    ['users', Users, 'Usuarios'], ['roles', ShieldCheck, 'Roles'],
    ['newsletter', Mail, 'Newsletter'], ['settings', Settings2, 'Configuración'],
    ['audit', FileClock, 'Auditoría'],
  ].filter(([key]) => hasScreenAccess(user, key))

  return (
    <div className="admin-shell">
      <button className="admin-mobile-toggle" onClick={() => setNavOpen(true)} aria-label="Abrir navegación"><Menu /></button>
      {navOpen && <button className="admin-mobile-backdrop" onClick={() => setNavOpen(false)} aria-label="Cerrar navegación" />}
      <aside className={navOpen ? 'admin-sidebar is-open' : 'admin-sidebar'}>
        <header><img src="/brand/av-barcelona-norte.png" alt="Alcance Victoria Barcelona Norte" /><button className="admin-sidebar__close" onClick={() => setNavOpen(false)} aria-label="Cerrar"><X /></button></header>
        <nav>{navigation.map(([key, Icon, label]) => <button key={key} className={section === key ? 'active' : ''} onClick={() => switchSection(key)}><Icon size={18} /> {label}</button>)}</nav>
        <footer><div><strong>{user.full_name}</strong><span>{user.role_name || roleLabels[user.role]}</span></div><button onClick={() => setPasswordEditor(true)} aria-label="Abrir mi cuenta y cambiar contraseña" title="Mi cuenta"><KeyRound size={18} /></button><button onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={18} /></button></footer>
      </aside>

      <main className="admin-content">
        <header className="admin-topbar"><div><p className="admin-kicker">Organización</p><h1>{eventManagementId ? 'Gestión de evento' : navigation.find(([key]) => key === section)?.[2]}</h1></div><a href="/">Ir al inicio <ArrowLeft size={16} /></a></header>
        {notice && <div className="admin-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Cerrar"><X size={16} /></button><span className="admin-notice__timer" aria-hidden="true" /></div>}

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

        {section === 'events' && eventManagementId && <EventManagement eventId={eventManagementId} canManage={canManageRegistrations} onBack={() => setEventManagementId(null)} notify={setNotice} onRegistrationsChanged={async () => setRegistrations(await api.registrations())} />}

        {section === 'events' && !eventManagementId && <section className="admin-panel">
          <div className="admin-panel__heading"><div><p className="admin-kicker">Programación</p><h2>Eventos</h2><p>Configura plazas, precio, inscripción y subida de fotos en cada actividad.</p></div>{canEditEvents && <button className="admin-primary" onClick={() => setEventEditor({})}><Plus size={18} /> Nuevo evento</button>}</div>
          <div className="admin-list">{events.map((event) => <article key={event.id}><div className="admin-date"><strong>{new Date(event.starts_at).getDate()}</strong><span>{new Date(event.starts_at).toLocaleDateString('es-ES', { month: 'short' })}</span></div><div className="admin-list__body"><div className="admin-tags"><span>{event.category}</span><span>{event.status}</span>{event.registration_enabled && <span>Inscripción</span>}{event.menu_enabled && <span>Menús</span>}<span>{eventPriceLabel(event)}</span></div><h3>{event.title}</h3><p>{event.location} · {new Date(event.starts_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</p></div>{(canEditEvents || canViewRegistrations) && <div className="admin-row-actions admin-event-actions">{canViewRegistrations && <button className="admin-manage-event" onClick={() => setEventManagementId(event.id)}><ClipboardList /> Gestión</button>}{canEditEvents && <><button onClick={() => setEventEditor(event)} aria-label="Editar"><Pencil /></button><button className="danger" onClick={() => removeEvent(event.id)} aria-label="Eliminar"><Trash2 /></button></>}</div>}</article>)}</div>
        </section>}

        {section === 'registrations' && <section className="admin-panel">
          <div className="admin-panel__heading"><div><p className="admin-kicker">Participación</p><h2>Inscripciones</h2><p>Asistencia, necesidades, transporte y estado del pago.</p></div>{canManageRegistrations && <button className="admin-primary" onClick={() => setRegistrationEditor(true)} disabled={events.length === 0}><Plus size={18} /> Añadir persona</button>}</div>
          <div className="admin-table-wrap"><table><thead><tr><th>Persona</th><th>Evento</th><th>Plazas</th><th>Adultos / niños</th><th>Menús A / N</th><th>Estado</th><th>Pago</th><th>Acciones</th></tr></thead><tbody>{registrations.map((item) => <tr key={item.id}><td><strong>{item.full_name}</strong><small>{item.email || item.phone || 'Sin contacto'}</small></td><td>{item.event_title}</td><td>{item.attendees}</td><td>{item.adults ?? item.attendees} / {item.children ?? 0}</td><td>{item.adult_menus ?? 0} / {item.child_menus ?? 0}</td><td><span className={`admin-status ${item.status}`}>{registrationStatusLabels[item.status] || item.status}</span></td><td>{paymentStatusLabels[item.payment_status] || item.payment_status}</td><td>{canManageRegistrations && <div className="admin-inline-actions"><button onClick={() => updateRegistration(item.id, { status: 'confirmed' })}>Confirmar</button>{item.payment_status === 'pending' && <button onClick={() => updateRegistration(item.id, { payment_status: 'paid' })}>Marcar pagado</button>}</div>}</td></tr>)}</tbody></table></div>
        </section>}

        {section === 'people' && <PeopleAdmin people={people} registrationRequests={peopleRegistrationRequests} events={events} churches={churches} canManage={canManagePeople} reload={reloadPeople} reloadRegistrationRequests={reloadPeopleRegistrations} notify={setNotice} />}

        {section === 'welcome' && <WelcomeAdmin canManage={hasScreenAccess(user, 'welcome', 'manage')} notify={setNotice} />}

        {section === 'prayer' && <PrayerAdmin requests={prayerRequests} canManage={hasScreenAccess(user, 'prayer', 'manage')} reload={reloadPrayer} notify={setNotice} />}

        {section === 'photos' && <section className="admin-empty-module"><Images /><h2>Galerías por evento</h2><p>La base de datos ya relaciona fotos, eventos e inscripciones. La subida de archivos se conectará cuando se decida el almacenamiento definitivo.</p></section>}

        {section === 'users' && <section className="admin-panel"><div className="admin-panel__heading"><div><p className="admin-kicker">Accesos</p><h2>Usuarios y directivas</h2><p>Activa o pausa accesos. La eliminación definitiva solo aparece cuando el usuario está desactivado.</p></div>{canManageUsers && <button className="admin-primary" onClick={() => setUserEditor(true)}><Plus size={18} /> Nuevo usuario</button>}</div><div className="admin-user-grid">{users.map((item) => {
          const canEditTarget = canManageUsers && item.id !== user.id && (user.role === 'developer' || !['developer', 'admin'].includes(item.role))
          const assignableRoles = roles.filter((role) => user.role === 'developer' || role.base_role !== 'admin')
          return <article key={item.id} className={!item.active ? 'is-disabled' : ''}>
            <div className="admin-avatar">{item.full_name.slice(0, 2).toUpperCase()}</div>
            <div><h3>{item.full_name}</h3><p>{item.email}</p>
              {canEditTarget ? <label className="admin-role-select"><ShieldCheck size={14} /><select value={item.permissions_custom ? 'custom' : (item.role_template_id || '')} onChange={(event) => updateUser(item.id, { role_template_id: Number(event.target.value) })} aria-label={`Rol de ${item.full_name}`}>{item.permissions_custom && <option value="custom" disabled>Personalizado</option>}{assignableRoles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label> : <span className="admin-role"><ShieldCheck size={14} /> {item.role_name || roleLabels[item.role]}</span>}
              {item.must_change_password && <span className="admin-password-pending"><KeyRound size={13} /> Cambio pendiente</span>}
            </div>
            <div className="admin-user-state"><label className="admin-user-toggle"><input type="checkbox" checked={item.active} disabled={!canEditTarget} onChange={(event) => updateUser(item.id, { active: event.target.checked })} /><span aria-hidden="true" /><b>{item.active ? 'ON' : 'OFF'}</b></label>{canEditTarget && <button className="admin-icon" onClick={() => setPasswordResetUser(item)} aria-label={`Restablecer contraseña de ${item.full_name}`} title="Restablecer contraseña"><KeyRound /></button>}{canEditTarget && !item.active && user.role === 'developer' && <button className="admin-icon danger" onClick={() => permanentlyDeleteUser(item.id)} aria-label={`Eliminar definitivamente a ${item.full_name}`} title="Eliminar definitivamente"><Trash2 /></button>}</div>
            <div className="admin-user-permissions"><div className="admin-user-permissions__heading"><strong>Directivas por pantalla</strong><span>{item.role === 'developer' ? 'Acceso total protegido' : item.permissions_custom ? 'Rol PERSONALIZADO' : canEditTarget ? 'Cambiar una directiva lo convertirá en Personalizado' : 'Solo lectura'}</span></div><div className="admin-user-permissions__grid">{permissionScreens.map(([screen, label]) => <label key={screen}><span>{label}</span><select value={item.permissions?.[screen] || rolePermissionFallback[item.role]?.[screen] || 'none'} disabled={!canEditTarget || item.role === 'developer'} onChange={(event) => updateUserPermissions(item.id, { [screen]: event.target.value })} aria-label={`${label} para ${item.full_name}`}>{Object.entries(permissionLevelLabels).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>)}</div></div>
          </article>
        })}</div></section>}

        {section === 'newsletter' && <NewsletterAdmin subscribers={subscribers} campaigns={campaigns} provider={newsletterProvider} canManage={canManageNewsletter} reload={reloadNewsletter} notify={setNotice} />}

        {section === 'roles' && <RolesAdmin roles={roles} screens={permissionScreens} currentUser={user} canManage={user.role === 'developer'} reload={reloadRoles} notify={setNotice} />}

        {section === 'settings' && <SettingsAdmin churches={churches} canManage={canManageSettings} reloadChurches={reloadChurches} notify={setNotice} />}

        {section === 'audit' && <section className="admin-panel"><div className="admin-panel__heading"><div><p className="admin-kicker">Seguridad</p><h2>Auditoría</h2><p>Registro de accesos y cambios administrativos.</p></div></div><div className="admin-audit-list">{audit.map((item) => <article key={item.id}><FileClock /><div><strong>{item.action} · {item.entity_type}</strong><span>{item.user_email || 'Sistema'} · {new Date(item.created_at).toLocaleString('es-ES')}</span></div></article>)}</div></section>}
      </main>

      {eventEditor && <EventEditor value={eventEditor.id ? eventEditor : null} onSave={saveEvent} onClose={() => setEventEditor(null)} />}
      {userEditor && <UserEditor currentUser={user} roles={roles} onSave={createUser} onClose={() => setUserEditor(false)} />}
      {registrationEditor && <RegistrationEditor events={events} churches={churches} onSave={createRegistration} onClose={() => setRegistrationEditor(false)} />}
      {passwordEditor && <PasswordEditor onSave={changeOwnPassword} onClose={() => setPasswordEditor(false)} />}
      {passwordResetUser && <PasswordEditor target={passwordResetUser} onSave={resetUserPassword} onClose={() => setPasswordResetUser(null)} />}
    </div>
  )
}
