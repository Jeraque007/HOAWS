import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, ClipboardPaste, LogOut, Pencil, Plus, RefreshCw,
  RotateCcw, Save, ShieldCheck, Trash2, Upload,
} from 'lucide-react'
import SEO from '../components/SEO'
import { PromoPreview } from '../components/PromoPopup'
// The shared page-hero styling ships with the PageHero component. Importing it
// here keeps this lazily-loaded route looking right even on a direct first hit.
import '../components/PageHero.css'
import {
  deletePromo,
  getAdminSession,
  getPromoAdminData,
  savePromo,
  setPromoActive,
  signInAdmin,
  signOutAdmin,
  subscribeToAdminAuth,
  uploadPromoFile,
} from '../lib/supabase'
import {
  IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  VIDEO_MIME_TYPES,
  describePromoSchedule,
  fromDateTimeInputValue,
  parsePromoPaste,
  toDateTimeInputValue,
} from '../lib/promo'
import './PromoAdmin.css'

function errorMessage(error, fallback) {
  return error?.message || fallback
}

function formatDate(value) {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function formatSize(bytes) {
  if (!bytes) return '0 KB'
  const megabytes = bytes / (1024 * 1024)
  return megabytes >= 1 ? `${megabytes.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

const emptyForm = {
  id: '',
  kicker: '',
  headline: '',
  body: '',
  quote: '',
  attribution: '',
  image_url: '',
  video_url: '',
  cta_label: '',
  cta_url: '',
  is_active: true,
  starts_at: '',
  ends_at: '',
}

function formFromPromo(promo) {
  if (!promo) return { ...emptyForm }

  return {
    id: promo.id || '',
    kicker: promo.kicker || '',
    headline: promo.headline || '',
    body: promo.body || '',
    quote: promo.quote || '',
    attribution: promo.attribution || '',
    image_url: promo.image_url || '',
    video_url: promo.video_url || '',
    cta_label: promo.cta_label || '',
    cta_url: promo.cta_url || '',
    is_active: Boolean(promo.is_active),
    starts_at: toDateTimeInputValue(promo.starts_at),
    ends_at: toDateTimeInputValue(promo.ends_at),
  }
}

function promoFromForm(form) {
  return {
    kicker: form.kicker,
    headline: form.headline,
    body: form.body,
    quote: form.quote,
    attribution: form.attribution,
    image_url: form.image_url,
    video_url: form.video_url,
    cta_label: form.cta_label,
    cta_url: form.cta_url,
    is_active: form.is_active,
    starts_at: fromDateTimeInputValue(form.starts_at),
    ends_at: fromDateTimeInputValue(form.ends_at),
  }
}

export default function PromoAdmin() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authSubmitting, setAuthSubmitting] = useState(false)

  const [promos, setPromos] = useState([])
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState('')
  const [busyId, setBusyId] = useState('')

  const [form, setForm] = useState(emptyForm)
  const [pasteText, setPasteText] = useState('')
  const [pasteNote, setPasteNote] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [localMedia, setLocalMedia] = useState({ video: '', image: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  const videoInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    let active = true

    getAdminSession().then(({ data, error }) => {
      if (!active) return
      setSession(data?.session || null)
      if (error) setAuthError(errorMessage(error, 'Unable to check the admin session.'))
      setAuthLoading(false)
    }).catch((error) => {
      if (!active) return
      setAuthError(errorMessage(error, 'Unable to check the admin session.'))
      setAuthLoading(false)
    })

    const unsubscribe = subscribeToAdminAuth((nextSession) => {
      if (!active) return
      setSession(nextSession)
      setAuthError('')
      setAuthLoading(false)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const loadPromos = useCallback(async () => {
    if (!session) return
    setDataLoading(true)
    setDataError('')
    try {
      const { data, error } = await getPromoAdminData()
      if (error) setDataError(errorMessage(error, 'Popups could not be loaded.'))
      else setPromos(data?.promos || [])
    } catch (error) {
      setDataError(errorMessage(error, 'Popups could not be loaded.'))
    } finally {
      setDataLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (!session) {
      setPromos([])
      setDataError('')
      return
    }
    loadPromos()
  }, [session, loadPromos])

  // Local object URLs so a freshly picked MP4 or poster shows up in the preview
  // before it has been uploaded.
  useEffect(() => {
    const urls = {
      video: videoFile ? URL.createObjectURL(videoFile) : '',
      image: imageFile ? URL.createObjectURL(imageFile) : '',
    }
    setLocalMedia(urls)

    return () => {
      if (urls.video) URL.revokeObjectURL(urls.video)
      if (urls.image) URL.revokeObjectURL(urls.image)
    }
  }, [videoFile, imageFile])

  function updateField(field, value) {
    setForm(current => ({ ...current, [field]: value }))
  }

  function resetFileInputs() {
    if (videoInputRef.current) videoInputRef.current.value = ''
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  function clearForm() {
    setForm(emptyForm)
    setVideoFile(null)
    setImageFile(null)
    setPasteText('')
    setPasteNote('')
    setFormError('')
    setNotice('')
    resetFileInputs()
  }

  function handlePasteFill() {
    setFormError('')
    setNotice('')

    const parsed = parsePromoPaste(pasteText)
    if (!parsed) {
      setPasteNote('')
      setFormError('Nothing to read in that paste - add some text first.')
      return
    }

    setForm(current => ({ ...current, ...parsed }))
    setPasteNote('Fields filled from the pasted text. Check them below, add the video, then save.')
  }

  function handleFileChange(kind, file) {
    setFormError('')
    setNotice('')

    if (!file) {
      if (kind === 'video') setVideoFile(null)
      else setImageFile(null)
      return
    }

    const allowedTypes = kind === 'video' ? VIDEO_MIME_TYPES : IMAGE_MIME_TYPES
    const maxBytes = kind === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES

    if (file.type && !allowedTypes.includes(file.type)) {
      setFormError(`That file type is not supported. Use ${allowedTypes.join(', ')}.`)
      return
    }
    if (file.size > maxBytes) {
      setFormError(`That file is ${formatSize(file.size)} - the limit is ${formatSize(maxBytes)}.`)
      return
    }

    if (kind === 'video') setVideoFile(file)
    else setImageFile(file)
  }

  function handleEdit(promo) {
    setForm(formFromPromo(promo))
    setVideoFile(null)
    setImageFile(null)
    setPasteNote('')
    setFormError('')
    setNotice('')
    resetFileInputs()
    if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleSave(event) {
    event.preventDefault()
    setFormError('')
    setNotice('')

    if (!form.headline.trim()) {
      setFormError('A headline is required - it is the first line visitors read.')
      return
    }
    if (form.cta_label.trim() && !form.cta_url.trim()) {
      setFormError('Add a link for the button, or clear its label.')
      return
    }

    const startsAt = fromDateTimeInputValue(form.starts_at)
    const endsAt = fromDateTimeInputValue(form.ends_at)
    if (startsAt && endsAt && new Date(endsAt) < new Date(startsAt)) {
      setFormError('The end date is before the start date.')
      return
    }

    setSaving(true)
    try {
      let videoUrl = form.video_url
      let imageUrl = form.image_url

      if (videoFile) {
        const { data, error } = await uploadPromoFile(videoFile, 'video')
        if (error) {
          setFormError(errorMessage(error, 'The video could not be uploaded.'))
          return
        }
        videoUrl = data?.url || videoUrl
      }

      if (imageFile) {
        const { data, error } = await uploadPromoFile(imageFile, 'image')
        if (error) {
          setFormError(errorMessage(error, 'The poster image could not be uploaded.'))
          return
        }
        imageUrl = data?.url || imageUrl
      }

      const isUpdate = Boolean(form.id)
      const { data, error } = await savePromo(
        promoFromForm({ ...form, video_url: videoUrl, image_url: imageUrl }),
        form.id
      )

      if (error) {
        setFormError(errorMessage(error, 'The popup could not be saved.'))
        return
      }

      setPromos(current => [data, ...current.filter(promo => promo.id !== data.id)])
      setForm(formFromPromo(data))
      setVideoFile(null)
      setImageFile(null)
      setPasteText('')
      setPasteNote('')
      resetFileInputs()
      setNotice(isUpdate
        ? 'Popup updated.'
        : 'Popup saved. Switch it on when you are ready for visitors to see it.')
    } catch (error) {
      setFormError(errorMessage(error, 'The popup could not be saved.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(promo) {
    setBusyId(promo.id)
    setFormError('')
    setNotice('')
    try {
      const { data, error } = await setPromoActive(promo.id, !promo.is_active)
      if (error) {
        setFormError(errorMessage(error, 'The popup could not be switched.'))
        return
      }
      setPromos(current => current.map(item => item.id === promo.id ? data : item))
      if (form.id === promo.id) updateField('is_active', data.is_active)
      setNotice(data.is_active ? 'Popup is live for visitors.' : 'Popup switched off.')
    } catch (error) {
      setFormError(errorMessage(error, 'The popup could not be switched.'))
    } finally {
      setBusyId('')
    }
  }

  async function handleDelete(promo) {
    const confirmed = window.confirm(`Delete "${promo.headline}"? Visitors stop seeing it immediately. The uploaded file stays in Storage.`)
    if (!confirmed) return

    setBusyId(promo.id)
    setFormError('')
    setNotice('')
    try {
      const { error } = await deletePromo(promo.id)
      if (error) {
        setFormError(errorMessage(error, 'The popup could not be deleted.'))
        return
      }
      setPromos(current => current.filter(item => item.id !== promo.id))
      if (form.id === promo.id) clearForm()
      setNotice('Popup deleted.')
    } catch (error) {
      setFormError(errorMessage(error, 'The popup could not be deleted.'))
    } finally {
      setBusyId('')
    }
  }

  async function handleSignIn(event) {
    event.preventDefault()
    setAuthSubmitting(true)
    setAuthError('')
    try {
      const { data, error } = await signInAdmin(email, password)
      if (error) {
        setAuthError(errorMessage(error, 'Sign in failed. Check your credentials.'))
        return
      }
      setSession(data?.session || null)
      setPassword('')
    } catch (error) {
      setAuthError(errorMessage(error, 'Sign in failed. Check your credentials.'))
    } finally {
      setAuthSubmitting(false)
    }
  }

  async function handleSignOut() {
    setFormError('')
    const { error } = await signOutAdmin()
    if (error) setFormError(errorMessage(error, 'Sign out failed.'))
    else setSession(null)
  }

  // What the preview panel shows: the form as it stands, with any not-yet-uploaded
  // file swapped in from its local blob URL.
  const previewPromo = {
    kicker: form.kicker,
    headline: form.headline || 'Your headline',
    body: form.body,
    quote: form.quote,
    attribution: form.attribution,
    cta_label: form.cta_label,
    cta_url: form.cta_url,
    video_url: localMedia.video || form.video_url,
    image_url: localMedia.image || form.image_url,
  }

  if (authLoading) {
    return <main className="promo-admin-page"><SEO /><div className="promo-admin-state">Checking admin session…</div></main>
  }

  if (!session) {
    return (
      <main className="promo-admin-page">
        <SEO />
        <section className="page-hero promo-admin-hero">
          <div className="container page-hero-inner">
            <p className="eyebrow">Private workspace</p>
            <h1>Announcement<br /><em>popup.</em></h1>
            <p className="page-hero-copy">Sign in to paste the copy, upload the MP4 and switch the home page popup on.</p>
          </div>
        </section>
        <section className="section promo-admin-section">
          <div className="container">
            <form className="promo-admin-login" onSubmit={handleSignIn}>
              <ShieldCheck size={30} />
              <p className="eyebrow">Administrator access</p>
              <h2>Sign in to continue.</h2>
              <label>Email<input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required /></label>
              <label>Password<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></label>
              {authError && <p className="form-error" role="alert">{authError}</p>}
              <button className="button button-primary" type="submit" disabled={authSubmitting}>{authSubmitting ? 'Signing in…' : 'Sign in'}</button>
            </form>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="promo-admin-page">
      <SEO />
      <section className="page-hero promo-admin-hero">
        <div className="container page-hero-inner">
          <p className="eyebrow">Private workspace</p>
          <h1>Announcement<br /><em>popup.</em></h1>
          <p className="page-hero-copy">Paste the copy, upload the 15-second MP4 and switch it on for everyone who lands on the home page.</p>
        </div>
      </section>

      <section className="section promo-admin-section">
        <div className="container">
          <div className="promo-admin-toolbar">
            <div>
              <Link className="promo-admin-back" to="/"><ArrowLeft size={15} /> Back to the site</Link>
              <p className="promo-admin-help">Signed in as {session.user?.email || 'administrator'}</p>
            </div>
            <button className="promo-admin-signout" type="button" onClick={handleSignOut}><LogOut size={15} /> Sign out</button>
          </div>

          {notice && <p className="promo-admin-notice" role="status">{notice}</p>}
          {formError && <p className="form-error" role="alert">{formError}</p>}
          {dataError && <p className="form-error" role="alert">{dataError}</p>}

          <div className="promo-admin-content">
            <div>
              <form className="promo-admin-card" onSubmit={handleSave} ref={formRef}>
                <h2>{form.id ? 'Edit popup' : 'New popup'}</h2>
                <p>Everything below is what a visitor sees. The popup appears once per session and closes the moment they tap, scroll or press Esc.</p>

                <div className="promo-admin-paste">
                  <label htmlFor="promo-paste">Paste the announcement text</label>
                  <textarea
                    id="promo-paste"
                    value={pasteText}
                    onChange={event => setPasteText(event.target.value)}
                    placeholder={'OCTOBER 2 — MAKE A PLAN\nYou don\'t need to have everything figured out. You need to know what needs to happen next.\n“The secret to getting ahead is getting started.”\n— Mark Twain'}
                  />
                  <div className="promo-admin-paste-actions">
                    <button className="promo-admin-secondary" type="button" onClick={handlePasteFill}><ClipboardPaste size={15} /> Fill the fields</button>
                    <button className="promo-admin-secondary" type="button" onClick={clearForm}><RotateCcw size={15} /> Clear</button>
                  </div>
                  {pasteNote
                    ? <p className="promo-admin-help">{pasteNote}</p>
                    : <p className="promo-admin-help">The first line becomes the kicker + headline, quotation marks become the quote and a leading dash becomes the credit. Everything else lands in the body - check it below before saving.</p>}
                </div>

                <div className="promo-admin-fields">
                  <div className="promo-admin-row">
                    <label>Kicker<input value={form.kicker} onChange={event => updateField('kicker', event.target.value)} maxLength={60} placeholder="OCTOBER 2" /></label>
                    <label>Headline<input value={form.headline} onChange={event => updateField('headline', event.target.value)} maxLength={120} required placeholder="MAKE A PLAN" /></label>
                  </div>
                  <label>Body<textarea rows="4" value={form.body} onChange={event => updateField('body', event.target.value)} maxLength={1200} placeholder="One task. One priority. One step at a time." /></label>
                  <div className="promo-admin-row">
                    <label>Quote<input value={form.quote} onChange={event => updateField('quote', event.target.value)} maxLength={300} placeholder="The secret to getting ahead is getting started." /></label>
                    <label>Credit<input value={form.attribution} onChange={event => updateField('attribution', event.target.value)} maxLength={120} placeholder="Mark Twain" /></label>
                  </div>
                  <div className="promo-admin-row">
                    <label>Button label (optional)<input value={form.cta_label} onChange={event => updateField('cta_label', event.target.value)} maxLength={60} placeholder="See the full calendar" /></label>
                    <label>Button link (optional)<input type="url" value={form.cta_url} onChange={event => updateField('cta_url', event.target.value)} maxLength={600} placeholder="https://" /></label>
                  </div>
                </div>

                <div className="promo-admin-media">
                  <p className="promo-admin-help">Media - uploaded to the public “promo-media” Storage bucket</p>
                  <div className="promo-admin-media-row">
                    <label>Video · MP4, up to {formatSize(MAX_VIDEO_BYTES)}
                      <input ref={videoInputRef} type="file" accept="video/mp4,video/webm" onChange={event => handleFileChange('video', event.target.files?.[0] || null)} />
                    </label>
                    <label>Poster image · optional
                      <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={event => handleFileChange('image', event.target.files?.[0] || null)} />
                    </label>
                  </div>

                  {(videoFile || imageFile) && (
                    <p className="promo-admin-help">
                      Queued to upload: {[videoFile, imageFile].filter(Boolean).map(file => `${file.name} (${formatSize(file.size)})`).join(' · ')}
                    </p>
                  )}

                  {form.video_url && (
                    <div className="promo-admin-current">
                      <span>Video: {form.video_url.split('/').pop()}</span>
                      <button type="button" onClick={() => updateField('video_url', '')}><Trash2 size={12} /> Remove</button>
                    </div>
                  )}
                  {form.image_url && (
                    <div className="promo-admin-current">
                      <span>Poster: {form.image_url.split('/').pop()}</span>
                      <button type="button" onClick={() => updateField('image_url', '')}><Trash2 size={12} /> Remove</button>
                    </div>
                  )}

                  <p className="promo-admin-help">An H.264 MP4 plays on every phone and desktop browser. Keep it around 15 seconds, and add a poster image so something shows while the video loads.</p>
                </div>

                <div className="promo-admin-media">
                  <div className="promo-admin-row">
                    <label>Show from · optional<input type="datetime-local" value={form.starts_at} onChange={event => updateField('starts_at', event.target.value)} /></label>
                    <label>Hide after · optional<input type="datetime-local" value={form.ends_at} onChange={event => updateField('ends_at', event.target.value)} /></label>
                  </div>
                  <label className="promo-admin-check">
                    <input type="checkbox" checked={form.is_active} onChange={event => updateField('is_active', event.target.checked)} />
                    Live for visitors
                  </label>
                  <p className="promo-admin-help">Leave the dates empty to keep it running. One popup at a time - the newest live one wins.</p>
                </div>

                <div className="promo-admin-actions">
                  <button className="button button-primary" type="submit" disabled={saving}>
                    {saving ? <><Upload size={15} /> Saving…</> : <><Save size={15} /> {form.id ? 'Update popup' : 'Save popup'}</>}
                  </button>
                  {form.id && <button className="promo-admin-secondary" type="button" onClick={clearForm}><Plus size={15} /> New popup</button>}
                </div>
              </form>
            </div>

            <aside className="promo-admin-side">
              <div className="promo-admin-card">
                <h2>Visitor preview</h2>
                <p>The actual popup, not a look-alike: same width, same muted autoplay, same button.</p>
                <div className="promo-admin-preview">
                  <PromoPreview promo={previewPromo} />
                </div>
                <p className="promo-admin-help">
                  After saving, open the home page in a <strong>new tab</strong> - the popup shows once per tab, so a tab that
                  already saw it stays clear. <a href="/" target="_blank" rel="noopener noreferrer">Open the home page</a>.
                </p>
              </div>

              <div className="promo-admin-card">
                <div className="promo-admin-section-heading">
                  <h2>Saved popups</h2>
                  <button type="button" onClick={loadPromos} disabled={dataLoading}><RefreshCw size={15} /> {dataLoading ? 'Refreshing…' : 'Refresh'}</button>
                </div>

                {dataLoading && !promos.length ? (
                  <p className="promo-admin-state">Loading popups…</p>
                ) : promos.length ? promos.map(promo => (
                  <article className="promo-admin-item" key={promo.id}>
                    <div className="promo-admin-item-top">
                      <span className={`promo-admin-status ${promo.is_active ? 'is-live' : 'is-off'}`}>{describePromoSchedule(promo)}</span>
                      <small>{formatDate(promo.created_at)}</small>
                    </div>
                    <h3>{promo.headline}</h3>
                    {promo.body && <p>{promo.body.length > 110 ? `${promo.body.slice(0, 110)}…` : promo.body}</p>}
                    <small>{promo.video_url ? 'Video attached' : promo.image_url ? 'Image only' : 'Text only'}</small>
                    <div className="promo-admin-item-actions">
                      <button type="button" onClick={() => handleToggleActive(promo)} disabled={Boolean(busyId)}>
                        {promo.is_active ? 'Switch off' : 'Switch on'}
                      </button>
                      <button type="button" onClick={() => handleEdit(promo)} disabled={Boolean(busyId)}><Pencil size={13} /> Edit</button>
                      <button className="is-danger" type="button" onClick={() => handleDelete(promo)} disabled={Boolean(busyId)}><Trash2 size={13} /> Delete</button>
                    </div>
                  </article>
                )) : (
                  <p className="promo-admin-state">No popups yet. Paste the text above, upload the video and save the first one.</p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}