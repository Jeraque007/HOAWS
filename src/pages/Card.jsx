import { useState } from 'react'
import { Instagram, MessageCircle, Phone } from 'lucide-react'
import SEO from '../components/SEO'
import PageHero from '../components/PageHero'
import { contactEmail, socials, whatsapp } from '../lib/site'
import homeLogo from '../assets/hoaws-translucent.png'
import digitalCardFront from '../assets/hoaws-vcf.png'
import './Card.css'

const [instagram, facebook, tiktok] = socials

export default function Card() {
  const [flipped, setFlipped] = useState(false)

  function toggleCard(event) {
    if (event.target.closest?.('a, button')) return
    setFlipped(current => !current)
  }

  function handleCardKeyDown(event) {
    if (event.target.closest?.('a, button')) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setFlipped(current => !current)
    }
  }

  return (
    <main className="digital-card-page">
      <SEO
        title="Digital Card | HOAWS"
        description="Save, call, and connect with HOAWS from one digital business card."
        path="/digital-card"
      />

      <PageHero kicker="Digital Card" title={<>Tap to flip<br /><em>your card.</em></>} copy="Download, save, call, and connect with HOAWS from a single digital touchpoint." />

      <section className="section card-section">
        <div className="container card-stack">
          <div
            className={`digital-card ${flipped ? 'is-flipped' : ''}`}
            onClick={toggleCard}
            onKeyDown={handleCardKeyDown}
            role="button"
            tabIndex="0"
            aria-label="Flip business card"
          >
            <div className="digital-card-inner">
              <div className="digital-card-face digital-card-front">
                <div className="card-brand-row">
                  <img src={homeLogo} alt="HOAWS" />
                  <span>HOAWS</span>
                </div>
                <div className="card-profile">
                  <h3>Digital &amp; Business Transformation</h3>
                  <p>Strategy • Websites • Social • Brand systems</p>
                </div>
                <img className="front-card-image" src={digitalCardFront} alt="HOAWS business card front" />
              </div>

              <div className="digital-card-face digital-card-back">
                <div className="card-brand-row">
                  <img src={homeLogo} alt="HOAWS" />
                  <span>Connect</span>
                </div>

                <div className="card-link-list">
                  <a href={whatsapp} target="_blank" rel="noreferrer"><Phone size={16} /> Call / WhatsApp</a>
                  <a href={`mailto:${contactEmail}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Email</a>
                  <a href={instagram.url} target="_blank" rel="noreferrer"><Instagram size={16} /> Instagram</a>
                  <a href={facebook.url} target="_blank" rel="noreferrer"><span className="facebook-icon">f</span> Facebook</a>
                  <a href={tiktok.url} target="_blank" rel="noreferrer"><span className="tiktok-icon">♪</span> TikTok</a>
                </div>

                <div className="card-actions">
                  <a className="button button-primary" href="/hoaws.vcf" download>Save contact</a>
                  <a className="button button-gold" href={whatsapp} target="_blank" rel="noreferrer">Call now</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
