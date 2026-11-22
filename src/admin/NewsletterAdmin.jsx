import { useState } from 'react'
import { Eye, MailCheck, Pencil, Plus, Send, Trash2, X } from 'lucide-react'
import { api } from '../api'

const emptyCampaign = {
  name: '', subject: '', preview_text: '', heading: '', body_text: '',
  cta_label: '', cta_url: '', scheduled_at: '',
}

const statusLabels = {
  draft: 'Borrador', scheduled: 'Programada', sent: 'Enviada',
  cancelled: 'Cancelada', failed: 'Con error',
}

const subscriberStatusLabels = {
  pending: 'Pendiente de confirmar', active: 'Activo',
  unsubscribed: 'Baja', bounced: 'Rebotado',
}

function localDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function CampaignEditor({ value, onClose, onSaved }) {
  const [form, setForm] = useState(value ? { ...value, scheduled_at: localDate(value.scheduled_at) } : emptyCampaign)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const update = (key, next) => setForm((current) => ({ ...current, [key]: next }))

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true); setError('')
    try {
      const payload = {
        ...form,
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      }
      await api.saveNewsletterCampaign(value?.id, payload)
      await onSaved('Campaña guardada como borrador')
    } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }

  return <div className="admin-modal" role="presentation">
    <button className="admin-modal__backdrop" onClick={onClose} aria-label="Cerrar editor" />
    <form className="admin-modal__panel admin-campaign-editor" onSubmit={submit}>
      <header><div><p className="admin-kicker">Comunicaciones</p><h2>{value ? 'Editar campaña' : 'Nueva campaña'}</h2></div><button type="button" className="admin-icon" onClick={onClose} aria-label="Cerrar"><X /></button></header>
      <div className="admin-form-grid">
        <label>Nombre interno<input value={form.name} onChange={(e) => update('name', e.target.value)} required minLength="2" placeholder="Newsletter septiembre" /></label>
        <label className="wide">Asunto<input value={form.subject} onChange={(e) => update('subject', e.target.value)} required minLength="3" /></label>
        <label className="wide">Texto de previsualización<input value={form.preview_text} onChange={(e) => update('preview_text', e.target.value)} maxLength="220" /></label>
        <label className="wide">Título del correo<input value={form.heading} onChange={(e) => update('heading', e.target.value)} required /></label>
        <label className="wide admin-campaign-body">Contenido<textarea value={form.body_text} onChange={(e) => update('body_text', e.target.value)} required minLength="10" rows="8" /><small>Separa los párrafos dejando una línea en blanco.</small></label>
        <label>Texto del botón<input value={form.cta_label} onChange={(e) => update('cta_label', e.target.value)} placeholder="Ver próximos eventos" /></label>
        <label>Enlace del botón<input type="url" value={form.cta_url} onChange={(e) => update('cta_url', e.target.value)} placeholder="https://..." /></label>
        <label>Programar para<input type="datetime-local" value={form.scheduled_at} onChange={(e) => update('scheduled_at', e.target.value)} /><small>También puedes enviarla inmediatamente después.</small></label>
      </div>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <footer><button type="button" className="admin-secondary" onClick={onClose}>Cancelar</button><button className="admin-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar borrador'}</button></footer>
    </form>
  </div>
}

function Preview({ preview, onClose }) {
  return <div className="admin-modal" role="presentation">
    <button className="admin-modal__backdrop" onClick={onClose} aria-label="Cerrar vista previa" />
    <section className="admin-modal__panel admin-preview-panel">
      <header><div><p className="admin-kicker">Vista previa segura</p><h2>{preview.subject}</h2></div><button className="admin-icon" onClick={onClose} aria-label="Cerrar"><X /></button></header>
      <iframe title="Vista previa del correo" sandbox="" srcDoc={preview.html} />
    </section>
  </div>
}

export function NewsletterAdmin({ subscribers, campaigns, provider, canManage, reload, notify }) {
  const [editor, setEditor] = useState(null)
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(false)
  const newsletterManageEnabled = canManage && provider?.enabled

  const finish = async (message) => { setEditor(null); await reload(); notify(message) }
  const showPreview = async (id) => {
    try { setPreview(await api.newsletterCampaignPreview(id)) } catch (error) { notify(error.message) }
  }
  const sendTest = async (campaign) => {
    const email = window.prompt('¿A qué email quieres enviar la prueba?', '')
    if (!email) return
    try { setBusy(true); const result = await api.testNewsletterCampaign(campaign.id, email); notify(result.message) } catch (error) { notify(error.message) } finally { setBusy(false) }
  }
  const sendCampaign = async (campaign) => {
    const scheduled = campaign.scheduled_at && new Date(campaign.scheduled_at) > new Date()
    const action = scheduled ? `programar para ${new Date(campaign.scheduled_at).toLocaleString('es-ES')}` : 'enviar ahora'
    const active = subscribers.filter((item) => item.status === 'active').length
    if (!window.confirm(`Se va a ${action} para ${active} contacto(s) activo(s). ¿Continuar?`)) return
    try {
      setBusy(true)
      await api.sendNewsletterCampaign(campaign.id, scheduled ? campaign.scheduled_at : null)
      await reload(); notify(scheduled ? 'Campaña programada' : 'Campaña aceptada para envío')
    } catch (error) { notify(error.message) } finally { setBusy(false) }
  }
  const remove = async (campaign) => {
    if (!window.confirm(`Se eliminará el borrador “${campaign.name}”. ¿Continuar?`)) return
    try { await api.deleteNewsletterCampaign(campaign.id); await reload(); notify('Borrador eliminado') } catch (error) { notify(error.message) }
  }
  const changeSubscriber = async (subscriber, status) => {
    try { await api.updateNewsletterSubscriber(subscriber.id, status); await reload(); notify('Suscriptor actualizado') } catch (error) { notify(error.message) }
  }

  return <>
    <section className="admin-panel admin-newsletter">
      <div className="admin-panel__heading"><div><p className="admin-kicker">Comunidad</p><h2>Campañas</h2><p>Consulta las campañas y los contactos registrados.</p></div>{newsletterManageEnabled && <button className="admin-primary" onClick={() => setEditor({})}><Plus size={18} /> Nueva campaña</button>}</div>
      <div className={`admin-provider ${provider?.enabled && provider?.configured ? 'ready' : ''}`}><span>{!provider?.enabled ? 'Newsletter temporalmente desactivada' : provider?.configured ? 'Proveedor de correo preparado' : 'Envío real pendiente de configurar'}</span><small>{!provider?.enabled ? 'Este apartado está disponible solo para consulta; suscripciones, cambios y envíos están bloqueados.' : provider?.configured ? 'Resend está listo para pruebas y campañas.' : 'Añade las variables de Resend en el backend para enviar.'}</small></div>
      <div className="admin-campaigns">
        {campaigns.length === 0 && <div className="admin-newsletter-empty"><MailCheck /><strong>Todavía no hay campañas</strong><span>Crea el primer borrador cuando tengas una comunicación que enviar.</span></div>}
        {campaigns.map((campaign) => <article key={campaign.id}>
          <div><span className={`admin-status ${campaign.status}`}>{statusLabels[campaign.status] || campaign.status}</span><h3>{campaign.name}</h3><p>{campaign.subject}</p>{campaign.scheduled_at && <small>{campaign.status === 'scheduled' ? 'Programada' : 'Fecha prevista'}: {new Date(campaign.scheduled_at).toLocaleString('es-ES')}</small>}</div>
          <div className="admin-campaign-actions">
            <button onClick={() => showPreview(campaign.id)} title="Previsualizar"><Eye /></button>
            {newsletterManageEnabled && ['draft', 'failed'].includes(campaign.status) && <><button onClick={() => setEditor(campaign)} title="Editar"><Pencil /></button><button onClick={() => sendTest(campaign)} disabled={busy} title="Enviar prueba"><MailCheck /></button><button className="primary" onClick={() => sendCampaign(campaign)} disabled={busy} title="Enviar o programar"><Send /></button><button className="danger" onClick={() => remove(campaign)} title="Eliminar"><Trash2 /></button></>}
          </div>
        </article>)}
      </div>
      <div className="admin-newsletter-subscribers">
        <div><p className="admin-kicker">Audiencia</p><h3>Suscriptores</h3><p>{subscribers.filter((item) => item.status === 'active').length} activos de {subscribers.length} contactos</p></div>
        <div className="admin-table-wrap"><table><thead><tr><th>Nombre</th><th>Email</th><th>Estado</th><th>Consentimiento</th><th>Acción</th></tr></thead><tbody>{subscribers.map((item) => <tr key={item.id}><td>{item.full_name || '—'}</td><td>{item.email}</td><td><span className={`admin-status ${item.status}`}>{subscriberStatusLabels[item.status] || item.status}</span></td><td>{new Date(item.consent_at).toLocaleDateString('es-ES')}</td><td>{newsletterManageEnabled && item.status === 'active' && <button className="admin-subscriber-action" onClick={() => changeSubscriber(item, 'unsubscribed')}>Dar de baja</button>}</td></tr>)}</tbody></table></div>
      </div>
    </section>
    {editor && <CampaignEditor value={editor.id ? editor : null} onClose={() => setEditor(null)} onSaved={finish} />}
    {preview && <Preview preview={preview} onClose={() => setPreview(null)} />}
  </>
}
