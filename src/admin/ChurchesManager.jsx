import { useState } from 'react'
import { Church, MapPin, Pencil, Plus, Power, X } from 'lucide-react'
import { api } from '../api'

const emptyChurch = { name: '', network: 'av', city: '', country: 'España', active: true }

export function ChurchesManager({ churches, canManage = true, onClose, onChanged, notify }) {
  const [form, setForm] = useState(emptyChurch)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const save = async (event) => {
    event.preventDefault()
    setSaving(true); setError('')
    try {
      if (form.id) await api.updateChurch(form.id, form)
      else await api.createChurch(form)
      await onChanged()
      notify(form.id ? 'Iglesia actualizada' : 'Iglesia añadida al catálogo')
      setForm(emptyChurch)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (church) => {
    try {
      await api.updateChurch(church.id, { ...church, active: !church.active })
      await onChanged()
      notify(church.active ? 'Iglesia ocultada de los formularios' : 'Iglesia disponible en los formularios')
    } catch (requestError) { notify(requestError.message) }
  }

  return <div className="admin-modal" role="presentation">
    <button className="admin-modal__backdrop" onClick={onClose} aria-label="Cerrar catálogo de iglesias" />
    <section className="admin-modal__panel admin-church-manager" role="dialog" aria-modal="true" aria-labelledby="church-manager-title">
      <header><div><p className="admin-kicker">Procedencias</p><h2 id="church-manager-title">Iglesias</h2><p>Las iglesias activas aparecen en Personas y en las inscripciones a eventos.</p></div><button type="button" className="admin-icon" onClick={onClose} aria-label="Cerrar"><X /></button></header>
      {canManage ? <form className="admin-church-form" onSubmit={save}>
        <label>Nombre<input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Nombre de la iglesia" required minLength="2" /></label>
        <label>Red<select value={form.network} onChange={(event) => update('network', event.target.value)}><option value="av">Alcance Victoria</option><option value="other">Otra iglesia</option></select></label>
        <label>Ciudad<input value={form.city} onChange={(event) => update('city', event.target.value)} /></label>
        <label>País<input value={form.country} onChange={(event) => update('country', event.target.value)} /></label>
        <div className="admin-church-form__actions">{form.id && <button type="button" className="admin-secondary" onClick={() => setForm(emptyChurch)}>Cancelar edición</button>}<button className="admin-primary" disabled={saving}>{saving ? 'Guardando…' : form.id ? 'Guardar cambios' : <><Plus size={17} /> Añadir iglesia</>}</button></div>
        {error && <p className="admin-error" role="alert">{error}</p>}
      </form> : <p className="admin-church-readonly">Tienes acceso de consulta. Para añadir o modificar iglesias necesitas permiso de administración.</p>}
      <div className="admin-church-list">{churches.map((church) => <article key={church.id} className={church.active ? '' : 'is-disabled'}>
        <div className="admin-church-list__icon"><Church /></div>
        <div><span>{church.network === 'av' ? 'Alcance Victoria' : 'Otra iglesia'}{church.system ? ' · Base' : ''}</span><h3>{church.name}</h3><p><MapPin /> {[church.city, church.country].filter(Boolean).join(', ') || 'Ubicación sin indicar'}</p></div>
        {canManage && <div className="admin-inline-actions"><button onClick={() => setForm({ ...church })} aria-label={`Editar ${church.name}`} title="Editar"><Pencil /></button><button className={church.active ? 'danger' : ''} onClick={() => toggle(church)} aria-label={`${church.active ? 'Ocultar' : 'Activar'} ${church.name}`} title={church.active ? 'Ocultar de los formularios' : 'Volver a mostrar'}><Power /></button></div>}
      </article>)}</div>
    </section>
  </div>
}
