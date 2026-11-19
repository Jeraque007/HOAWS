import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import './NotFound.css'

/**
 * Rendered for every URL that is not a real page (the `*` route).
 *
 * It intentionally renders no canonical of its own: `resolveRouteMeta` marks
 * unknown paths noindex, so a typo or a crawler-probed URL can never be filed
 * as a duplicate of the home page again.
 */
export default function NotFound() {
  return (
    <main>
      <PageHero
        kicker="404"
        title={<>Page not <em>found.</em></>}
        copy="That address does not lead anywhere. Everything worth finding is a click away."
      />
      <section className="section not-found">
        <div className="container not-found-inner">
          <p className="not-found-note">
            The page may have moved, or the link may be out of date. If you were
            after our work or our services, start from the home page.
          </p>
          <Link className="button button-primary" to="/">Back to home</Link>
        </div>
      </section>
    </main>
  )
}
