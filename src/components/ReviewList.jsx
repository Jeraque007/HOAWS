import ReviewStars from './ReviewStars'
import './ReviewList.css'

export default function ReviewList({ reviews, loading, error, fallback }) {
  return (
    <div className="review-list" aria-live="polite">
      {loading ? (
        <p className="review-list-status">Loading published reviews…</p>
      ) : error ? (
        <p className="review-list-status">{error}</p>
      ) : reviews.length ? (
        reviews.map(review => (
          <article className="review-quote review-card" key={review.id}>
            <ReviewStars rating={review.rating} />
            <blockquote>“{review.message}”</blockquote>
            <p>— {review.name}</p>
          </article>
        ))
      ) : (
        <article className="review-quote review-card" key={fallback.id}>
          <ReviewStars rating={fallback.rating} />
          <blockquote>“{fallback.message}”</blockquote>
          <p>— {fallback.name}</p>
        </article>
      )}
    </div>
  )
}
