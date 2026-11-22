import { useEffect, useMemo, useState } from 'react'
import { CalendarPlus, Plus, Search, UserRoundPlus, X } from 'lucide-react'
import { api } from '../api'

function localDateTime() {
  const date = new Date()
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

const emptyForm = { full_name: '', email: '', phone: '', notes: '', visited_at: localDateTime(), service_name: 'Servicio dominical' }

function ServicePicker({ services, value, onChange }) {
  const [adding, setAdding] = useState(!services.includes(value))
  const selectValue = adding ? '__new__' : value
  return <label>Servicio
    <select value={selectValue} onChange={(event) => {
      if (event.target.value === '__new__') { setAdding(true); onChange('') }
      else { setAdding(false); onChange(event.target.value) }
    }} required>
      <option value="__new__">＋ Añadir nuevo servicio…</option>
      {services.map((service) => <option key={service} value={service}>{service}</option>)}
    </select>
    {adding && <input className="welcome-new-service" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Nombre del nuevo servicio" autoFocus required minLength="2" />}
  </label>
}

export function WelcomeAdmin({ canManage, notify }) {
  const [people, setPeople] = useState([])
  const [services, setServices] = useState(['Servicio dominical'])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(null)
  const [visit, setVisit] = useState(null)
  const [saving, setSaving] = useState(false)

  const reload = async () => {
    const [nextPeople, nextServices] = await Promise.all([api.welcomePeople(), api.welcomeServices()])
    setPeople(nextPeople); setServices(nextServices)
  }
  useEffect(() => {
    Promise.all([api.welcomePeople(), api.welcomeServices()]).then(([nextPeople, nextServices]) => {
      setPeople(nextPeople); setServices(nextServices)
    }).catch((error) => notify(error.message))
  }, [notify])

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return people
    return people.filter((person) => [person.full_name, person.email, person.phone].some((value) => value?.toLowerCase().includes(term)))
  }, [people, search])

  const createPerson = async (event) => {
    event.preventDefault(); setSaving(true)
    try {
      await api.createWelcomePerson({ ...form, visited_at: new Date(form.visited_at).toISOString() })
      await reload(); setForm(null); notify('Persona añadida a Bienvenidas')
    } catch (error) { notify(error.message) } finally { setSaving(false) }
  }

  const addVisit = async (event) => {
    event.preventDefault(); setSaving(true)
    try {
      await api.addWelcomeVisit(visit.id, { visited_at: new Date(visit.visited_at).toISOString(), service_name: visit.service_name, notes: visit.notes })
      await reload(); setVisit(null); notify('Nueva visita registrada')
    } catch (error) { notify(error.message) } finally { setSaving(false) }
  }

  return <section className="admin-panel welcome-admin">
    <div className="admin-panel__heading"><div><p className="admin-kicker">Acompañamiento</p><h2>Bienvenidas</h2><p>Registra a las personas nuevas y mantén el contacto después de cada visita.</p></div>{canManage && <button className="admin-primary" onClick={() => setForm({ ...emptyForm, visited_at: localDateTime() })}><UserRoundPlus size={18} /> Nueva persona</button>}</div>
    <label className="admin-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, correo o teléfono" /></label>
    {visible.length === 0 ? <div className="admin-management-empty"><UserRoundPlus /><strong>Todavía no hay personas registradas</strong><span>La primera visita aparecerá aquí.</span></div> : <div className="welcome-grid">{visible.map((person) => <article key={person.id}>
      <div className="welcome-count"><strong>{person.visit_count}</strong><span>{person.visit_count === 1 ? 'visita' : 'visitas'}</span></div>
      <div><h3>{person.full_name}</h3><p>{person.phone || person.email || 'Sin datos de contacto'}</p><small>Primera: {new Date(person.first_visit_at).toLocaleDateString('es-ES')} · Última: {new Date(person.last_visit_at).toLocaleDateString('es-ES')}</small>{person.notes && <span className="welcome-notes">{person.notes}</span>}</div>
      {canManage && <button className="admin-secondary" onClick={() => setVisit({ id: person.id, name: person.full_name, visited_at: localDateTime(), service_name: 'Servicio dominical', notes: '' })}><CalendarPlus size={16} /> Registrar visita</button>}
    </article>)}</div>}
    {form && <div className="admin-modal"><button className="admin-modal__backdrop" onClick={() => setForm(null)} aria-label="Cerrar" /><form className="admin-modal__panel admin-modal__panel--small" onSubmit={createPerson}><header><div><p className="admin-kicker">Primera visita</p><h2>Nueva persona</h2></div><button type="button" className="admin-icon" onClick={() => setForm(null)}><X /></button></header><label>Nombre completo<input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></label><div className="admin-form-grid"><label>Teléfono (opcional)<input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><label>Correo (opcional)<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Fecha y hora<input type="datetime-local" value={form.visited_at} onChange={(e) => setForm({ ...form, visited_at: e.target.value })} required /></label><ServicePicker services={services} value={form.service_name} onChange={(serviceName) => setForm({ ...form, service_name: serviceName })} /></div><label>Notas<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label><footer><button type="button" className="admin-secondary" onClick={() => setForm(null)}>Cancelar</button><button className="admin-primary" disabled={saving}>{saving ? 'Guardando…' : 'Añadir persona'} <Plus size={17} /></button></footer></form></div>}
    {visit && <div className="admin-modal"><button className="admin-modal__backdrop" onClick={() => setVisit(null)} aria-label="Cerrar" /><form className="admin-modal__panel admin-modal__panel--small" onSubmit={addVisit}><header><div><p className="admin-kicker">Seguimiento</p><h2>Nueva visita de {visit.name}</h2></div><button type="button" className="admin-icon" onClick={() => setVisit(null)}><X /></button></header><label>Fecha y hora<input type="datetime-local" value={visit.visited_at} onChange={(e) => setVisit({ ...visit, visited_at: e.target.value })} required /></label><ServicePicker services={services} value={visit.service_name} onChange={(serviceName) => setVisit({ ...visit, service_name: serviceName })} /><label>Notas<textarea value={visit.notes} onChange={(e) => setVisit({ ...visit, notes: e.target.value })} /></label><footer><button type="button" className="admin-secondary" onClick={() => setVisit(null)}>Cancelar</button><button className="admin-primary" disabled={saving}>Registrar visita</button></footer></form></div>}
  </section>
}
