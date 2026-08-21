import { useState } from 'react'
import { Building2, Church, ChevronRight, ClipboardCheck, SlidersHorizontal } from 'lucide-react'
import { ChurchesManager } from './ChurchesManager'

export function SettingsAdmin({ churches, canManage, reloadChurches, notify }) {
  const [churchManagerOpen, setChurchManagerOpen] = useState(false)
  const activeChurches = churches.filter((church) => church.active).length

  return <section className="admin-settings">
    <div className="admin-settings__hero">
      <div><p className="admin-kicker">Ajustes globales</p><h2>Configuración de Gestión</h2><p>Centraliza aquí los datos que se reutilizan en distintas pantallas y formularios de la web.</p></div>
      <SlidersHorizontal aria-hidden="true" />
    </div>

    <div className="admin-settings__group">
      <header><span>Catálogos compartidos</span><p>Los cambios realizados aquí se reflejan en Personas, eventos e inscripciones.</p></header>
      <button className="admin-settings-card" onClick={() => setChurchManagerOpen(true)}>
        <span className="admin-settings-card__icon"><Church /></span>
        <span className="admin-settings-card__body"><strong>Iglesias y procedencias</strong><small>Añade iglesias, corrige sus datos o deja de mostrarlas en nuevos formularios.</small></span>
        <span className="admin-settings-card__status"><b>{activeChurches}</b> activas</span>
        <ChevronRight aria-hidden="true" />
      </button>
    </div>

    <aside className="admin-settings__note">
      <ClipboardCheck aria-hidden="true" />
      <div><strong>Un lugar para los ajustes importantes</strong><p>Esta pantalla queda preparada para incorporar los datos de la organización, textos legales y valores predeterminados de eventos cuando se necesiten.</p></div>
      <Building2 aria-hidden="true" />
    </aside>

    {churchManagerOpen && <ChurchesManager churches={churches} canManage={canManage} onClose={() => setChurchManagerOpen(false)} onChanged={reloadChurches} notify={notify} />}
  </section>
}
