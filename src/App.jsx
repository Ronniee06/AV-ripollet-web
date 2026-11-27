import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight, CalendarDays, Check, ChevronDown, Clock3,
  Mail, MapPin, Menu, MessageCircleHeart, Phone, Send, UserPlus, Users, X,
} from 'lucide-react'
import { api } from './api'
import { AdminApp } from './admin/AdminApp'
import { buildChurchOptions } from './churches'
import { RegistrationConfirmation, RegistrationPage } from './RegistrationPage'

function YouTubeLogo() {
  return <svg viewBox="0 0 576 512" aria-hidden="true"><path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.5-48.6C458.8 64 288 64 288 64S117.2 64 74.8 75.5c-23.7 6.3-42.2 24.9-48.5 48.6C15 166.9 15 256.4 15 256.4s0 89.4 11.3 132.3c6.3 23.7 24.8 41.5 48.5 47.8C117.2 448 288 448 288 448s170.8 0 213.2-11.5c23.7-6.3 42.2-24.1 48.5-47.8 11.3-42.9 11.3-132.3 11.3-132.3s0-89.5-11.3-132.3zM232.1 337.6V175.2l142.8 81.2-142.8 81.2z" /></svg>
}

function InstagramLogo() {
  return <svg viewBox="0 0 448 512" aria-hidden="true"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9S121.4 442.6 92 430.6c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" /></svg>
}

function FacebookLogo() {
  return <svg viewBox="0 0 320 512" aria-hidden="true"><path d="M279.1 288l14.2-92.7h-88.9v-60.1c0-25.4 12.4-50.1 52.2-50.1H297V6.3S260.4 0 225.4 0c-73.2 0-121.1 44.4-121.1 124.7v70.6H22.9V288h81.4v224h100.2V288z" /></svg>
}

const socials = [
  { name: 'YouTube', slug: 'youtube', url: 'https://www.youtube.com/@alcancevictoriabcnn', icon: YouTubeLogo },
  { name: 'Instagram', slug: 'instagram', url: 'https://www.instagram.com/avbcnnorte/', icon: InstagramLogo },
  { name: 'Facebook', slug: 'facebook', url: 'https://www.facebook.com/alcance.barcelonanorte/?locale=es_ES', icon: FacebookLogo },
]

const newsletterEnabled = import.meta.env.VITE_NEWSLETTER_ENABLED === 'true'

const schedule = [
  { day: 'Miércoles', name: 'Discipulado', time: '20:00' },
  { day: 'Viernes', name: 'Ayuno y oración', time: '20:00' },
  { day: 'Sábado', name: 'Jóvenes G.A.N.G.', time: '17:30' },
  { day: 'Domingos', name: 'Celebración', time: '10:00' },
]

const ministries = [
  { icon: Users, title: 'Familias', copy: 'Un espacio para crecer juntos, fortalecer vínculos y caminar en la fe.' },
  { logo: '/brand/gang-white.png', title: 'Jóvenes G.A.N.G.', copy: 'Una generación que descubre su propósito y transforma su ciudad.' },
  { icon: MessageCircleHeart, title: 'Oración', copy: 'Creemos en una iglesia que escucha, acompaña y ora en todo momento.' },
]

const fiveEs = [
  { letter: 'E', title: 'Exaltar', copy: 'Ponemos a Cristo en el centro por medio de la oración, la Palabra, la alabanza y la adoración.' },
  { letter: 'E', title: 'Envisionar', copy: 'Ayudamos a cada persona a descubrir el propósito y el potencial que Dios ha puesto en su vida.' },
  { letter: 'E', title: 'Evangelizar', copy: 'Compartimos el mensaje de esperanza de Jesús con nuestra ciudad y con las naciones.' },
  { letter: 'E', title: 'Establecer', copy: 'Acompañamos a las personas para que crezcan en carácter, relaciones y madurez espiritual.' },
  { letter: 'E', title: 'Equipar', copy: 'Formamos discípulos y líderes preparados para servir con sus dones y marcar una diferencia.' },
]

const threeCs = [
  { title: 'Comunidad', subtitle: 'Somos familia', copy: 'Un lugar de pertenencia donde damos y recibimos amor, aceptación y respeto.' },
  { title: 'Causa', subtitle: 'Tenemos una misión', copy: 'Vivimos para alcanzar a nuestra ciudad y al mundo con esperanza, valor y compromiso.' },
  { title: 'Corporación', subtitle: 'Servimos con orden', copy: 'Cuidamos la visión con responsabilidad, buena organización y rendición de cuentas.' },
]

function Brand({ light = false }) {
  return (
    <a className={`brand ${light ? 'brand--light' : ''}`} href="/#inicio" aria-label="Ir al inicio">
      <img src="/brand/av-barcelona-norte.png" alt="Alcance Victoria Barcelona Norte" />
    </a>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return (
    <header className="header">
      <Brand />
      <button
        className="menu-button"
        type="button"
        onClick={() => setOpen(!open)}
        aria-controls="primary-navigation"
        aria-expanded={open}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
      >
        {open ? <X /> : <Menu />}
      </button>
      <nav id="primary-navigation" className={open ? 'nav nav--open' : 'nav'} onClick={() => setOpen(false)} aria-label="Navegación principal">
        <a href="#nosotros">Nosotros</a><a href="#valores">Valores</a><a href="#horarios">Horarios</a><a href="#eventos">Eventos</a><a href="/registro">Registro</a>
        <a className="button button--small" href="#visitanos">Quiero visitaros <ArrowRight size={16} /></a>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="inicio">
      <Header />
      <picture className="hero__image" aria-hidden="true">
        <source
          type="image/avif"
          srcSet="/media/hero-barcelona-768.avif 768w, /media/hero-barcelona-1280.avif 1280w, /media/hero-barcelona-2048.avif 2048w"
          sizes="100vw"
        />
        <source
          type="image/webp"
          srcSet="/media/hero-barcelona-768.webp 768w, /media/hero-barcelona-1280.webp 1280w, /media/hero-barcelona-2048.webp 2048w"
          sizes="100vw"
        />
        <img src="/media/hero-barcelona-1280.webp" alt="" width="2048" height="1152" fetchPriority="high" decoding="async" />
      </picture>
      <div className="hero__veil" aria-hidden="true" />
      <div className="hero__content">
        <p className="eyebrow eyebrow--light"><MapPin size={15} /> Ripollet · Barcelona</p>
        <h1>Un lugar que puedes llamar <em>Hogar.</em></h1>
        <p className="hero__slogan">Gente que puedes llamar <strong>Familia.</strong></p>
        <p className="hero__lead">Ven como eres, encuentra esperanza y descubre tu propósito.</p>
        <div className="hero__actions">
          <a className="button button--coral" href="#horarios">Ver horarios <Clock3 size={18} /></a>
          <a className="text-link" href="#nosotros">Conócenos <ArrowRight size={17} /></a>
        </div>
      </div>
      <a href="#nosotros" className="scroll-cue" aria-label="Continuar"><span>Descubre</span><ChevronDown /></a>
    </section>
  )
}

function Intro() {
  return (
    <section className="section intro" id="nosotros">
      <div className="intro__side"><p className="eyebrow">Bienvenido a casa</p><div className="orbit" aria-hidden="true"><span>BCN</span></div></div>
      <div className="intro__copy">
        <h2>Una iglesia que alcanza, restaura y equipa.</h2>
        <p>Somos parte de Alcance Victoria Internacional, un movimiento cristiano nacido con un corazón especial por las personas, las familias y las ciudades.</p>
        <p>Desde Ripollet queremos ser una casa abierta: un lugar donde conocer a Jesús, construir relaciones reales y vivir una fe que transforma nuestro entorno.</p>
        <a className="inline-link" href="https://victoryoutreach.org/?lang=es" target="_blank" rel="noreferrer">Conoce el movimiento internacional <ArrowRight size={17} /></a>
      </div>
    </section>
  )
}

function Values() {
  return (
    <section className="values" id="valores">
      <div className="values__header">
        <div><p className="eyebrow">Nuestros principios</p><h2>Una visión que se convierte en una forma de vivir.</h2></div>
        <p>Las 5E expresan cómo crecemos y servimos. Las 3C explican quiénes somos juntos: una familia, con una misión, que cuida bien lo que Dios ha puesto en sus manos.</p>
      </div>
      <div className="five-es">
        {fiveEs.map((value) => <article key={value.title}><span>{value.letter}</span><div><h3>{value.title}</h3><p>{value.copy}</p></div></article>)}
      </div>
      <div className="three-cs">
        <div className="three-cs__title"><span>3C</span><p>Familia · Misión · Orden</p></div>
        {threeCs.map((value) => <article key={value.title}><small>{value.subtitle}</small><h3>{value.title}</h3><p>{value.copy}</p></article>)}
      </div>
      <a className="values__source" href="https://victoryoutreach.org/wp-content/uploads/2021/08/UWIM-Curriculum.pdf" target="_blank" rel="noreferrer">Conoce los principios fundacionales <ArrowRight size={17} /></a>
    </section>
  )
}

function Schedule() {
  return (
    <section className="schedule section" id="horarios">
      <div className="section-heading">
        <div><p className="eyebrow eyebrow--light">Nos reunimos cada semana</p><h2>Tu próxima<br />{' '}visita empieza aquí.</h2></div>
        <p>Cada domingo celebramos juntos en un único servicio a las 10:00.</p>
      </div>
      <div className="schedule__list">
        {schedule.map((item) => <div className="schedule__row" key={item.day}><span>{item.day}</span><strong>{item.name}</strong><time>{item.time}</time></div>)}
      </div>
    </section>
  )
}

function formatEventPrice(event, cents) {
  return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: event.currency || 'EUR' })
}

function formatRegistrationDate(value) {
  return new Date(value).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })
}

function getRegistrationState(event) {
  if (event.registration_state) return event.registration_state
  if (!event.registration_enabled) return 'disabled'
  const now = new Date()
  if (event.registration_opens_at && now < new Date(event.registration_opens_at)) return 'upcoming'
  if (event.registration_closes_at && now >= new Date(event.registration_closes_at)) return 'closed'
  return 'open'
}

function EventCard({ event, onSelect }) {
  const date = new Date(event.starts_at)
  return (
    <button type="button" className={`event-card ${event.featured ? 'event-card--featured' : ''}`} onClick={() => onSelect(event)} aria-label={`Ver detalles de ${event.title}`}>
      <div className="event-card__date"><strong>{date.toLocaleDateString('es-ES', { day: '2-digit' })}</strong><span>{date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}</span></div>
      <div><span className="tag">{event.category}</span><h3>{event.title}</h3><p>{event.description}</p><div className="event-card__meta"><span><Clock3 size={15} /> {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span><span><MapPin size={15} /> {event.location}</span></div><span className="event-card__action">Ver detalles <ArrowRight size={16} /></span></div>
    </button>
  )
}

function EventDetails({ event, churchOptions, onClose }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', church_affiliation: 'unknown', church_name: '', city: '', country: '', adults: 1, children: 0, adult_menus: 0, child_menus: 0, dietary_notes: '', privacy_accepted: false })
  const [status, setStatus] = useState({ loading: false, error: '', result: null })
  const date = new Date(event.starts_at)
  const registrationState = getRegistrationState(event)
  const canRegister = event.registration_enabled && registrationState === 'open'
  const adults = Number(form.adults || 0)
  const children = Number(form.children || 0)
  const registrationAmount = event.pricing_mode === 'adult_child'
    ? adults * event.adult_price_cents + children * event.child_price_cents
    : (adults + children) * event.price_cents
  const adultMenus = Number(form.adult_menus || 0)
  const childMenus = Number(form.child_menus || 0)
  const menuAmount = event.menu_enabled
    ? adultMenus * event.adult_menu_price_cents + childMenus * event.child_menu_price_cents
    : 0
  const amount = registrationAmount + menuAmount

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (keyboardEvent) => { if (keyboardEvent.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', closeOnEscape) }
  }, [onClose])

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (submitEvent) => {
    submitEvent.preventDefault()
    if (adults + children < 1) { setStatus({ loading: false, error: 'Añade al menos una persona.', result: null }); return }
    if (adultMenus > adults || childMenus > children) { setStatus({ loading: false, error: 'No puedes pedir más menús que personas inscritas.', result: null }); return }
    setStatus({ loading: true, error: '', result: null })
    try {
      const result = await api.registerForEvent(event.id, { ...form, adults, children, attendees: adults + children })
      setStatus({ loading: false, error: '', result })
    } catch (error) { setStatus({ loading: false, error: error.message, result: null }) }
  }

  return (
    <div className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="event-dialog-title">
      <button className="event-dialog__backdrop" onClick={onClose} aria-label="Cerrar detalles del evento" />
      <section className={canRegister ? 'event-dialog__panel' : 'event-dialog__panel event-dialog__panel--details-only'}>
        <button className="event-dialog__close" type="button" onClick={onClose} aria-label="Cerrar"><X /></button>
        <div className="event-dialog__intro">
          <div className="event-dialog__date"><strong>{date.toLocaleDateString('es-ES', { day: '2-digit' })}</strong><span>{date.toLocaleDateString('es-ES', { month: 'long' })}</span></div>
          <span className="tag">{event.category}</span>
          <h2 id="event-dialog-title">{event.title}</h2>
          <p>{event.description}</p>
          <div className="event-dialog__meta"><span><CalendarDays /> {date.toLocaleDateString('es-ES', { dateStyle: 'long' })}</span><span><Clock3 /> {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span><span><MapPin /> {event.location}</span>{event.capacity && <span><Users /> {event.capacity} plazas</span>}{event.registration_enabled && event.registration_opens_at && <span><CalendarDays /> Inscripciones desde {formatRegistrationDate(event.registration_opens_at)}</span>}{event.registration_enabled && event.registration_closes_at && <span><CalendarDays /> Inscripciones hasta {formatRegistrationDate(event.registration_closes_at)}</span>}</div>
          {event.registration_enabled && <div className="event-dialog__prices">
            {event.pricing_mode === 'adult_child' ? <><div><span>Inscripción adulto</span><strong>{formatEventPrice(event, event.adult_price_cents)}</strong></div><div><span>Inscripción infantil · hasta {event.child_age_limit} años</span><strong>{formatEventPrice(event, event.child_price_cents)}</strong></div></> : event.pricing_mode === 'free' ? <div><span>Inscripción al evento</span><strong>Gratis</strong></div> : <div><span>Precio por persona</span><strong>{event.price_cents ? formatEventPrice(event, event.price_cents) : 'Gratis'}</strong></div>}
            {event.menu_enabled && <><div className="event-dialog__price-separator"><span>Menús opcionales · se cobran aparte</span></div><div><span>Menú adulto</span><strong>{formatEventPrice(event, event.adult_menu_price_cents)}</strong></div><div><span>Menú infantil</span><strong>{event.child_menu_price_cents ? formatEventPrice(event, event.child_menu_price_cents) : 'Gratis'}</strong></div></>}
          </div>}
          {!event.registration_enabled && event.contact_name && <div className="event-dialog__contact">
            <span>Evento informativo · no necesita inscripción</span>
            <strong>Consulta con {event.contact_name}</strong>
            <div>{event.contact_phone && <a href={`tel:${event.contact_phone.replace(/[^\d+]/g, '')}`}><Phone /> Llamar</a>}{event.contact_email && <a href={`mailto:${event.contact_email}`}><Mail /> Escribir email</a>}</div>
          </div>}
          {event.registration_enabled && registrationState !== 'open' && <div className={`event-dialog__availability ${registrationState}`}><strong>{registrationState === 'upcoming' ? 'Inscripciones todavía no abiertas' : 'Inscripciones cerradas'}</strong><span>{registrationState === 'upcoming' && event.registration_opens_at ? `El formulario estará disponible desde el ${formatRegistrationDate(event.registration_opens_at)}.` : event.registration_closes_at ? `El plazo finalizó el ${formatRegistrationDate(event.registration_closes_at)}.` : 'El formulario de inscripción ya no está disponible.'}</span></div>}
        </div>
        {canRegister && <div className="event-dialog__registration">
          {status.result ? <div className="event-registration-success"><Check /><h3>Inscripción recibida</h3><p>{status.result.status === 'waitlist' ? 'Os hemos añadido a la lista de espera.' : 'La plaza queda pendiente de confirmación.'}</p>{status.result.registration_amount_cents > 0 && <span>Inscripción: {formatEventPrice(event, status.result.registration_amount_cents)}</span>}{status.result.menu_amount_cents > 0 && <span>Menús: {formatEventPrice(event, status.result.menu_amount_cents)}</span>}{status.result.payment_required && <strong>Total: {formatEventPrice(event, status.result.amount_cents)}</strong>}{status.result.payment_required && <div className="event-payment-instructions"><b>Cómo realizar el pago</b><p>{event.payment_instructions || 'El equipo de inscripciones se pondrá en contacto contigo para indicarte cómo realizar el pago.'}</p></div>}</div> : <form onSubmit={submit}>
            <div><p className="eyebrow">Reserva tu plaza</p><h3>Inscripción</h3></div>
            <label>Nombre y apellidos<input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required minLength="2" /></label>
            <div className="event-registration-grid"><label>Email<input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required /></label><label>Teléfono<input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} /></label></div>
            <fieldset className="event-registration-origin"><legend>Procedencia <span>· opcional</span></legend><label>Iglesia<select value={form.church_affiliation} onChange={(e) => update('church_affiliation', e.target.value)}>{churchOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>{['other_church', 'av_other'].includes(form.church_affiliation) && <label>Nombre de la iglesia<input value={form.church_name} onChange={(e) => update('church_name', e.target.value)} /></label>}<div className="event-registration-grid"><label>Ciudad<input value={form.city} onChange={(e) => update('city', e.target.value)} /></label><label>País<input value={form.country} onChange={(e) => update('country', e.target.value)} /></label></div></fieldset>
            <div className="event-registration-grid"><label>Adultos<input type="number" min="0" max="20" value={form.adults} onChange={(e) => update('adults', e.target.value)} required /></label><label>Niños{event.pricing_mode === 'adult_child' ? ` (hasta ${event.child_age_limit} años)` : ''}<input type="number" min="0" max="20" value={form.children} onChange={(e) => update('children', e.target.value)} required /></label></div>
            {event.menu_enabled && <fieldset className="event-registration-menus"><legend>Menús opcionales <span>· se cobran aparte</span></legend><div className="event-registration-grid"><label>Menús de adulto<input type="number" min="0" max={adults} value={form.adult_menus} onChange={(e) => update('adult_menus', e.target.value)} /></label><label>Menús infantiles<input type="number" min="0" max={children} value={form.child_menus} onChange={(e) => update('child_menus', e.target.value)} /></label></div><small>Puedes inscribir a alguien sin pedirle menú.</small></fieldset>}
            <label>Alergias o necesidades alimentarias<textarea rows="2" value={form.dietary_notes} onChange={(e) => update('dietary_notes', e.target.value)} /></label>
            <label className="event-registration-consent"><input type="checkbox" checked={form.privacy_accepted} onChange={(e) => update('privacy_accepted', e.target.checked)} required /> Acepto el tratamiento de mis datos para gestionar esta inscripción y mantener mi ficha de contacto. <a href="/#privacidad" target="_blank" rel="noreferrer">Ver privacidad</a>.</label>
            {amount > 0 && <div className="event-registration-total"><div><span>Inscripción</span><b>{formatEventPrice(event, registrationAmount)}</b>{event.menu_enabled && <><span>Menús</span><b>{formatEventPrice(event, menuAmount)}</b></>}</div><span>Total previsto</span><strong>{formatEventPrice(event, amount)}</strong></div>}
            {status.error && <p className="form-status error" role="alert">{status.error}</p>}
            <button className="button button--coral" disabled={status.loading}>{status.loading ? 'Enviando…' : 'Solicitar inscripción'} <ArrowRight size={17} /></button>
          </form>}
        </div>}
      </section>
    </div>
  )
}

function Events() {
  const [events, setEvents] = useState([])
  const [churches, setChurches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const loadEvents = () => {
    setLoading(true); setError('')
    Promise.all([api.events(), api.churches().catch(() => [])]).then(([eventData, churchData]) => { setEvents(eventData); setChurches(churchData) }).catch((requestError) => { setEvents([]); setError(requestError.message) }).finally(() => setLoading(false))
  }
  useEffect(() => {
    let active = true
    Promise.all([api.events(), api.churches().catch(() => [])])
      .then(([eventData, churchData]) => { if (active) { setEvents(eventData); setChurches(churchData) } })
      .catch((requestError) => { if (active) { setEvents([]); setError(requestError.message) } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  return (
    <section className="section events" id="eventos">
      <div className="section-heading section-heading--ink"><div><p className="eyebrow">Próximamente</p><h2>Momentos para<br />{' '}vivir en comunidad.</h2></div></div>
      <div className="events__grid">
        {loading && <p className="empty">Cargando próximos eventos…</p>}
        {!loading && error && <div className="empty-state" role="alert"><CalendarDays /><h3>No pudimos cargar los eventos</h3><p>{error}</p><button type="button" className="button" onClick={loadEvents}>Volver a intentar</button></div>}
        {!loading && !error && events.length === 0 && <div className="empty-state"><CalendarDays /><h3>Pronto habrá nuevos encuentros</h3><p>Mientras tanto, te esperamos en nuestras reuniones semanales.</p></div>}
        {events.map((event) => <EventCard key={event.id} event={event} onSelect={setSelectedEvent} />)}
      </div>
      {selectedEvent && <EventDetails event={selectedEvent} churchOptions={buildChurchOptions(churches)} onClose={() => setSelectedEvent(null)} />}
    </section>
  )
}

function Ministries() {
  return (
    <section className="section ministries" id="ministerios">
      <div className="ministries__intro"><p className="eyebrow">Hay sitio para todos</p><h2>Crecer es mejor cuando lo hacemos juntos.</h2></div>
      <div className="ministries__grid">{ministries.map(({ icon: Icon, logo, title, copy }) => <article className={logo ? 'ministry--gang' : ''} key={title}>{logo ? <img src={logo} alt="G.A.N.G. God's Anointed Now Generation" /> : <Icon />}<h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>
  )
}

function CommunityGallery() {
  const photos = [
    { src: '/community/celebracion.webp', label: 'Celebramos juntos', className: 'gallery__wide', width: 512, height: 640 },
    { src: '/community/oracion.webp', label: 'Oramos unos por otros', width: 640, height: 427 },
    { src: '/community/adoracion.webp', label: 'Adoramos con todo el corazón', width: 480, height: 640 },
    { src: '/community/predicacion.webp', label: 'Crecemos en la Palabra', className: 'gallery__wide', width: 640, height: 427 },
  ]
  return (
    <section className="community-gallery">
      <div className="community-gallery__heading"><div><p className="eyebrow eyebrow--light">Así vivimos la comunidad</p><h2>Más que asistir,<br />{' '}pertenecemos.</h2></div><a href="https://www.instagram.com/avbcnnorte/" target="_blank" rel="noreferrer">Síguenos en Instagram <ArrowRight size={17} /></a></div>
      <div className="gallery__grid">{photos.map((photo) => <figure className={photo.className || ''} key={photo.src}><img src={photo.src} alt={photo.label} loading="lazy" decoding="async" width={photo.width} height={photo.height} /><figcaption>{photo.label}</figcaption></figure>)}</div>
    </section>
  )
}

function Pastors() {
  return (
    <section className="pastors">
      <picture className="pastors__visual">
        <img src="/community/pastors-juan-capi-green.png" alt="Pastor Juan P. Zamora y Pastora Capi" loading="lazy" decoding="async" width="1254" height="1254" />
        <span>Sirviendo a Barcelona Norte</span>
      </picture>
      <div className="pastors__copy"><p className="eyebrow">Nuestros pastores</p><h2>Pastor Juan P. Zamora<br />{' '}y Pastora Capi</h2><p>Con un corazón por las personas y por la ciudad, lideran una comunidad donde cada historia importa y cada generación puede encontrar su propósito.</p><blockquote>“Queremos que encuentres una familia, crezcas en tu fe y seas parte de lo que Dios está haciendo.”</blockquote></div>
    </section>
  )
}

function Prayer() {
  const [form, setForm] = useState({ name: '', email: '', message: '', private: true })
  const [status, setStatus] = useState('idle')
  const submit = async (event) => {
    event.preventDefault(); setStatus('sending')
    try { await api.prayer(form); setStatus('done'); setForm({ name: '', email: '', message: '', private: true }) } catch { setStatus('error') }
  }
  return (
    <section className="section prayer" id="oracion">
      <div><p className="eyebrow eyebrow--light">No caminas solo</p><h2>¿Podemos orar por ti?</h2><p>Cuéntanos qué estás viviendo. Tu petición será recibida con respeto y confidencialidad por nuestro equipo.</p></div>
      <form onSubmit={submit}>
        <label>Tu nombre<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength="2" /></label>
        <label>Email <small>(opcional)</small><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label className="full">¿Por qué quieres que oremos?<textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required minLength="10" rows="4" /></label>
        <button className="button button--coral full" disabled={status === 'sending'}>{status === 'sending' ? 'Enviando…' : status === 'done' ? <><Check /> Petición recibida</> : <>Enviar petición <Send size={17} /></>}</button>
        {status === 'error' && <p className="form-error full">No se pudo enviar. Comprueba que la API esté iniciada e inténtalo de nuevo.</p>}
      </form>
    </section>
  )
}

function Newsletter() {
  if (!newsletterEnabled) {
    return (
      <section className="newsletter" aria-labelledby="newsletter-title">
        <div>
          <p className="eyebrow eyebrow--light">Mantente cerca</p>
          <h2 id="newsletter-title">Noticias que fortalecen nuestra comunidad.</h2>
          <p>Este espacio informará próximamente sobre eventos, horarios especiales y novedades de la iglesia.</p>
        </div>
        <div className="newsletter__standby" role="status">
          <Mail aria-hidden="true" />
          <div>
            <strong>Newsletter temporalmente desactivada</strong>
            <p>La información permanece visible, pero ahora mismo no solicitamos datos ni aceptamos suscripciones.</p>
          </div>
        </div>
      </section>
    )
  }

  return <NewsletterSignup />
}

function NewsletterSignup() {
  const [form, setForm] = useState({ full_name: '', email: '', consent: false })
  const [status, setStatus] = useState('idle')
  const submit = async (event) => {
    event.preventDefault(); setStatus('sending')
    try { await api.subscribeNewsletter(form); setStatus('done'); setForm({ full_name: '', email: '', consent: false }) } catch { setStatus('error') }
  }
  return (
    <section className="newsletter">
      <div><p className="eyebrow eyebrow--light">Mantente cerca</p><h2>Noticias que fortalecen nuestra comunidad.</h2><p>Recibe próximos eventos, horarios especiales y novedades de la iglesia.</p></div>
      <form onSubmit={submit}>
        <label>Nombre <small>(opcional)</small><input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></label>
        <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
        <label className="newsletter__consent"><input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} required /> Quiero recibir comunicaciones de Alcance Victoria Barcelona Norte y he leído la <a href="#privacidad">información de privacidad</a>.</label>
        <button className="button button--coral" disabled={status === 'sending'}>{status === 'sending' ? 'Enviando…' : status === 'done' ? <><Check /> Revisa tu correo</> : <>Quiero recibir noticias <Send size={17} /></>}</button>
        {status === 'done' && <p className="newsletter__notice">Te hemos enviado un enlace de confirmación válido durante 24 horas.</p>}
        {status === 'error' && <p className="form-error">No se pudo completar la suscripción. Inténtalo de nuevo.</p>}
      </form>
    </section>
  )
}

function Visit() {
  return (
    <section className="visit" id="visitanos"><div><p className="eyebrow">Ven a conocernos</p><h2>Este domingo,<br />{' '}te esperamos.</h2></div><div><p><MapPin /> Ripollet, Barcelona</p><p><Clock3 /> Domingos · 10:00</p><a className="button" target="_blank" rel="noreferrer" href="https://www.google.com/maps/search/?api=1&query=Alcance+Victoria+Barcelona+Norte+Ripollet">Cómo llegar <ArrowRight size={17} /></a></div></section>
  )
}

function MemberRegistrationCallout() {
  return <section className="member-registration-callout"><div><p className="eyebrow eyebrow--light">Tu lugar en la familia</p><h2>Queremos conocerte<br />y caminar contigo.</h2><p>Si esta es tu iglesia, completa tu ficha para que podamos mantener tus datos al día y acompañarte mejor.</p></div><a className="button button--coral" href="/registro"><UserPlus /> Completar mi registro <ArrowRight /></a></section>
}

function Privacy() {
  return <section className="privacy" id="privacidad"><div><p className="eyebrow">Tus datos importan</p><h2>Información de privacidad</h2></div><div><p><strong>Responsable:</strong> Alcance Victoria Barcelona Norte.</p><p>Usamos los datos que nos das únicamente para mantener la ficha interna de miembros y asistentes, gestionar inscripciones, atender peticiones de oración o enviarte noticias cuando lo has autorizado. La relación con una comunidad religiosa puede revelar información especialmente protegida, por lo que el acceso queda limitado al equipo autorizado y no comunicamos estos datos fuera de la iglesia sin una base válida.</p><p>Puedes solicitar acceso, corrección o eliminación contactando directamente con la iglesia. Conservaremos los datos solo durante el tiempo necesario para cada finalidad y las obligaciones aplicables.</p><small>Antes de publicar comercialmente la plataforma, este texto debe completarse con los datos legales y el canal formal de contacto del responsable.</small></div></section>
}

function Footer() {
  return <footer className="site-footer"><Brand light /><p>Una iglesia para toda la familia en Ripollet.</p><div className="socials">{socials.map(({ name, slug, url, icon: Icon }) => <a className={`socials__${slug}`} key={name} href={url} target="_blank" rel="noreferrer" aria-label={`Visitar ${name}`} title={name}><Icon /></a>)}</div><nav className="footer-links" aria-label="Enlaces legales y de registro"><a href="/registro">Registro</a><a href="#privacidad">Privacidad</a></nav><small>© {new Date().getFullYear()} Alcance Victoria Barcelona Norte</small></footer>
}

function Home() { return <><a className="skip-link" href="#contenido">Saltar al contenido</a><Hero /><main id="contenido" tabIndex="-1"><Intro /><Values /><Schedule /><Events /><Ministries /><CommunityGallery /><Pastors /><Prayer /><Newsletter /><MemberRegistrationCallout /><Visit /><Privacy /></main><Footer /></> }

function NewsletterConfirmation() {
  const token = new URLSearchParams(window.location.search).get('token')
  const requested = useRef(false)
  const [status, setStatus] = useState(token ? 'checking' : 'error')
  const [message, setMessage] = useState(token ? 'Estamos verificando tu enlace…' : 'El enlace de confirmación no es válido.')

  useEffect(() => {
    if (requested.current || !token) return
    requested.current = true
    api.confirmNewsletter(token).then((result) => {
      window.history.replaceState({}, '', '/newsletter/confirm')
      setStatus('success'); setMessage(result.message)
    }).catch((error) => {
      setStatus('error'); setMessage(error.message)
    })
  }, [token])

  return <main className="newsletter-confirmation">
    <section>
      <Brand light />
      <div className={`newsletter-confirmation__icon ${status}`}><Mail /></div>
      <p className="eyebrow eyebrow--light">Newsletter</p>
      <h1>{status === 'success' ? 'Suscripción confirmada' : status === 'error' ? 'No se pudo confirmar' : 'Confirmando…'}</h1>
      <p>{message}</p>
      <a className="button button--coral" href="/">Ir al inicio</a>
    </section>
  </main>
}

export default function App() {
  if (window.location.pathname.startsWith('/gestion')) return <AdminApp />
  if (window.location.pathname.startsWith('/registro/confirm')) return <RegistrationConfirmation />
  if (window.location.pathname.startsWith('/registro')) return <RegistrationPage />
  if (newsletterEnabled && window.location.pathname.startsWith('/newsletter/confirm')) return <NewsletterConfirmation />
  return <Home />
}
