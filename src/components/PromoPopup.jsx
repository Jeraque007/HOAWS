import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Pause, Play, X } from 'lucide-react'
import { getActivePromo } from '../lib/supabase'
import { isPromoLive } from '../lib/promo'
import './PromoPopup.css'

// How long the page is left alone before the popup appears, so it never competes
// with the first paint of the landing page.
const SHOW_DELAY_MS = 900
// Safety net: the popup closes itself rather than ever blocking the site.
const AUTO_DISMISS_MS = 25000
// A deliberate scroll of this many pixels counts as "they are reading the site now".
const SCROLL_DISMISS_PX = 40
// One viewing per browser session, per popup. Swap sessionStorage for
// localStorage here if it should be limited to once per visitor per day instead.
const SEEN_PREFIX = 'hoaws-promo-seen:'

function hasSeenPromo(id) {
  try {
    return window.sessionStorage.getItem(`${SEEN_PREFIX}${id}`) === '1'
  } catch (error) {
    return false
  }
}

function rememberPromo(id) {
  try {
    window.sessionStorage.setItem(`${SEEN_PREFIX}${id}`, '1')
  } catch (error) {
    // Storage blocked (private mode): the popup simply appears again next visit.
  }
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined

    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = (event) => setReduced(event.matches)
    setReduced(query.matches)

    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', apply)
      return () => query.removeEventListener('change', apply)
    }
    query.addListener(apply)
    return () => query.removeListener(apply)
  }, [])

  return reduced
}

/**
 * The visual body of the popup: optional square media (MP4 or poster image)
 * plus the copy. Exported so the admin page can render the exact same thing as
 * a live preview.
 *
 *   autoPlayVideo - true in the popup (muted autoplay + a W3C 2.2.2 pause
 *                   control), false in the admin preview (native controls).
 */
export function PromoCard({ promo, reducedMotion = false, autoPlayVideo = false }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  const videoUrl = promo?.video_url || ''
  const imageUrl = promo?.image_url || ''
  const hasVideo = Boolean(videoUrl)
  const hasImage = Boolean(imageUrl)
  const autoplay = autoPlayVideo && !reducedMotion

  // iOS and Chrome only allow autoplay on a genuinely muted, inline video, so
  // set the properties on the element itself instead of trusting the attributes.
  // Muted autoplay is also what keeps this compliant with mobile autoplay rules.
  useEffect(() => {
    const video = videoRef.current
    if (!video || !autoplay) return
    video.muted = true
    video.defaultMuted = true
    const attempt = video.play()
    if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {})
  }, [autoplay, videoUrl])

  function toggleVideo() {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      const attempt = video.play()
      if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {})
    } else {
      video.pause()
    }
  }

  return (
    <article className="promo-card">
      {(hasVideo || hasImage) && (
        <div className="promo-card-media">
          {hasVideo ? (
            <>
              <video
                ref={videoRef}
                className="promo-card-video"
                src={videoUrl}
                poster={hasImage ? imageUrl : undefined}
                muted
                loop
                playsInline
                autoPlay={autoplay}
                controls={!autoplay}
                preload="metadata"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
              {autoplay && (
                <button
                  className="promo-card-media-toggle"
                  type="button"
                  onClick={toggleVideo}
                  aria-label={playing ? 'Pause the announcement video' : 'Play the announcement video'}
                >
                  {playing ? <Pause size={13} /> : <Play size={13} />}
                </button>
              )}
            </>
          ) : (
            <img className="promo-card-image" src={imageUrl} alt="" loading="lazy" decoding="async" />
          )}
        </div>
      )}

      <div className="promo-card-copy">
        {promo.kicker && <p className="promo-card-kicker">{promo.kicker}</p>}
        {promo.headline && <h2 className="promo-card-title">{promo.headline}</h2>}
        {promo.body && <p className="promo-card-body">{promo.body}</p>}
        {promo.quote && (
          <blockquote className="promo-card-quote">
            <p>{promo.quote}</p>
            {promo.attribution && <cite>{promo.attribution}</cite>}
          </blockquote>
        )}
        {promo.cta_label && promo.cta_url && (
          <a className="promo-card-cta" href={promo.cta_url} target="_blank" rel="noopener noreferrer">
            {promo.cta_label} <ArrowUpRight size={15} />
          </a>
        )}
      </div>
    </article>
  )
}

/**
 * The popup's dialog chrome: close button, the shared card, and the "Enter site"
 * button. Both the live popup and the /promos/admin preview render this, so the
 * two can never drift apart.
 *
 *   preview - renders the identical markup but nothing is interactive (the close
 *             and enter controls become inert spans and the dialog is hidden
 *             from assistive tech), so the admin page can show an honest,
 *             click-free picture of what visitors get.
 */
export function PromoDialog({
  promo,
  reducedMotion = false,
  autoPlayVideo = false,
  preview = false,
  onDismiss,
  dialogRef,
  closeRef,
}) {
  const label = promo?.headline ? `Announcement: ${promo.headline}` : 'Announcement'

  return (
    <div
      className="promo-popup-dialog"
      role={preview ? 'presentation' : 'dialog'}
      aria-modal={preview ? undefined : 'true'}
      aria-label={preview ? undefined : label}
      aria-hidden={preview ? 'true' : undefined}
      ref={dialogRef}
      tabIndex={preview ? undefined : -1}
    >
      {preview ? (
        <span className="promo-popup-close" aria-hidden="true"><X size={18} /></span>
      ) : (
        <button className="promo-popup-close" type="button" onClick={onDismiss} ref={closeRef} aria-label="Close the announcement">
          <X size={18} />
        </button>
      )}

      <PromoCard promo={promo} reducedMotion={reducedMotion} autoPlayVideo={autoPlayVideo} />

      {preview ? (
        <span className="promo-popup-enter button button-primary">Enter site <ArrowUpRight size={16} /></span>
      ) : (
        <button className="promo-popup-enter button button-primary" type="button" onClick={onDismiss}>
          Enter site <ArrowUpRight size={16} />
        </button>
      )}
    </div>
  )
}

/**
 * Non-interactive copy of the live popup for /promos/admin. It is the same
 * PromoDialog, only laid out inside the admin panel instead of over the page.
 */
export function PromoPreview({ promo }) {
  return (
    <div className="promo-popup promo-popup-preview" role="presentation">
      <PromoDialog promo={promo} autoPlayVideo preview />
    </div>
  )
}

/**
 * Home page announcement popup. Shows the newest live popup to every visitor,
 * once per browser session, and gets out of the way at the first sign of
 * interest: "Enter site", Esc, the close button, a tap outside, a scroll/swipe,
 * or a short timeout. Renders nothing when there is no live popup.
 */
export default function PromoPopup() {
  const [promo, setPromo] = useState(null)
  const [visible, setVisible] = useState(false)
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const restoreFocusRef = useRef(null)
  const reducedMotion = useReducedMotion()

  // One lookup per page load. Any failure (including an unconfigured Supabase)
  // stays silent for visitors - the site simply carries on without a popup.
  useEffect(() => {
    let active = true

    getActivePromo()
      .then(({ data }) => {
        if (!active || !data || !isPromoLive(data) || hasSeenPromo(data.id)) return
        setPromo(data)
      })
      .catch(() => {})

    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!promo) return undefined
    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [promo])

  const dismiss = useCallback(() => {
    setVisible(false)
    if (promo?.id) rememberPromo(promo.id)
  }, [promo])

  // Esc closes; Tab stays inside the dialog while it is open.
  useEffect(() => {
    if (!visible) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        dismiss()
        return
      }
      if (event.key !== 'Tab') return

      const dialog = dialogRef.current
      if (!dialog) return

      const focusable = dialog.querySelectorAll('a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])')
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [visible, dismiss])

  // Scrolling, wheeling or swiping the page means the visitor has started
  // reading, so the popup steps aside. Gestures inside the card (its own scroll
  // area) are ignored.
  useEffect(() => {
    if (!visible) return undefined

    const isInsideCard = (event) => Boolean(
      dialogRef.current && event.target instanceof Node && dialogRef.current.contains(event.target)
    )
    const startY = window.scrollY
    const onScroll = () => {
      if (Math.abs(window.scrollY - startY) > SCROLL_DISMISS_PX) dismiss()
    }
    const onGesture = (event) => {
      if (!isInsideCard(event)) dismiss()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onGesture, { passive: true })
    window.addEventListener('touchmove', onGesture, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onGesture)
      window.removeEventListener('touchmove', onGesture)
    }
  }, [visible, dismiss])

  useEffect(() => {
    if (!visible) return undefined
    const timer = window.setTimeout(dismiss, AUTO_DISMISS_MS)
    return () => window.clearTimeout(timer)
  }, [visible, dismiss])

  // Move focus into the popup, then hand it back to whatever had it.
  useEffect(() => {
    if (!visible) return undefined

    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const target = closeRef.current || dialogRef.current
    if (target) target.focus()

    return () => { restoreFocusRef.current?.focus?.() }
  }, [visible])

  if (!promo || !visible) return null

  return (
    <div
      className="promo-popup"
      role="presentation"
      onClick={(event) => { if (event.target === event.currentTarget) dismiss() }}
    >
      <PromoDialog
        promo={promo}
        reducedMotion={reducedMotion}
        autoPlayVideo
        onDismiss={dismiss}
        dialogRef={dialogRef}
        closeRef={closeRef}
      />
    </div>
  )
}