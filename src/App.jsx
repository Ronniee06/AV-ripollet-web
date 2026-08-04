import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, CalendarDays, Camera, Check, ChevronDown, CirclePlay, Clock3,
  MapPin, Menu, MessageCircleHeart, MessagesSquare, Pencil, Plus, Send, Trash2,
  Users, X,
} from 'lucide-react'
import { api } from './api'

const socials = [
  { name: 'YouTube', url: 'https://www.youtube.com/@alcancevictoriabcnn', icon: CirclePlay },
  { name: 'Instagram', url: 'https://www.instagram.com/avbcnnorte/', icon: Camera },
  { name: 'Facebook', url: 'https://www.facebook.com/alcance.barcelonanorte/?locale=es_ES', icon: MessagesSquare },
]

const schedule = [
  { day: 'Miércoles', name: 'Discipulado', time: '19:30' },
  { day: 'Viernes', name: 'Ayuno y oración', time: '19:30' },
  { day: 'Sábado', name: 'Jóvenes G.A.N.G.', time: '17:30' },
  { day: '1er domingo', name: 'Súper Celebración', time: '10:00' },
  { day: 'Otros domingos', name: 'Celebración', time: '10:00 · 12:00' },
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

const emptyEvent = {
  title: '', description: '', starts_at: '', location: 'Alcance Victoria Barcelona Norte',
  category: 'Celebración', featured: false, published: true,
}

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
        <a href="#nosotros">Nosotros</a><a href="#valores">Valores</a><a href="#horarios">Horarios</a><a href="#eventos">Eventos</a>
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
        <p>El primer domingo de cada mes celebramos juntos en un único servicio especial a las 10:00.</p>
      </div>
      <div className="schedule__list">
        {schedule.map((item) => <div className="schedule__row" key={item.day}><span>{item.day}</span><strong>{item.name}</strong><time>{item.time}</time></div>)}
      </div>
    </section>
  )
}

function EventCard({ event }) {
  const date = new Date(event.starts_at)
  return (
    <article className={`event-card ${event.featured ? 'event-card--featured' : ''}`}>
      <div className="event-card__date"><strong>{date.toLocaleDateString('es-ES', { day: '2-digit' })}</strong><span>{date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}</span></div>
      <div><span className="tag">{event.category}</span><h3>{event.title}</h3><p>{event.description}</p><div className="event-card__meta"><span><Clock3 size={15} /> {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span><span><MapPin size={15} /> {event.location}</span></div></div>
    </article>
  )
}

function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.events().then(setEvents).catch(() => setEvents([])).finally(() => setLoading(false)) }, [])
  return (
    <section className="section events" id="eventos">
      <div className="section-heading section-heading--ink"><div><p className="eyebrow">Próximamente</p><h2>Momentos para<br />{' '}vivir en comunidad.</h2></div><a className="inline-link" href="/gestion">Gestionar eventos <ArrowRight size={17} /></a></div>
      <div className="events__grid">
        {loading && <p className="empty">Cargando próximos eventos…</p>}
        {!loading && events.length === 0 && <div className="empty-state"><CalendarDays /><h3>Pronto habrá nuevos encuentros</h3><p>Mientras tanto, te esperamos en nuestras reuniones semanales.</p></div>}
        {events.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
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
        <source
          type="image/avif"
          srcSet="/media/pastors-juan-capi-720.avif 720w, /media/pastors-juan-capi-1080.avif 1080w, /media/pastors-juan-capi-1439.avif 1439w"
          sizes="(max-width: 900px) 100vw, 50vw"
        />
        <source
          type="image/webp"
          srcSet="/media/pastors-juan-capi-720.webp 720w, /media/pastors-juan-capi-1080.webp 1080w, /media/pastors-juan-capi-1439.webp 1439w"
          sizes="(max-width: 900px) 100vw, 50vw"
        />
        <img src="/media/pastors-juan-capi-1080.webp" alt="Pastora Capi compartiendo la Palabra junto al Pastor Juan P. Zamora" loading="lazy" decoding="async" width="1439" height="1440" />
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

function Visit() {
  return (
    <section className="visit" id="visitanos"><div><p className="eyebrow">Ven a conocernos</p><h2>Este domingo,<br />{' '}te esperamos.</h2></div><div><p><MapPin /> Ripollet, Barcelona</p><p><Clock3 /> Domingos · 10:00 y 12:00</p><a className="button" target="_blank" rel="noreferrer" href="https://www.google.com/maps/search/?api=1&query=Alcance+Victoria+Barcelona+Norte+Ripollet">Cómo llegar <ArrowRight size={17} /></a></div></section>
  )
}

function Footer() {
  return <footer><Brand light /><p>Una iglesia para toda la familia en Ripollet.</p><div className="socials">{socials.map(({ name, url, icon: Icon }) => <a key={name} href={url} target="_blank" rel="noreferrer" aria-label={name}><Icon /></a>)}</div><small>© {new Date().getFullYear()} Alcance Victoria Barcelona Norte</small></footer>
}

function Home() { return <><a className="skip-link" href="#contenido">Saltar al contenido</a><Hero /><main id="contenido" tabIndex="-1"><Intro /><Values /><Schedule /><Events /><Ministries /><CommunityGallery /><Pastors /><Prayer /><Visit /></main><Footer /></> }

function EventForm({ value, onSave, onCancel }) {
  const [form, setForm] = useState(value || emptyEvent)
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  return (
    <form className="event-form" onSubmit={(e) => { e.preventDefault(); onSave({ ...form, starts_at: new Date(form.starts_at).toISOString() }) }}>
      <div className="form-title"><div><p className="eyebrow">Editor de eventos</p><h2>{form.id ? 'Editar evento' : 'Nuevo evento'}</h2></div><button type="button" className="icon-button" onClick={onCancel}><X /></button></div>
      <label>Título<input value={form.title} onChange={(e) => update('title', e.target.value)} required minLength="3" /></label>
      <label>Descripción<textarea value={form.description} onChange={(e) => update('description', e.target.value)} required minLength="10" rows="4" /></label>
      <div className="form-grid"><label>Fecha y hora<input type="datetime-local" value={form.starts_at?.slice(0, 16)} onChange={(e) => update('starts_at', e.target.value)} required /></label><label>Categoría<input value={form.category} onChange={(e) => update('category', e.target.value)} required /></label></div>
      <label>Lugar<input value={form.location} onChange={(e) => update('location', e.target.value)} required /></label>
      <div className="checks"><label><input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} /> Destacado</label><label><input type="checkbox" checked={form.published} onChange={(e) => update('published', e.target.checked)} /> Publicado</label></div>
      <button className="button">Guardar evento <Check size={17} /></button>
    </form>
  )
}

function Admin() {
  const [key, setKey] = useState(() => sessionStorage.getItem('av-admin-key') || '')
  const [events, setEvents] = useState([]), [editing, setEditing] = useState(null), [message, setMessage] = useState('')
  const load = () => api.events(key).then(setEvents).catch((e) => setMessage(e.message))
  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const save = async (event) => { try { await api.saveEvent(event, key); sessionStorage.setItem('av-admin-key', key); setEditing(null); setMessage('Evento guardado'); load() } catch (e) { setMessage(e.message) } }
  const remove = async (id) => { if (!window.confirm('¿Eliminar este evento?')) return; try { await api.deleteEvent(id, key); load() } catch (e) { setMessage(e.message) } }
  const sorted = useMemo(() => [...events].sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)), [events])
  return (
    <div className="admin"><header className="admin__header"><Brand light /><a href="/">Ver web <ArrowRight size={16} /></a></header><main className="admin__main">
      <div className="admin__top"><div><p className="eyebrow">Organización</p><h1>Gestión de eventos</h1><p>Crea y publica los próximos encuentros de la iglesia.</p></div><button className="button button--coral" onClick={() => setEditing(emptyEvent)}><Plus /> Nuevo evento</button></div>
      <div className="admin-key"><label>Clave de gestión<input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Solo si está configurada en la API" /></label><button className="button button--small" onClick={load}>Conectar</button></div>
      {message && <div className="notice">{message}<button onClick={() => setMessage('')}><X size={16} /></button></div>}
      <div className="admin__list">{sorted.length === 0 && <div className="empty-state"><CalendarDays /><h3>No hay eventos todavía</h3><p>Crea el primero para mostrarlo en la web.</p></div>}{sorted.map((event) => <article key={event.id}><div className="admin-date"><strong>{new Date(event.starts_at).getDate()}</strong><span>{new Date(event.starts_at).toLocaleDateString('es-ES', { month: 'short' })}</span></div><div><div className="admin-tags"><span className="tag">{event.category}</span>{!event.published && <span className="tag tag--muted">Borrador</span>}</div><h3>{event.title}</h3><p>{event.location} · {new Date(event.starts_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</p></div><div className="admin-actions"><button onClick={() => setEditing(event)} aria-label="Editar"><Pencil /></button><button onClick={() => remove(event.id)} aria-label="Eliminar"><Trash2 /></button></div></article>)}</div>
    </main>{editing && <div className="modal"><div className="modal__backdrop" onClick={() => setEditing(null)} /><EventForm value={editing} onSave={save} onCancel={() => setEditing(null)} /></div>}</div>
  )
}

export default function App() { return window.location.pathname.startsWith('/gestion') ? <Admin /> : <Home /> }
