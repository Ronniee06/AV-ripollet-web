import { useMemo, useState } from 'react'
import { Check, Heart, LockKeyhole, Mail } from 'lucide-react'
import { api } from '../api'

const statusLabels = {
  new: 'Nueva', praying: 'En oración', completed: 'Atendida', archived: 'Archivada',
}

function PrayerCard({ item, canManage, onChanged, notify }) {
  const [notes, setNotes] = useState(item.internal_notes || '')
  const [saving, setSaving] = useState(false)

  const update = async (changes, message) => {
    setSaving(true)
    try {
      await api.updatePrayerRequest(item.id, changes)
      await onChanged()
      notify(message)
    } catch (error) {
      notify(error.message)
    } finally {
      setSaving(false)
    }
  }

  return <article className={`admin-prayer-card status-${item.status}`}>
    <header>
      <div><strong>{item.name}</strong><span>{new Date(item.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</span></div>
      <div className="admin-prayer-badges">{item.private && <span><LockKeyhole /> Privada</span>}<span>{statusLabels[item.status]}</span></div>
    </header>
    <p>{item.message}</p>
    {item.email && <a href={`mailto:${item.email}`}><Mail /> {item.email}</a>}
    <div className="admin-prayer-actions">
      <label>Seguimiento<select value={item.status} disabled={!canManage || saving} onChange={(event) => update({ status: event.target.value }, 'Estado de la petición actualizado')}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Notas internas<textarea value={notes} disabled={!canManage || saving} onChange={(event) => setNotes(event.target.value)} placeholder="Responsable, conversación o próximos pasos…" /></label>
      {canManage && <button className="admin-secondary" disabled={saving || notes === (item.internal_notes || '')} onClick={() => update({ internal_notes: notes }, 'Notas internas guardadas')}><Check /> {saving ? 'Guardando…' : 'Guardar notas'}</button>}
    </div>
  </article>
}

export function PrayerAdmin({ requests, canManage, reload, notify }) {
  const [filter, setFilter] = useState('active')
  const visible = useMemo(() => requests.filter((item) => filter === 'all' || (filter === 'active' ? !['completed', 'archived'].includes(item.status) : item.status === filter)), [requests, filter])
  const pending = requests.filter((item) => ['new', 'praying'].includes(item.status)).length

  return <section className="admin-panel">
    <div className="admin-panel__heading"><div><p className="admin-kicker">Cuidado pastoral</p><h2>Peticiones de oración</h2><p>{pending} pendientes. Su contenido es confidencial y solo lo ven usuarios autorizados.</p></div><label className="admin-prayer-filter">Mostrar<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="active">Pendientes</option><option value="new">Nuevas</option><option value="praying">En oración</option><option value="completed">Atendidas</option><option value="archived">Archivadas</option><option value="all">Todas</option></select></label></div>
    {visible.length ? <div className="admin-prayer-list">{visible.map((item) => <PrayerCard key={item.id} item={item} canManage={canManage} onChanged={reload} notify={notify} />)}</div> : <div className="admin-management-empty"><Heart /><strong>No hay peticiones en esta vista</strong><span>Las nuevas solicitudes aparecerán aquí.</span></div>}
  </section>
}
