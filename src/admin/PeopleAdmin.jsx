import { useMemo, useState } from 'react'
import { Building2, CalendarDays, Mail, MapPin, Pencil, Phone, Plus, Search, UserRound, UsersRound, X } from 'lucide-react'
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

export function PeopleAdmin({ people, events, churches, canManage, reload, notify }) {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [church, setChurch] = useState('all')
  const [eventId, setEventId] = useState('all')
  const [editor, setEditor] = useState(null)
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

  return <section className="admin-people">
    <div className="admin-people__hero">
      <div><p className="admin-kicker">Comunidad</p><h2>Personas</h2><p>Una ficha por persona, con su procedencia y los eventos en los que ha participado.</p></div>
      {canManage && <button className="admin-primary" onClick={() => setEditor({ mode: 'new' })}><Plus size={18} /> Añadir persona</button>}
      <div className="admin-people__counts"><span><strong>{people.length}</strong> contactos</span><span><strong>{avPeople}</strong> de AV</span><span><strong>{guests}</strong> invitados</span></div>
    </div>

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

    {editor && <PersonEditor person={editor.mode === 'new' ? null : editor} churchOptions={churchOptions} onClose={() => setEditor(null)} onSaved={reload} notify={notify} />}
  </section>
}
