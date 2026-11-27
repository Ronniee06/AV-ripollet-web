import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Church, HeartHandshake, Mail, ShieldCheck, UsersRound } from 'lucide-react'
import { api } from './api'
import { buildChurchOptions } from './churches'
import './registration.css'

const relationshipOptions = [
  ['new', 'Estoy empezando a conocer la iglesia'],
  ['regular', 'Asisto regularmente'],
  ['member', 'Considero esta mi iglesia'],
  ['volunteer', 'Formo parte y también sirvo'],
  ['prefer_discuss', 'Prefiero hablarlo personalmente'],
]

const interestOptions = [
  ['discipleship', 'Discipulado'], ['prayer', 'Oración'], ['families', 'Familias'],
  ['youth', 'Jóvenes'], ['outreach', 'Alcance'], ['service', 'Servir'], ['life_groups', 'Grupos de vida'],
]

const emptyForm = {
  full_name: '', email: '', phone: '', city: '', country: 'España',
  church_affiliation: 'av_barcelona_norte', church_name: '', relationship: 'regular',
  interests: [], contact_method: 'whatsapp', newsletter_opt_in: false,
  privacy_accepted: false, website: '',
}

function RegistrationBrand() {
  return <a className="registration-brand" href="/" aria-label="Volver al inicio"><img src="/brand/av-barcelona-norte.png" alt="Alcance Victoria Barcelona Norte" /></a>
}

export function RegistrationPage() {
  const [form, setForm] = useState(emptyForm)
  const [churches, setChurches] = useState([])
  const [step, setStep] = useState(1)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const churchOptions = useMemo(() => buildChurchOptions(churches), [churches])
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  useEffect(() => { api.churches().then(setChurches).catch(() => setChurches([])) }, [])

  const next = () => {
    setError('')
    if (step === 1) {
      if (form.full_name.trim().length < 2) return setError('Indica tu nombre y apellidos.')
      if (!form.email.trim() && !form.phone.trim()) return setError('Indica al menos un correo o teléfono.')
      if (form.contact_method === 'email' && !form.email.trim()) return setError('Indica un correo para poder contactarte por email.')
      if (['phone', 'whatsapp'].includes(form.contact_method) && !form.phone.trim()) return setError('Indica un teléfono para el método de contacto elegido.')
    }
    setStep((current) => Math.min(3, current + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleInterest = (value) => update('interests', form.interests.includes(value)
    ? form.interests.filter((item) => item !== value)
    : [...form.interests, value])

  const submit = async (event) => {
    event.preventDefault(); setError('')
    if (!form.privacy_accepted) return setError('Debes aceptar el tratamiento de datos para enviar el registro.')
    setStatus('sending')
    try {
      const result = await api.submitPeopleRegistration(form)
      setMessage(result.message); setStatus('done')
    } catch (requestError) {
      setError(requestError.message); setStatus('error')
    }
  }

  return <main className="registration-page">
    <header className="registration-topbar"><RegistrationBrand /><a href="/"><ArrowLeft /> Ir al inicio</a></header>
    <section className="registration-layout">
      <aside className="registration-story">
        <p className="registration-kicker">Tu lugar en la familia</p>
        <h1>Queremos<br />conocerte.</h1>
        <p>Este registro nos ayuda a cuidar mejor de nuestra comunidad, mantener tus datos al día y acompañarte en tu siguiente paso.</p>
        <ol><li className={step >= 1 ? 'active' : ''}><span>1</span><div><strong>Conocerte</strong><small>Tus datos de contacto</small></div></li><li className={step >= 2 ? 'active' : ''}><span>2</span><div><strong>Ubicarte</strong><small>Tu relación con la iglesia</small></div></li><li className={step >= 3 ? 'active' : ''}><span>3</span><div><strong>Acompañarte</strong><small>Preferencias y consentimiento</small></div></li></ol>
        <div className="registration-trust"><ShieldCheck /><span>Solo el equipo autorizado de la iglesia podrá consultar esta información.</span></div>
      </aside>

      <div className="registration-form-shell">
        {status === 'done' ? <div className="registration-success"><span><Check /></span><p className="registration-kicker">Registro enviado</p><h2>Gracias por dar este paso.</h2><p>{message}</p><a className="button button--coral" href="/">Volver al inicio</a></div> : <form onSubmit={submit}>
          <header><span>Paso {step} de 3</span><div className="registration-progress" role="progressbar" aria-label={`Paso ${step} de 3`} aria-valuemin="1" aria-valuemax="3" aria-valuenow={step}><i style={{ width: `${step * 33.333}%` }} /></div></header>

          {step === 1 && <fieldset><legend><span><UsersRound /></span><div><small>Empecemos por ti</small><strong>¿Cómo podemos reconocerte?</strong></div></legend>
            <label className="wide">Nombre y apellidos<input autoComplete="name" value={form.full_name} onChange={(event) => update('full_name', event.target.value)} required minLength="2" /></label>
            <label>Correo electrónico <small>(opcional)</small><input type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} /></label>
            <label>Teléfono <small>(opcional)</small><input type="tel" autoComplete="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} /></label>
            <div className="registration-choice wide"><span>¿Cómo prefieres que contactemos contigo?</span><div>{[['whatsapp', 'WhatsApp'], ['phone', 'Teléfono'], ['email', 'Email']].map(([value, label]) => <label key={value}><input type="radio" name="contact_method" value={value} checked={form.contact_method === value} onChange={() => update('contact_method', value)} /><span>{label}</span></label>)}</div></div>
          </fieldset>}

          {step === 2 && <fieldset><legend><span><Church /></span><div><small>Tu conexión</small><strong>¿Cómo formas parte de la comunidad?</strong></div></legend>
            <label>Ciudad<input autoComplete="address-level2" value={form.city} onChange={(event) => update('city', event.target.value)} /></label>
            <label>País<input autoComplete="country-name" value={form.country} onChange={(event) => update('country', event.target.value)} /></label>
            <label className="wide">Iglesia de procedencia<select value={form.church_affiliation} onChange={(event) => update('church_affiliation', event.target.value)}>{churchOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            {(form.church_affiliation === 'other_church' || form.church_affiliation === 'av_other') && <label className="wide">Nombre de la iglesia<input value={form.church_name} onChange={(event) => update('church_name', event.target.value)} /></label>}
            <div className="registration-relationship wide"><span>Elige la opción que mejor te describe</span>{relationshipOptions.map(([value, label]) => <label key={value}><input type="radio" name="relationship" value={value} checked={form.relationship === value} onChange={() => update('relationship', value)} /><span>{label}</span></label>)}</div>
          </fieldset>}

          {step === 3 && <fieldset><legend><span><HeartHandshake /></span><div><small>Tu siguiente paso</small><strong>¿Hay algo en lo que podamos ayudarte?</strong></div></legend>
            <div className="registration-interests wide"><span>Áreas de interés <small>(completamente opcional)</small></span><div>{interestOptions.map(([value, label]) => <label key={value}><input type="checkbox" checked={form.interests.includes(value)} onChange={() => toggleInterest(value)} /><span>{label}</span></label>)}</div></div>
            <label className="registration-consent wide"><input type="checkbox" checked={form.newsletter_opt_in} onChange={(event) => update('newsletter_opt_in', event.target.checked)} /><span>Quiero recibir por separado noticias y comunicaciones de la iglesia.</span></label>
            <label className="registration-consent wide required"><input type="checkbox" checked={form.privacy_accepted} onChange={(event) => update('privacy_accepted', event.target.checked)} required /><span>Acepto el tratamiento interno de mis datos para mantener mi ficha, verificar duplicados y facilitar el acompañamiento de la iglesia. He leído la <a href="/#privacidad" target="_blank" rel="noreferrer">información de privacidad</a>.</span></label>
            <label className="registration-honeypot" aria-hidden="true">Sitio web<input tabIndex="-1" autoComplete="off" value={form.website} onChange={(event) => update('website', event.target.value)} /></label>
          </fieldset>}

          {error && <p className="registration-error" role="alert">{error}</p>}
          <footer>{step > 1 ? <button type="button" className="registration-back" onClick={() => { setStep(step - 1); setError('') }}><ArrowLeft /> Atrás</button> : <span />}{step < 3 ? <button type="button" className="button button--coral" onClick={next}>Continuar <ArrowRight /></button> : <button className="button button--coral" disabled={status === 'sending'}>{status === 'sending' ? 'Enviando…' : <>Enviar registro <ArrowRight /></>}</button>}</footer>
        </form>}
      </div>
    </section>
  </main>
}

export function RegistrationConfirmation() {
  const token = new URLSearchParams(window.location.search).get('token')
  const requested = useRef(false)
  const [state, setState] = useState({ status: token ? 'checking' : 'error', message: token ? 'Estamos verificando tu enlace…' : 'El enlace no es válido.', requiresChoice: false })

  useEffect(() => {
    if (!token || requested.current) return
    requested.current = true
    api.confirmPeopleRegistration(token).then((result) => setState({ status: result.requires_choice ? 'choice' : 'done', message: result.message, requiresChoice: result.requires_choice })).catch((error) => setState({ status: 'error', message: error.message, requiresChoice: false }))
  }, [token])

  const choose = async (preference) => {
    setState((current) => ({ ...current, status: 'checking' }))
    try {
      const result = await api.confirmPeopleRegistration(token, preference)
      window.history.replaceState({}, '', '/registro/confirm')
      setState({ status: 'done', message: result.message, requiresChoice: false })
    } catch (error) { setState({ status: 'error', message: error.message, requiresChoice: false }) }
  }

  return <main className="registration-confirmation"><section><RegistrationBrand /><span className={`registration-confirmation__icon ${state.status}`}>{state.status === 'done' ? <Check /> : <Mail />}</span><p className="registration-kicker">Registro de la iglesia</p><h1>{state.status === 'choice' ? 'Ya tienes una ficha' : state.status === 'done' ? 'Registro confirmado' : state.status === 'error' ? 'No se pudo confirmar' : 'Confirmando…'}</h1><p>{state.message}</p>{state.requiresChoice ? <div className="registration-confirmation__actions"><button className="button button--coral" onClick={() => choose('update')}>Solicitar actualización</button><button className="registration-back" onClick={() => choose('keep')}>Mantener mi ficha actual</button></div> : <a className="button button--coral" href="/">Ir al inicio</a>}</section></main>
}
