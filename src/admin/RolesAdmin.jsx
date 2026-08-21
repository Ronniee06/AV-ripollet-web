import { useState } from 'react'
import { Pencil, Plus, ShieldCheck, Trash2, X } from 'lucide-react'
import { api } from '../api'

const levels = { none: 'Sin acceso', view: 'Solo ver', manage: 'Administrar' }

export function RolesAdmin({ roles, screens, currentUser, reload, notify }) {
  const [editor, setEditor] = useState(null)
  const [saving, setSaving] = useState(false)
  const empty = () => ({ name: '', description: '', base_role: 'viewer', permissions: Object.fromEntries(screens.map(([key]) => [key, 'none'])) })
  const save = async (event) => {
    event.preventDefault(); setSaving(true)
    try {
      if (editor.id) await api.updateRole(editor.id, editor)
      else await api.createRole(editor)
      await reload(); setEditor(null); notify(editor.id ? 'Rol actualizado' : 'Rol creado')
    } catch (error) { notify(error.message) } finally { setSaving(false) }
  }
  const remove = async (role) => {
    if (!window.confirm(`¿Eliminar el rol “${role.name}”?`)) return
    try { await api.deleteRole(role.id); await reload(); notify('Rol eliminado') } catch (error) { notify(error.message) }
  }
  return <section className="admin-panel roles-admin">
    <div className="admin-panel__heading"><div><p className="admin-kicker">Accesos por defecto</p><h2>Roles</h2><p>Crea perfiles reutilizables. Si cambias una directiva directamente en un usuario, su rol pasará a Personalizado.</p></div><button className="admin-primary" onClick={() => setEditor(empty())}><Plus size={18} /> Nuevo rol</button></div>
    <div className="roles-grid">{roles.map((role) => <article key={role.id}><div className="roles-grid__icon"><ShieldCheck /></div><div><h3>{role.name}</h3><p>{role.description || 'Sin descripción'}</p><span>{screens.filter(([key]) => role.permissions[key] !== 'none').length} pantallas con acceso</span></div><div className="admin-inline-actions">{role.system ? <small>Rol protegido</small> : <><button onClick={() => setEditor({ ...role })} aria-label={`Editar ${role.name}`}><Pencil /></button><button className="danger" onClick={() => remove(role)} aria-label={`Eliminar ${role.name}`}><Trash2 /></button></>}</div></article>)}</div>
    {editor && <div className="admin-modal"><button className="admin-modal__backdrop" onClick={() => setEditor(null)} aria-label="Cerrar" /><form className="admin-modal__panel role-editor" onSubmit={save}><header><div><p className="admin-kicker">Directivas</p><h2>{editor.id ? 'Editar rol' : 'Nuevo rol'}</h2></div><button type="button" className="admin-icon" onClick={() => setEditor(null)}><X /></button></header><div className="admin-form-grid"><label>Nombre<input value={editor.name} onChange={(e) => setEditor({ ...editor, name: e.target.value })} required /></label><label>Nivel base<select value={editor.base_role} onChange={(e) => setEditor({ ...editor, base_role: e.target.value })}><option value="viewer">Usuario</option><option value="event_manager">Gestor de eventos</option><option value="communications">Comunicaciones</option>{currentUser.role === 'developer' && <option value="admin">Administrador</option>}</select></label></div><label>Descripción<input value={editor.description} onChange={(e) => setEditor({ ...editor, description: e.target.value })} /></label><div className="role-editor__permissions">{screens.map(([key, label]) => <label key={key}><span>{label}</span><select value={editor.permissions[key] || 'none'} onChange={(e) => setEditor({ ...editor, permissions: { ...editor.permissions, [key]: e.target.value } })}>{Object.entries(levels).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>)}</div><footer><button type="button" className="admin-secondary" onClick={() => setEditor(null)}>Cancelar</button><button className="admin-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar rol'}</button></footer></form></div>}
  </section>
}
