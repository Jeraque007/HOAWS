import './ReviewStars.css'

export default function ReviewStars({ rating }) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0))

  return (
    <div className="stars" aria-label={`${safeRating} out of 5 stars`}>
      {'★'.repeat(safeRating)}{'☆'.repeat(5 - safeRating)}
    </div>
  )
}
