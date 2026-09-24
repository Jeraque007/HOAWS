import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import './Home.css'

export default function Home() {
  return (
    <div className="page home-page">
      <SEO
        title="Home"
        description="Discover Tessera Lumen - Oracle of Sophia by S.A.E. The first 100 customers who use the app can receive a free intuitive tarot reading."
        path="/"
      />

      <section className="announcement-strip" aria-label="Tessera Lumen offer">
  <div className="announcement-track">
    {/* Group 1 */}
    <div className="announcement-group">
      <span>Free readings for the first 100 customers</span>
      <span className="announcement-separator" aria-hidden="true">◆</span>
      <a href="https://app.963.co.za" target="_blank" rel="noopener noreferrer">
        Open Tessera Lumen
      </a>
      <span className="announcement-separator" aria-hidden="true">◆</span>
    </div>
    {/* Group 2 (identical copy) */}
    <div className="announcement-group" aria-hidden="true">
      <span>Free readings for the first 100 customers</span>
      <span className="announcement-separator" aria-hidden="true">◆</span>
      <a href="https://app.963.co.za" target="_blank" rel="noopener noreferrer">
        Open Tessera Lumen
      </a>
      <span className="announcement-separator" aria-hidden="true">◆</span>
    </div>
  {/* Group 3 - ADD THIS */}
    <div className="announcement-group" aria-hidden="true">
      <span>Free readings for the first 100 customers</span>
      <span className="announcement-separator" aria-hidden="true">◆</span>
      <a href="https://app.963.co.za" target="_blank" rel="noopener noreferrer">
        Open Tessera Lumen
      </a>
      <span className="announcement-separator" aria-hidden="true">◆</span>
    </div>
    {/* Group 4 - ADD THIS */}
    <div className="announcement-group" aria-hidden="true">
      <span>Free readings for the first 100 customers</span>
      <span className="announcement-separator" aria-hidden="true">◆</span>
      <a href="https://app.963.co.za" target="_blank" rel="noopener noreferrer">
        Open Tessera Lumen
      </a>
      <span className="announcement-separator" aria-hidden="true">◆</span>
    </div>
  </div>
</section>

      <section className="hero">
        <div className="hero-content">
          <h1>
            Business Strategy &amp; <span className="accent">Nervous System Recalibration</span>
          </h1>
          <p className="hero-method">Creator of the S.A.E.&trade; Method &mdash; Sovereign Authority Expansion</p>
          <p className="hero-subtitle">
            I help leaders and business owners unlock clarity, authority, and expansion 
            through the S.A.E.&trade; Method.
          </p>
          <div className="hero-actions">
            <a href="https://wa.me/+27848331128" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
              Book a Session
            </a>
            <a href="/integrated-solutions" className="btn btn-outline">
              Explore Solutions
            </a>
            <Link to="/card" className="btn-card-thumb" aria-label="View Digital Business Card">
              <span className="btn-card-text">Digital Card</span>
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-circle">
            <img src="/images/transparentlogo.png" alt="S.A.E. Logo" className="hero-logo-img" />
          </div>
        </div>
      </section>

      <section className="sae-pillars">
        <div className="section-header">
          <h2>The S.A.E.&trade; Method</h2>
          <p>Three pillars of transformation for leaders ready to operate from wholeness.</p>
        </div>
        <div className="pillars-grid">
          <div className="pillar-card gold-card">
            <img src="/images/Sovereign.png" alt="Sovereign" className="pillar-img" />
            <h3>Sovereign</h3>
            <p>Reclaim your internal leadership and self-trust. Step into full ownership of your decisions, energy, and direction.</p>
          </div>
          <div className="pillar-card gold-card">
            <img src="/images/Authority.png" alt="Authority" className="pillar-img" />
            <h3>Authority</h3>
            <p>Strengthen and stabilise decision-making and direction. Eliminate internal conflict and lead with grounded certainty.</p>
          </div>
          <div className="pillar-card gold-card">
            <img src="/images/Expansion.png" alt="Expansion" className="pillar-img" />
            <h3>Expansion</h3>
            <p>Create aligned growth in business and life. Scale results, income, and impact from a regulated state.</p>
          </div>
        </div>
      </section>

      <section className="services-overview">
        <div className="section-header">
          <h2>What We Offer</h2>
          <p>Tailored pathways for individuals and organisations ready to evolve.</p>
        </div>
        <div className="services-grid">
          <div className="service-card">
            <img src="/images/holistichealing.jpg" alt="Holistic Healing" className="service-img" />
            <h3>Holistic Healing</h3>
            <p>Energy work, breathwork, and somatic practices designed to restore balance and activate your innate capacity for self-healing.</p>
          </div>
          <div className="service-card">
            <img src="/images/medium-shot-woman-stretching-work.jpg" alt="Corporate Integration" className="service-img" />
            <h3>Corporate Integration</h3>
            <p>Workshops, team alignment sessions, and leadership coaching that translate wellness principles into workplace performance.</p>
          </div>
          <div className="service-card">
            <img src="/images/personal.jpg" alt="Personal Transformation" className="service-img" />
            <h3>Personal Transformation</h3>
            <p>One-on-one guidance through life transitions, spiritual development, and conscious evolution practices.</p>
          </div>
        </div>
      </section>

      <section className="about-preview">
        <div className="about-img-wrap">
          <img src="/images/FB_IMG_1677415557400.jpg" alt="Sylvana" className="about-img" />
        </div>
        <div className="about-text">
          <h2>Meet the Practitioner</h2>
          <p>
            Sylvana is the creator of the S.A.E.&trade; Method &mdash; a framework designed for leaders 
            who are ready to operate from a place of sovereignty, authority, and expansion. Through 
            nervous system recalibration and intuitive strategy, she guides clients from survival mode 
            into aligned, scalable growth.
          </p>
          <a href="https://wa.me/+27848331128" className="btn btn-outline" target="_blank" rel="noopener noreferrer">
            Get in Touch
          </a>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Begin?</h2>
        <p>Your journey toward integration starts with a single step. Book a consultation and let us map out your path together.</p>
        <a href="https://cal.eu/sae-method" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
          Schedule Your Session
        </a>
      </section>
    </div>
  )
}
