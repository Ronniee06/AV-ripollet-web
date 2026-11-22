import { useEffect, useState } from 'react'
import { Building2, Church, ChevronRight, ClipboardCheck, Copy, Download, Link2, QrCode, SlidersHorizontal } from 'lucide-react'
import QRCode from 'qrcode'
import { ChurchesManager } from './ChurchesManager'

export function SettingsAdmin({ churches, canManage, reloadChurches, notify }) {
  const [churchManagerOpen, setChurchManagerOpen] = useState(false)
  const [registrationQr, setRegistrationQr] = useState('')
  const activeChurches = churches.filter((church) => church.active).length
  const publicSiteUrl = (import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '')
  const registrationUrl = `${publicSiteUrl}/registro`

  useEffect(() => {
    let active = true
    QRCode.toDataURL(registrationUrl, { width: 640, margin: 3, color: { dark: '#07182b', light: '#ffffff' }, errorCorrectionLevel: 'H' })
      .then((dataUrl) => { if (active) setRegistrationQr(dataUrl) })
      .catch(() => { if (active) setRegistrationQr('') })
    return () => { active = false }
  }, [registrationUrl])

  const copyRegistrationUrl = async () => {
    try {
      await navigator.clipboard.writeText(registrationUrl)
      notify('Enlace de registro copiado')
    } catch { notify('No se pudo copiar el enlace. Puedes seleccionarlo manualmente.') }
  }

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

    <div className="admin-settings__group">
      <header><span>Registro de personas</span><p>Comparte la inscripción general de la iglesia por enlace o mediante un código QR.</p></header>
      <div className="admin-registration-share">
        <div className="admin-registration-share__qr">{registrationQr ? <img src={registrationQr} alt={`Código QR que abre ${registrationUrl}`} /> : <QrCode aria-hidden="true" />}</div>
        <div className="admin-registration-share__body">
          <span className="admin-settings-card__icon"><Link2 /></span>
          <div><strong>Formulario público de registro</strong><p>El QR abre directamente el formulario. Las respuestas aparecerán en Personas → Solicitudes antes de modificar el directorio.</p></div>
          <code>{registrationUrl}</code>
          <div className="admin-registration-share__actions">
            <button type="button" className="admin-secondary" onClick={copyRegistrationUrl}><Copy /> Copiar enlace</button>
            {registrationQr && <a className="admin-primary" href={registrationQr} download="registro-alcance-victoria-qr.png"><Download /> Descargar QR</a>}
          </div>
        </div>
      </div>
    </div>

    <aside className="admin-settings__note">
      <ClipboardCheck aria-hidden="true" />
      <div><strong>Un lugar para los ajustes importantes</strong><p>Esta pantalla queda preparada para incorporar los datos de la organización, textos legales y valores predeterminados de eventos cuando se necesiten.</p></div>
      <Building2 aria-hidden="true" />
    </aside>

    {churchManagerOpen && <ChurchesManager churches={churches} canManage={canManage} onClose={() => setChurchManagerOpen(false)} onChanged={reloadChurches} notify={notify} />}
  </section>
}
