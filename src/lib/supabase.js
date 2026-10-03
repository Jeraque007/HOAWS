import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const reviewFields = 'id, name, rating, message, status, created_at, reviewed_at'

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

function configurationError(feature = 'Reviews') {
  return new Error(`${feature} are not configured yet.`)
}

export async function saveReview(review) {
  if (!supabase) return { data: null, error: configurationError() }

  const { error } = await supabase.from('reviews').insert({
    name: String(review.name || '').trim(),
    rating: Number(review.rating),
    message: String(review.message || '').trim(),
  })

  return { data: null, error }
}

export async function getApprovedReviews() {
  if (!supabase) return { data: [], error: configurationError() }

  return supabase
    .from('reviews')
    .select(reviewFields)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(12)
}

export async function getAdminSession() {
  if (!supabase) return { data: { session: null }, error: configurationError() }
  return supabase.auth.getSession()
}

export function subscribeToAdminAuth(callback) {
  if (!supabase) return () => {}

  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}

export async function signInAdmin(email, password) {
  if (!supabase) return { data: null, error: configurationError() }
  return supabase.auth.signInWithPassword({ email: email.trim(), password })
}

export async function signOutAdmin() {
  if (!supabase) return { error: configurationError() }
  return supabase.auth.signOut()
}

export async function getReviewModerationData() {
  if (!supabase) return { data: null, error: configurationError() }

  const [reviewsResult, notificationsResult] = await Promise.all([
    supabase
      .from('reviews')
      .select(reviewFields)
      .order('created_at', { ascending: false }),
    supabase
      .from('review_notifications')
      .select('id, review_id, notification_type, read_at, created_at')
      .order('created_at', { ascending: false }),
  ])

  if (reviewsResult.error) return { data: null, error: reviewsResult.error }
  if (notificationsResult.error) return { data: null, error: notificationsResult.error }

  return {
    data: {
      reviews: reviewsResult.data || [],
      notifications: notificationsResult.data || [],
    },
    error: null,
  }
}

export async function updateReviewStatus(reviewId, status) {
  if (!supabase) return { data: null, error: configurationError() }
  if (!['approved', 'rejected'].includes(status)) {
    return { data: null, error: new Error('Invalid review status.') }
  }

  return supabase
    .from('reviews')
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq('id', reviewId)
    .select(reviewFields)
    .single()
}

export async function markReviewNotificationRead(notificationId) {
  if (!supabase) return { data: null, error: configurationError() }

  return supabase
    .from('review_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .select('id, read_at')
    .single()
}

/* ---------------------------------------------------------------------------
   Home page announcement popup (public.promo_popups + the "promo-media" bucket)
   --------------------------------------------------------------------------- */

const promoFields = 'id, kicker, headline, body, quote, attribution, image_url, video_url, cta_label, cta_url, is_active, starts_at, ends_at, created_at, updated_at'

function promoConfigurationError() {
  return new Error('The announcement popup is not configured yet.')
}

/** Trims a field and swaps empty strings for nulls so optional columns stay clean. */
function trimToNull(value, maxLength) {
  const text = String(value ?? '').trim()
  return text ? text.slice(0, maxLength) : null
}

function promoPayload(promo) {
  return {
    kicker: trimToNull(promo.kicker, 60),
    headline: trimToNull(promo.headline, 120) || 'Announcement',
    body: trimToNull(promo.body, 1200),
    quote: trimToNull(promo.quote, 300),
    attribution: trimToNull(promo.attribution, 120),
    image_url: trimToNull(promo.image_url, 600),
    video_url: trimToNull(promo.video_url, 600),
    cta_label: trimToNull(promo.cta_label, 60),
    cta_url: trimToNull(promo.cta_url, 600),
    is_active: Boolean(promo.is_active),
    starts_at: promo.starts_at || null,
    ends_at: promo.ends_at || null,
  }
}

/**
 * The newest popup a visitor is allowed to see. Row-level security already hides
 * switched-off and out-of-window rows; the extra check is a cheap safety net.
 */
export async function getActivePromo() {
  if (!supabase) return { data: null, error: promoConfigurationError() }

  const { data, error } = await supabase
    .from('promo_popups')
    .select(promoFields)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) return { data: null, error }

  const now = Date.now()
  const live = (data || []).find(promo => {
    const startsAt = promo.starts_at ? new Date(promo.starts_at).getTime() : NaN
    const endsAt = promo.ends_at ? new Date(promo.ends_at).getTime() : NaN
    if (Number.isFinite(startsAt) && now < startsAt) return false
    if (Number.isFinite(endsAt) && now > endsAt) return false
    return true
  })

  return { data: live || null, error: null }
}

export async function getPromoAdminData() {
  if (!supabase) return { data: null, error: promoConfigurationError() }

  const { data, error } = await supabase
    .from('promo_popups')
    .select(promoFields)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error }

  return { data: { promos: data || [] }, error: null }
}

/** Inserts a new popup, or updates the one whose id is passed in. */
export async function savePromo(promo, promoId) {
  if (!supabase) return { data: null, error: promoConfigurationError() }

  const payload = promoPayload(promo)

  if (promoId) {
    return supabase
      .from('promo_popups')
      .update(payload)
      .eq('id', promoId)
      .select(promoFields)
      .single()
  }

  return supabase
    .from('promo_popups')
    .insert(payload)
    .select(promoFields)
    .single()
}

export async function setPromoActive(promoId, isActive) {
  if (!supabase) return { data: null, error: promoConfigurationError() }

  return supabase
    .from('promo_popups')
    .update({ is_active: Boolean(isActive) })
    .eq('id', promoId)
    .select(promoFields)
    .single()
}

export async function deletePromo(promoId) {
  if (!supabase) return { data: null, error: promoConfigurationError() }

  return supabase
    .from('promo_popups')
    .delete()
    .eq('id', promoId)
}

// Some browsers hand back an empty file.type for .mp4/.webm. The storage client
// would then fall back to "text/plain;charset=UTF-8", which the bucket's
// allowed_mime_types rejects, so resolve a correct type from the extension.
const promoMimeByExtension = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

/**
 * Uploads the popup MP4 (kind = 'video') or poster image (kind = 'image') to the
 * public "promo-media" bucket and returns its public URL.
 */
export async function uploadPromoFile(file, kind = 'video') {
  if (!supabase) return { data: null, error: promoConfigurationError() }
  if (!file) return { data: null, error: new Error('Choose a file to upload first.') }

  const fallbackExtension = kind === 'image' ? 'jpg' : 'mp4'
  const extension = (String(file.name || '').split('.').pop() || fallbackExtension)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') || fallbackExtension
  const fallbackType = kind === 'image' ? 'image/jpeg' : 'video/mp4'
  const contentType = file.type || promoMimeByExtension[extension] || fallbackType
  const folder = kind === 'image' ? 'posters' : 'video'
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`

  const { error } = await supabase.storage
    .from('promo-media')
    .upload(path, file, { cacheControl: '31536000', upsert: false, contentType })

  if (error) return { data: null, error }

  const { data } = supabase.storage.from('promo-media').getPublicUrl(path)
  return { data: { path, url: data?.publicUrl || '' }, error: null }
}
