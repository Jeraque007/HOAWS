import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Bell, Check, LogOut, RefreshCw, ShieldCheck, X } from 'lucide-react'
import {
  getAdminSession,
  getReviewModerationData,
  markReviewNotificationRead,
  signInAdmin,
  signOutAdmin,
  subscribeToAdminAuth,
  updateReviewStatus,
} from './supabase'

function errorMessage(error, fallback) {
  return error?.message || fallback
}

function formatDate(value) {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function Stars({ rating }) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0))
  return (
    <div className="stars" aria-label={`${safeRating} out of 5 stars`}>
      {'★'.repeat(safeRating)}{'☆'.repeat(5 - safeRating)}
    </div>
  )
}

export default function ReviewAdmin() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authSubmitting, setAuthSubmitting] = useState(false)
  const [reviews, setReviews] = useState([])
  const [notifications, setNotifications] = useState([])
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState('')
  const [actionId, setActionId] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')

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

  const loadModerationData = useCallback(async () => {
    if (!session) return
    setDataLoading(true)
    setDataError('')
    try {
      const { data, error } = await getReviewModerationData()
      if (error) {
        setDataError(errorMessage(error, 'Reviews could not be loaded.'))
      } else {
        setReviews(data?.reviews || [])
        setNotifications(data?.notifications || [])
      }
    } catch (error) {
      setDataError(errorMessage(error, 'Reviews could not be loaded.'))
    } finally {
      setDataLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (!session) {
      setReviews([])
      setNotifications([])
      setDataError('')
      return
    }
    loadModerationData()
  }, [session, loadModerationData])

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
    setActionError('')
    const { error } = await signOutAdmin()
    if (error) setActionError(errorMessage(error, 'Sign out failed.'))
    else setSession(null)
  }

  async function handleStatusChange(reviewId, status) {
    setActionId(`${reviewId}:${status}`)
    setActionError('')
    setNotice('')
    try {
      const { data, error } = await updateReviewStatus(reviewId, status)
      if (error) {
        setActionError(errorMessage(error, 'The review status could not be updated.'))
        return
      }
      if (data) {
        setReviews(current => current.map(review => review.id === reviewId ? data : review))
      }
      setNotice(`Review ${status}.`)
    } catch (error) {
      setActionError(errorMessage(error, 'The review status could not be updated.'))
    } finally {
      setActionId('')
    }
  }

  async function handleMarkRead(notificationId) {
    setActionError('')
    const { data, error } = await markReviewNotificationRead(notificationId)
    if (error) {
      setActionError(errorMessage(error, 'The notification could not be updated.'))
      return
    }
    if (data) {
      setNotifications(current => current.map(notification => notification.id === notificationId ? { ...notification, ...data } : notification))
    }
  }

  if (authLoading) {
    return <main className="review-admin-page"><div className="review-admin-state">Checking admin session…</div></main>
  }

  if (!session) {
    return (
      <main className="review-admin-page">
        <section className="page-hero review-admin-hero">
          <div className="container page-hero-inner">
            <p className="eyebrow">Private workspace</p>
            <h1>Review<br /><em>moderation.</em></h1>
            <p className="page-hero-copy">Sign in to review submissions before they appear on the public Reviews page.</p>
          </div>
        </section>
        <section className="section review-admin-section">
          <div className="container">
            <form className="review-admin-login" onSubmit={handleSignIn}>
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

  const pendingCount = reviews.filter(review => review.status === 'pending').length
  const unreadCount = notifications.filter(notification => !notification.read_at).length

  return (
    <main className="review-admin-page">
      <section className="page-hero review-admin-hero">
        <div className="container page-hero-inner">
          <p className="eyebrow">Private workspace</p>
          <h1>Review<br /><em>moderation.</em></h1>
          <p className="page-hero-copy">Keep public reviews thoughtful by approving or rejecting incoming submissions.</p>
        </div>
      </section>
      <section className="section review-admin-section">
        <div className="container">
          <div className="review-admin-toolbar">
            <div>
              <Link className="review-admin-back" to="/reviews"><ArrowLeft size={15} /> Back to Reviews</Link>
              <p className="eyebrow">Signed in as {session.user?.email || 'administrator'}</p>
            </div>
            <button className="review-admin-signout" type="button" onClick={handleSignOut}><LogOut size={15} /> Sign out</button>
          </div>

          {notice && <p className="review-admin-notice" role="status">{notice}</p>}
          {(actionError || dataError) && <p className="form-error" role="alert">{actionError || dataError}</p>}

          <div className="review-admin-stats">
            <div><strong>{pendingCount}</strong><span>Pending</span></div>
            <div><strong>{unreadCount}</strong><span>Unread alerts</span></div>
            <div><strong>{reviews.length}</strong><span>Total reviews</span></div>
          </div>

          <div className="review-admin-content">
            <div>
              <div className="review-admin-section-heading">
                <h2>Submissions</h2>
                <button type="button" onClick={loadModerationData} disabled={dataLoading}><RefreshCw size={15} /> {dataLoading ? 'Refreshing…' : 'Refresh'}</button>
              </div>
              {dataLoading && !reviews.length ? (
                <p className="review-admin-state">Loading reviews…</p>
              ) : reviews.length ? reviews.map(review => (
                <article className="review-admin-card" key={review.id}>
                  <div className="review-admin-card-top"><Stars rating={review.rating} /><span className={`review-status review-status-${review.status}`}>{review.status}</span></div>
                  <h3>{review.name}</h3>
                  <p>{review.message}</p>
                  <small>Submitted {formatDate(review.created_at)}</small>
                  <div className="review-admin-actions">
                    <button type="button" onClick={() => handleStatusChange(review.id, 'approved')} disabled={Boolean(actionId) || review.status === 'approved'}><Check size={15} /> Approve</button>
                    <button type="button" onClick={() => handleStatusChange(review.id, 'rejected')} disabled={Boolean(actionId) || review.status === 'rejected'}><X size={15} /> Reject</button>
                  </div>
                </article>
              )) : <p className="review-admin-state">No submissions yet.</p>}
            </div>

            <aside className="review-admin-alerts">
              <div className="review-admin-section-heading"><h2>Alerts</h2><Bell size={18} /></div>
              {notifications.length ? notifications.map(notification => (
                <button className={`review-admin-alert ${notification.read_at ? 'is-read' : ''}`} type="button" key={notification.id} onClick={() => !notification.read_at && handleMarkRead(notification.id)}>
                  <span>{notification.notification_type === 'review_submitted' ? 'New review submitted' : 'Review updated'}</span>
                  <small>{formatDate(notification.created_at)}</small>
                </button>
              )) : <p className="review-admin-state">No alerts.</p>}
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}
