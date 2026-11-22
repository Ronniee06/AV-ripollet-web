import { useMemo, useState } from 'react'
import { Building2, CalendarDays, CheckCircle2, ClipboardCheck, Mail, MapPin, Pencil, Phone, Plus, Search, ShieldAlert, UserRound, UsersRound, X, XCircle } from 'lucide-react'
import { api } from '../api'
import { buildChurchOptions, churchLabel, personTypeLabel, personTypeOptions } from '../churches'

const emptyPerson = {
  full_name: '', email: '', phone: '', person_type: 'unknown', church_affiliation: 'unknown',
  church_name: '', city: '', country: '', notes: '',
}

function PersonEditor({ person, churchOptions, onClose, onSaved, notify }) {
  const [form, setForm] = useState(person ? { ...emptyPerson, ...person } : emptyPerson)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (person?.id) await api.updatePerson(person.id, form)
      else await api.createPerson(form)
      await onSaved()
      notify(person?.id ? 'Ficha actualizada' : 'Persona añadida al directorio')
      onClose()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return <div className="admin-modal" role="presentation">
    <button className="admin-modal__backdrop" onClick={onClose} aria-label="Cerrar ficha" />
    <form className="admin-modal__panel admin-person-editor" onSubmit={submit}>
      <header><div><p className="admin-kicker">Directorio</p><h2>{person ? 'Editar persona' : 'Nueva persona'}</h2></div><button type="button" className="admin-icon" onClick={onClose} aria-label="Cerrar"><X /></button></header>
      <div className="admin-person-editor__grid">
        <label className="wide">Nombre y apellidos<input value={form.full_name} onChange={(event) => update('full_name', event.target.value)} required minLength="2" /></label>
        <label>Email<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} /></label>
        <label>Teléfono<input type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} /></label>
        <label>Tipo de persona<select value={form.person_type} onChange={(event) => update('person_type', event.target.value)}>{personTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label>Iglesia de procedencia<select value={form.church_affiliation} onChange={(event) => update('church_affiliation', event.target.value)}>{churchOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        {(form.church_affiliation === 'other_church' || form.church_affiliation === 'av_other') && <label className="wide">Nombre de la iglesia<input value={form.church_name} onChange={(event) => update('church_name', event.target.value)} /></label>}
        <label>Ciudad<input value={form.city} onChange={(event) => update('city', event.target.value)} /></label>
        <label>País<input value={form.country} onChange={(event) => update('country', event.target.value)} /></label>
        <label className="wide">Observaciones internas<textarea rows="3" value={form.notes} onChange={(event) => update('notes', event.target.value)} /></label>
      </div>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <footer><button type="button" className="admin-secondary" onClick={onClose}>Cancelar</button><button className="admin-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar ficha'}</button></footer>
    </form>
  </div>
}

const requestStatusLabels = {
  pending_verification: 'Pendiente de verificar', pending_review: 'Pendiente de revisión',
  kept_existing: 'Conservó su ficha', applied: 'Aplicada', rejected: 'Rechazada',
}
const relationshipLabels = {
  new: 'Está conociendo la iglesia', regular: 'Asiste regularmente', member: 'Considera esta su iglesia',
  volunteer: 'Forma parte y sirve', prefer_discuss: 'Prefiere hablarlo personalmente',
}
const interestLabels = {
  discipleship: 'Discipulado', prayer: 'Oración', families: 'Familias', youth: 'Jóvenes',
  outreach: 'Alcance', service: 'Servir', life_groups: 'Grupos de vida',
}

function RegistrationRequests({ requests, people, canManage, onChanged, notify }) {
  const [targets, setTargets] = useState({})
  const [busy, setBusy] = useState(null)
  const resolve = async (request, action) => {
    setBusy(request.id)
    try {
      await api.resolvePeopleRegistration(request.id, {
        action,
        merge_person_id: targets[request.id] ? Number(targets[request.id]) : null,
        apply_updates: true,
        notes: '',
      })
      await onChanged()
      notify(action === 'approve' ? 'Solicitud aplicada a Personas' : 'Solicitud rechazada')
    } catch (error) { notify(error.message) } finally { setBusy(null) }
  }
  if (requests.length === 0) return <div className="admin-management-empty"><ClipboardCheck /><strong>No hay solicitudes de registro</strong><span>Las nuevas fichas enviadas desde la web aparecerán aquí.</span></div>
  return <div className="admin-people-requests">{requests.map((request) => <article key={request.id} className={`is-${request.status}`}>
    <header><div><span className={`admin-status ${request.status}`}>{requestStatusLabels[request.status] || request.status}</span><h3>{request.full_name}</h3><p>{relationshipLabels[request.relationship]}</p></div><time>{new Date(request.created_at).toLocaleDateString('es-ES')}</time></header>
    <div className="admin-people-request__contact">{request.email && <span><Mail /> {request.email}</span>}{request.phone && <span><Phone /> {request.phone}</span>}{request.city && <span><MapPin /> {[request.city, request.country].filter(Boolean).join(', ')}</span>}</div>
    {request.interests.length > 0 && <div className="admin-people-request__interests">{request.interests.map((interest) => <span key={interest}>{interestLabels[interest] || interest}</span>)}</div>}
    {request.newsletter_opt_in && <div className="admin-people-request__newsletter"><Mail /><span>Ha confirmado que quiere recibir noticias de la iglesia.</span></div>}
    {request.match_kind === 'existing' && <div className="admin-people-request__match"><CheckCircle2 /><span>Coincide con <strong>{request.matched_person_name}</strong>{request.matched_person_email ? ` · ${request.matched_person_email}` : ''}</span></div>}
    {request.match_kind === 'conflict' && <div className="admin-people-request__match conflict"><ShieldAlert /><span>El correo y el teléfono apuntan a fichas distintas. Elige manualmente la ficha correcta.</span></div>}
    {request.status === 'pending_review' && canManage && <footer>
      {(request.match_kind === 'conflict' || !request.matched_person_id) && <label>Aplicar sobre una ficha existente <small>(opcional)</small><select value={targets[request.id] || ''} onChange={(event) => setTargets((current) => ({ ...current, [request.id]: event.target.value }))}><option value="">Crear una ficha nueva</option>{people.map((person) => <option key={person.id} value={person.id}>{person.full_name} · {person.email || person.phone || 'sin contacto'}</option>)}</select></label>}
      <div><button className="admin-secondary danger" disabled={busy === request.id} onClick={() => resolve(request, 'reject')}><XCircle /> Rechazar</button><button className="admin-primary" disabled={busy === request.id || (request.match_kind === 'conflict' && !targets[request.id])} onClick={() => resolve(request, 'approve')}><CheckCircle2 /> {request.matched_person_id || targets[request.id] ? 'Actualizar ficha' : 'Crear ficha'}</button></div>
    </footer>}
  </article>)}</div>
}

export function PeopleAdmin({ people, registrationRequests, events, churches, canManage, reload, reloadRegistrationRequests, notify }) {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [church, setChurch] = useState('all')
  const [eventId, setEventId] = useState('all')
  const [editor, setEditor] = useState(null)
  const [view, setView] = useState('directory')
  const churchOptions = useMemo(() => buildChurchOptions(churches), [churches])

  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('es')
    return people.filter((person) => {
      const matchesSearch = !needle || [person.full_name, person.email, person.phone, person.city, person.country, person.church_name]
        .some((value) => (value || '').toLocaleLowerCase('es').includes(needle))
      return matchesSearch
        && (type === 'all' || person.person_type === type)
        && (church === 'all' || person.church_affiliation === church)
        && (eventId === 'all' || person.event_ids.includes(Number(eventId)))
    })
  }, [people, search, type, church, eventId])

  const avPeople = people.filter((person) => person.person_type === 'av_member').length
  const guests = people.filter((person) => person.person_type === 'guest').length
  const pendingRequests = registrationRequests.filter((request) => request.status === 'pending_review').length

  return <section className="admin-people">
    <div className="admin-people__hero">
      <div><p className="admin-kicker">Comunidad</p><h2>Personas</h2><p>Una ficha por persona, con su procedencia y los eventos en los que ha participado.</p></div>
      {canManage && <button className="admin-primary" onClick={() => setEditor({ mode: 'new' })}><Plus size={18} /> Añadir persona</button>}
      <div className="admin-people__counts"><span><strong>{people.length}</strong> contactos</span><span><strong>{avPeople}</strong> de AV</span><span><strong>{guests}</strong> invitados</span></div>
    </div>

    <div className="admin-people__views" role="tablist" aria-label="Secciones de Personas">
      <button role="tab" aria-selected={view === 'directory'} className={view === 'directory' ? 'active' : ''} onClick={() => setView('directory')}><UsersRound /> Directorio</button>
      <button role="tab" aria-selected={view === 'requests'} className={view === 'requests' ? 'active' : ''} onClick={() => setView('requests')}><ClipboardCheck /> Solicitudes {pendingRequests > 0 && <span>{pendingRequests}</span>}</button>
    </div>

    {view === 'directory' && <>
      <div className="admin-people__filters">
        <label className="admin-people-search"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nombre, email, teléfono o ciudad" /></label>
        <label><span>Tipo</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="all">Todos</option>{personTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label><span>Iglesia</span><select value={church} onChange={(event) => setChurch(event.target.value)}><option value="all">Todas</option>{churchOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label><span>Evento</span><select value={eventId} onChange={(event) => setEventId(event.target.value)}><option value="all">Todos</option>{events.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
      </div>

      <div className="admin-people__result"><span>{filtered.length} {filtered.length === 1 ? 'persona encontrada' : 'personas encontradas'}</span>{(search || type !== 'all' || church !== 'all' || eventId !== 'all') && <button onClick={() => { setSearch(''); setType('all'); setChurch('all'); setEventId('all') }}>Limpiar filtros</button>}</div>

      {filtered.length === 0 ? <div className="admin-management-empty"><UsersRound /><strong>No hay personas con esos filtros</strong><span>Prueba otra búsqueda o limpia los filtros.</span></div> : <div className="admin-people-grid">{filtered.map((person) => <article key={person.id}>
        <div className="admin-person-card__stripe" data-affiliation={person.church_affiliation} />
        <div className="admin-person-card__head"><div className="admin-person-card__avatar">{person.full_name.slice(0, 2).toUpperCase()}</div><div><span>{personTypeLabel(person.person_type)}</span><h3>{person.full_name}</h3><p><Building2 /> {churchLabel(person.church_affiliation, person.church_name, churches)}</p></div>{canManage && <button onClick={() => setEditor(person)} aria-label={`Editar ${person.full_name}`}><Pencil /></button>}</div>
        <div className="admin-person-card__contact">{person.email && <span><Mail /> {person.email}</span>}{person.phone && <span><Phone /> {person.phone}</span>}{(person.city || person.country) && <span><MapPin /> {[person.city, person.country].filter(Boolean).join(', ')}</span>}{!person.email && !person.phone && !person.city && !person.country && <span><UserRound /> Datos de contacto pendientes</span>}</div>
        <footer><span><CalendarDays /> {person.registration_count} {person.registration_count === 1 ? 'inscripción' : 'inscripciones'}</span><small>{person.last_registration_at ? `Última: ${new Date(person.last_registration_at).toLocaleDateString('es-ES')}` : 'Añadida manualmente'}</small></footer>
      </article>)}</div>}
    </>}

    {view === 'requests' && <RegistrationRequests requests={registrationRequests} people={people} canManage={canManage} onChanged={() => Promise.all([reload(), reloadRegistrationRequests()])} notify={notify} />}

    {editor && <PersonEditor person={editor.mode === 'new' ? null : editor} churchOptions={churchOptions} onClose={() => setEditor(null)} onSaved={reload} notify={notify} />}
  </section>
}
