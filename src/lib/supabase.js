import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const reviewFields = 'id, name, rating, message, status, created_at, reviewed_at'

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

function configurationError() {
  return new Error('Reviews are not configured yet.')
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
