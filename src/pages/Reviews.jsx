import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import PageHero from '../components/PageHero'
import ReviewList from '../components/ReviewList'
import ReviewForm from '../components/ReviewForm'
import { fallbackReview } from '../lib/site'
import { getApprovedReviews, saveReview } from '../lib/supabase'
import './Reviews.css'

export default function Reviews() {
  const [approvedReviews, setApprovedReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getApprovedReviews().then(({ data, error: loadError }) => {
      if (!active) return
      setApprovedReviews(data?.length ? data : [fallbackReview])
      if (loadError) setReviewsError('')
      setReviewsLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (form.get('website')) return
    if (Date.now() - Number(form.get('started')) < 1800) {
      setError('Please take a moment to complete the form.')
      return
    }

    setSubmitting(true)
    setError('')
    const { error: saveError } = await saveReview({
      name: form.get('name'),
      rating: Number(form.get('rating')),
      message: form.get('message'),
    })
    setSubmitting(false)

    if (saveError) {
      setError(saveError.message === 'Reviews are not configured yet.'
        ? 'Reviews are not connected yet. Please email us directly.'
        : 'Something went wrong. Please try again or email us directly.')
      return
    }

    setSubmitted(true)
  }

  return (
    <main>
      <SEO
        title="Reviews | HOAWS"
        description="Read client feedback and share your experience working with HOAWS."
        path="/reviews"
      />

      <PageHero kicker="Reviews" title={<>Kind words from<br /><em>good people.</em></>} copy="Every project is a collaboration. Here's what a few of ours have had to say." />
      <section className="section reviews-page">
        <div className="container reviews-grid">
          <ReviewList
            reviews={approvedReviews}
            loading={reviewsLoading}
            error={reviewsError}
            fallback={fallbackReview}
          />

          <div className="review-form-wrap">
            <p className="eyebrow">Share your experience</p>
            <h2>Leave a note.</h2>

            <ReviewForm
              onSubmit={handleSubmit}
              submitted={submitted}
              submitting={submitting}
              error={error}
            />

            <Link className="review-admin-link" to="/reviews/admin">Review moderation</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
