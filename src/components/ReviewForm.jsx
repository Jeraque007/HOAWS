import { ArrowUpRight, Check } from 'lucide-react'
import './ReviewForm.css'

export default function ReviewForm({ onSubmit, submitted, submitting, error }) {
  if (submitted) {
    return (
      <div className="success-message">
        <Check size={26} />
        <h3>Thank you for the kind words.</h3>
        <p>Your review is awaiting approval and will appear here once it has been reviewed.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" name="started" value={Date.now()} />
      <label>Your name<input required minLength="1" maxLength="120" name="name" placeholder="e.g. Thandi M." /></label>
      <label>Rating<select name="rating" defaultValue="5"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select></label>
      <label>Your message<textarea required minLength="1" maxLength="2000" name="message" rows="4" placeholder="Tell us about working together..."></textarea></label>
      <input className="honeypot" name="website" tabIndex="-1" autoComplete="off" />
      <button className="button button-primary" type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Submit review'} <ArrowUpRight size={17} /></button>
      <p className="review-pending-note">Reviews are checked before they appear publicly.</p>
      {error && <p className="form-error">{error}</p>}
    </form>
  )
}
