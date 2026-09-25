import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { ArrowUpRight, Check, ChevronRight, Download, ExternalLink, Instagram, Menu, MessageCircle, Phone, X } from 'lucide-react'
import { saveReview, getApprovedReviews } from './supabase'
import ReviewAdmin from './ReviewAdmin'
import TesseraLumen from './TesseraLumen'
const floatingLogo = '/Hoaws_Translucent.png?v=4'
const homeLogo = floatingLogo
const heroLogo = '/Hoaws%20Name%20Logo.png?v=4'

const digitalCardFront = '/Hoaws.VCF.png'
const whatsapp = 'https://wa.me/27740145161?text=Hi%20HOAWS%2C%20I%27d%20like%20to%20start%20a%20project.'

const fallbackReview = {
  id: 'hoaws-fallback-review',
  name: 'HOAWS client',
  rating: 5,
  message: 'HOAWS made a complex digital project feel straightforward. The strategy was clear, the work was thoughtful, and every step felt purposeful.',
}

const navItems = [
  ['Home', '/'],
  ['Services', '/services'],
  ['Tessera Lumen', '/tessera-lumen'],
  ['Work', '/work'],
  ['About', '/about'],
  ['Reviews', '/reviews'],
]

const services = [
  { number: '01', title: 'Digital strategy', text: 'Clarity for the next move. We turn ambitious ideas into focused, practical digital roadmaps.', tags: ['Positioning', 'Content systems', 'Growth planning'] },
  { number: '02', title: 'Web experiences', text: 'Fast, purposeful websites that make your business easier to discover, trust and choose.', tags: ['Web design', 'Development', 'SEO foundations'] },
  { number: '03', title: 'Social & content', text: 'A sharper voice for the places your audience already spends their time.', tags: ['Content creation', 'Coaching', 'Campaigns'] },
  { number: '04', title: 'Business systems', text: 'The tools, touchpoints and administration that keep your digital presence working.', tags: ['Digital cards', 'Automation', 'Admin support'] },
]

const workItems = [
  { title: 'S.A.E.', image: '/S.A.E.png', url: 'https://www.sae963.com', type: 'Brand platform' },
  { title: 'ArcEdge', image: '/ArcEdge%20Construction.jpeg', url: 'https://arcedgeconstructions.co.za', type: 'Construction web' },
  { title: 'Tessera Lumen', image: '/TesseraLumen.png', url: 'https://app.963.co.za/', type: 'Oracle app' },
  { title: 'Lumen Social', image: '/LumenSocial.jpg', url: 'https://lumensocial.vercel.app/', type: 'Social product' },
  { title: 'Glass King & Mirror', image: '/Glass%20King%20%26%20Mirror.png', url: '#', type: 'Brand design' },
  { title: 'Candied Revenge', image: '/Candied-Revenge.png', url: '#', type: 'Creative work' },
  { title: 'Clean Scene', image: '/Clean-Scene.png', url: '#', type: 'Service brand' },
  { title: 'Bettor Apps Furniture', image: '/Bettor-Apps-Furniture.png', url: '#', type: 'Retail brand' },
  { title: 'Damon\'s Dairy', image: '/Damon-s-Dairy.png', url: '#', type: 'Product identity' },
  { title: 'Adurah Projects', image: '/Adurah-Projects.png', url: '#', type: 'Launch concept' },
  { title: 'Always Hoopy', image: '/Always-Hoopy.png', url: '#', type: 'Lifestyle brand' },
  { title: 'Ark Boards', image: '/Ark-Boards.png', url: '#', type: 'Brand identity' },
  { title: 'B\'S BraaiGridz', image: '/B%27S%20BraaiGridz.png', url: '#', type: 'Food brand' },
  { title: 'EE & PS', image: '/EE-PS.png', url: '#', type: 'Professional identity' },
  { title: 'Green Service', image: '/Green-Service.png', url: '#', type: 'Service design' },
  { title: 'Silver Marten', image: '/Silver%20Marten.png', url: '#', type: 'Brand story' },
  { title: 'Mullein Zing Tea', image: '/Mullein%20Zing%20Tea.png', url: '#', type: 'Packaging' },
  { title: 'MycroAuro', image: '/MycroAuro%20Mushroom.jpg', url: '#', type: 'Wellness brand' },
  { title: 'RRD', image: '/RRD.png', url: '#', type: 'Creative platform' },
  { title: 'Squeaky Clean', image: '/Squeaky%20Clean.png', url: '#', type: 'Cleaning brand' },
  { title: '963', image: '/963.png', url: '#', type: 'Brand platform' },
  { title: 'BSD', image: '/BSD.png', url: '#', type: 'Business identity' },
  { title: 'Chikara Stables', image: '/Chikara-Stables.png', url: '#', type: 'Equestrian brand' },
  { title: 'Eternal Light', image: '/Eternal-Light.png', url: '#', type: 'Creative identity' },
  { title: 'Holistic 963 Vibration', image: '/Holistic%20963%20Vibration.png', url: '#', type: 'Wellness brand' },
  { title: 'Relax. Renew. Reiki', image: '/Relax.Renew.Reiki.png', url: '#', type: 'Wellness identity' },
  { title: 'Social Media Platform', image: '/SocialMedia-Platform.png', url: '#', type: 'Digital product' },
  { title: 'Tinyare Lifestyle', image: '/Tinyare%20Lifestyle.jpg', url: '#', type: 'Lifestyle brand' },
]

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

const pageMetadata = {
  '/': {
    title: 'HOAWS | Human & Online Administrative / Web Solutions',
    description: 'HOAWS creates digital systems, brands and online experiences that move ambitious businesses forward.',
  },
  '/services': { title: 'Services | HOAWS', description: 'Digital strategy, web experiences, social content, and business systems from HOAWS.' },
  '/tessera-lumen': { title: 'Tessera Lumen | HOAWS', description: 'Tessera Lumen — Oracle of Sophia. Receive intuitive tarot readings online and claim a free reading among the first 100 customers.' },
  '/work': { title: 'Work | HOAWS', description: 'Explore selected digital brands, websites, products, and identities created by HOAWS.' },
  '/about': { title: 'About | HOAWS', description: 'Meet HOAWS and discover the thinking behind its digital and business transformation work.' },
  '/reviews': { title: 'Reviews | HOAWS', description: 'Read client feedback and share your experience working with HOAWS.' },
  '/digital-card': { title: 'Digital Card | HOAWS', description: 'Save, call, and connect with HOAWS from one digital business card.' },
}

function RouteMetadata() {
  const { pathname } = useLocation()

  useEffect(() => {
    const metadata = pageMetadata[pathname] || pageMetadata['/']
    const canonicalUrl = new URL(pathname, 'https://www.hoaws.co.za').toString()
    document.title = metadata.title

    const setMeta = (selector, content, attribute = 'name') => {
      let element = document.head.querySelector(selector)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, selector.includes('property=') ? selector.split('"')[1] : selector.split('"')[1])
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    setMeta('meta[name="description"]', metadata.description)
    setMeta('meta[property="og:title"]', metadata.title, 'property')
    setMeta('meta[property="og:description"]', metadata.description, 'property')
    setMeta('meta[name="twitter:title"]', metadata.title)
    setMeta('meta[name="twitter:description"]', metadata.description)

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)
  }, [pathname])

  return null
}

function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <img src={homeLogo} alt="HOAWS" />
          <span>HOAWS</span>
        </Link>

        <button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>

        <nav className={open ? 'main-nav open' : 'main-nav'}>
          {navItems.map(([label, path]) => (
            <NavLink key={path} to={path} end={path === '/'} onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          ))}
          <a className="nav-cta" href={whatsapp} target="_blank" rel="noreferrer">
            Start a project <ArrowUpRight size={15} />
          </a>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <img className="footer-logo" src={homeLogo} alt="HOAWS" />
          <p className="footer-note">Human &amp; Online Administrative / Web Solutions</p>
        </div>

        <div className="footer-links">
          <p className="eyebrow">Explore</p>
          {navItems.filter(([label]) => label !== 'Digital Card').map(([label, path]) => (
            <Link key={path} to={path}>{label}</Link>
          ))}
        </div>

        <div className="footer-links">
          <p className="eyebrow">Connect</p>
          <a href="mailto:info@hoaws.co.za">info@hoaws.co.za</a>
          <a href={whatsapp} target="_blank" rel="noreferrer">+27 74 014 5161</a>
          <div className="socials">
            <a href="https://www.instagram.com/hoaws.digital/" aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram size={18} /></a>
            <a href="https://www.facebook.com/hoaws.digital" aria-label="Facebook" target="_blank" rel="noreferrer"><span className="facebook-icon">f</span></a>
            <a href="https://www.tiktok.com/@hoaws.digital" aria-label="TikTok" target="_blank" rel="noreferrer"><span className="tiktok-icon">♪</span></a>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} HOAWS. Built for what's next.</span>
        <a href="/hoaws.vcf"><Download size={14} /> Save contact</a>
      </div>
    </footer>
  )
}

function SectionIntro({ kicker, title, copy, action }) {
  return (
    <div className="section-intro">
      <div>
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
      </div>
      {copy && <div className="intro-aside"><p>{copy}</p>{action}</div>}
    </div>
  )
}

function HomeBusinessCardButton() {
  return (
    <Link to="/digital-card" className="home-card-button" aria-label="Open the HOAWS digital business card">
      <img src={digitalCardFront} alt="" aria-hidden="true" />
      <span className="home-card-button-overlay" aria-hidden="true" />
      <span className="home-card-button-content">
        <strong>Digital Card</strong>
        <span className="home-card-button-details">
          <span><MessageCircle size={13} /> info@hoaws.co.za</span>
          <span><Phone size={13} /> +27740145161</span>
          <span><ExternalLink size={13} /> www.hoaws.co.za</span>
        </span>
        <small>Open to view, save &amp; connect</small>
      </span>
      <span className="home-card-button-arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
    </Link>
  )
}

function Home() {
  return (
    <main>
      <div className="home-banner" role="status">
        <div className="home-banner-track">
          <span>Digital strategy, web experiences, and business systems</span>
          <span aria-hidden="true">?</span>
          <Link to="/services">Explore what we do</Link>
          <span aria-hidden="true">?</span>
          <span>Digital strategy, web experiences, and business systems</span>
          <span aria-hidden="true">?</span>
          <Link to="/services">Explore what we do</Link>
        </div>
      </div>
      <section className="hero">
        <div className="hero-grid container">
          <div className="hero-copy reveal">
            <p className="eyebrow">Digital, with intention.</p>
            <h1>
              Make your next<br />
              <em>move</em> matter.
            </h1>
            <p className="hero-text">
              HOAWS is a digital and business transformation practice for people building something worth remembering.
            </p>
            <div className="hero-actions reveal delay-3">
              <a className="button button-primary" href={whatsapp} target="_blank" rel="noreferrer">
                Let&apos;s talk <ArrowUpRight size={17} />
              </a>
              <Link className="text-link" to="/work">
                See our work <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          <div className="hero-visual reveal delay-2">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-brand-lockup">
              <img src={heroLogo} className="hero-name-logo" alt="Hoaws Name Logo" />
            </div>
            <div className="floating-logo" aria-hidden="true">
              <img src={floatingLogo} alt="" />
            </div>
            <span className="visual-caption">
              01 / The digital partner<br />
              behind your next chapter
            </span>
          </div>
        </div>
        <div className="hero-footer container">
          <span>Based in South Africa &middot; working everywhere</span>
          <span className="scroll-cue">Scroll to explore <span /></span>
        </div>
      </section>

      <section className="section home-card-section">
        <div className="container home-card-section-inner">
          <div className="home-card-section-copy">
            <p className="eyebrow">Keep in touch</p>
            <h2>Take our details<br /><span>with you.</span></h2>
            <p>Save the HOAWS contact card for quick access whenever you need us.</p>
          </div>
          <HomeBusinessCardButton />
        </div>
      </section>

      <section className="statement section">
        <div className="container statement-inner">
          <p className="eyebrow">The HOAWS approach</p>
          <h2>
            Good work starts with<br />
            <span>a clear point of view.</span>
          </h2>
          <p className="statement-copy">
            Strategy without the fog. Design with a job to do. Technology that feels human. We bring the thinking and the making together so your business can show up with more clarity.
          </p>
        </div>
      </section>

      <section className="section services-section">
        <div className="container">
          <SectionIntro
            kicker="What we do"
            title={<>Built around your<br /><span>real-world goals.</span></>}
            copy="From the first idea to the final detail, we help ambitious businesses create a digital presence that earns attention and does something with it."
            action={<Link className="text-link" to="/services">Explore services <ChevronRight size={16} /></Link>}
          />

          <div className="service-list">
            {services.map(service => (
              <Link to="/services" className="service-row" key={service.number}>
                <span className="service-number">{service.number}</span>
                <div className="service-main">
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <div className="tag-list">
                    {service.tags.map(tag => <span key={tag}>{tag}</span>)}
                  </div>
                </div>
                <ArrowUpRight className="row-arrow" size={22} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section work-section">
        <div className="container">
          <SectionIntro
            kicker="Selected work"
            title={<>Small teams.<br /><span>Big signal.</span></>}
            copy="A few of the digital places we&apos;ve helped bring to life."
            action={<Link className="text-link" to="/work">View all work <ChevronRight size={16} /></Link>}
          />

          <div className="project-grid">
            {workItems.slice(0, 4).map(item => (
              <a key={item.title} className="project-card cyan" href={item.url} target="_blank" rel="noreferrer">
                <div className="project-art"><img src={item.image} alt={item.title} /></div>
                <div className="project-details">
                  <div>
                    <p className="project-type">{item.type}</p>
                    <h3>{item.title}</h3>
                  </div>
                  <ExternalLink size={17} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark-cta">
        <div className="container cta-inner">
          <div>
            <p className="eyebrow">Have a good idea?</p>
            <h2>Let&apos;s give it<br /><em>somewhere</em> to go.</h2>
          </div>
          <a className="button button-gold" href={whatsapp} target="_blank" rel="noreferrer">
            Start a conversation <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
    </main>
  )
}

function Services() {
  return (
    <main>
      <PageHero kicker="Services" title={<>Make the complex<br /><em>feel possible.</em></>} copy="The right digital partner can turn scattered ideas into a clear, compelling experience. That&apos;s the work we like doing." />
      <section className="section services-page">
        <div className="container service-detail-list">
          {services.map((service, index) => (
            <article className="service-detail" key={service.number}>
              <span className="service-number">{service.number}</span>
              <div>
                <h2>{service.title}</h2>
                <p>{service.text}</p>
                <ul>
                  {service.tags.map(tag => <li key={tag}><Check size={15} />{tag}</li>)}
                </ul>
              </div>
              <span className="service-index">0{index + 1}</span>
            </article>
          ))}
        </div>
      </section>
      <ContactBand />
    </main>
  )
}

function Work() {
  return (
    <main>
      <PageHero kicker="Work" title={<>Digital places<br /><em>with purpose.</em></>} copy="We make brands easier to find, understand and choose. Explore a selection of our recent builds." />
      <section className="section work-page">
        <div className="container">
          <div className="project-grid project-grid-full">
            {workItems.slice(4).map(item => (
              <a key={item.title} className="project-card cyan" href={item.url} target="_blank" rel="noreferrer">
                <div className="project-art"><img src={item.image} alt={item.title} /></div>
                <div className="project-details">
                  <div>
                    <p className="project-type">{item.type}</p>
                    <h3>{item.title}</h3>
                  </div>
                  <ExternalLink size={17} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      <ContactBand />
    </main>
  )
}

function About() {
  return (
    <main>
      <PageHero kicker="About HOAWS" title={<>A human touch<br /><em>to digital work.</em></>} copy="Founded by Sylvana Ellis, HOAWS brings strategy, creativity and practical know-how to businesses ready for their next chapter." />
      <section className="section about-section">
        <div className="container about-grid">
          <div className="about-image">
            <img src={digitalCardFront} alt="HOAWS digital business card" />
          </div>
          <div className="about-copy">
            <p className="eyebrow">The person behind it</p>
            <h2>
              Digital creator.<br />
              <span>Problem solver.</span>
            </h2>
            <p>I&apos;m Sylvana, the person behind HOAWS. I work across strategy, content, technology and administration, helping ideas move from a loose thought to something people can actually experience.</p>
            <p>My approach is curious, collaborative and resourceful. No unnecessary jargon. No one-size-fits-all packages. Just thoughtful work that makes a meaningful difference to your business.</p>
            <a className="button button-primary" href={whatsapp} target="_blank" rel="noreferrer">
              Meet over WhatsApp <MessageCircle size={17} />
            </a>
          </div>
        </div>
      </section>

      <section className="section values-section">
        <div className="container">
          <SectionIntro kicker="What matters here" title={<>Resourceful by<br /><span>nature.</span></>} />
          <div className="values-grid">
            <div><span>01</span><h3>Clarity</h3><p>We find the signal in the noise and make the next step feel straightforward.</p></div>
            <div><span>02</span><h3>Care</h3><p>The details matter. So does the person on the other side of every screen.</p></div>
            <div><span>03</span><h3>Momentum</h3><p>Good work should help you move, not leave you waiting for perfect.</p></div>
          </div>
        </div>
      </section>
    </main>
  )
}

function ReviewStars({ rating }) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0))
  return (
    <div className="stars" aria-label={`${safeRating} out of 5 stars`}>
      {'★'.repeat(safeRating)}{'☆'.repeat(5 - safeRating)}
    </div>
  )
}

function Reviews() {
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
      <PageHero kicker="Reviews" title={<>Kind words from<br /><em>good people.</em></>} copy="Every project is a collaboration. Here's what a few of ours have had to say." />
      <section className="section reviews-page">
        <div className="container reviews-grid">
          <div className="review-list" aria-live="polite">
            {reviewsLoading ? (
              <p className="review-list-status">Loading published reviews…</p>
            ) : reviewsError ? (
              <p className="review-list-status">{reviewsError}</p>
            ) : approvedReviews.length ? (
              approvedReviews.map(review => (
                <article className="review-quote review-card" key={review.id}>
                  <ReviewStars rating={review.rating} />
                  <blockquote>“{review.message}”</blockquote>
                  <p>— {review.name}</p>
                </article>
              ))
            ) : (
              <article className="review-quote review-card" key={fallbackReview.id}>
                <ReviewStars rating={fallbackReview.rating} />
                <blockquote>“{fallbackReview.message}”</blockquote>
                <p>— {fallbackReview.name}</p>
              </article>
            )}
          </div>

          <div className="review-form-wrap">
            <p className="eyebrow">Share your experience</p>
            <h2>Leave a note.</h2>

            {submitted ? (
              <div className="success-message">
                <Check size={26} />
                <h3>Thank you for the kind words.</h3>
                <p>Your review is awaiting approval and will appear here once it has been reviewed.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <input type="hidden" name="started" value={Date.now()} />
                <label>Your name<input required minLength="1" maxLength="120" name="name" placeholder="e.g. Thandi M." /></label>
                <label>Rating<select name="rating" defaultValue="5"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select></label>
                <label>Your message<textarea required minLength="1" maxLength="2000" name="message" rows="4" placeholder="Tell us about working together..."></textarea></label>
                <input className="honeypot" name="website" tabIndex="-1" autoComplete="off" />
                <button className="button button-primary" type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Submit review'} <ArrowUpRight size={17} /></button>
                <p className="review-pending-note">Reviews are checked before they appear publicly.</p>
                {error && <p className="form-error">{error}</p>}
              </form>
            )}
            <Link className="review-admin-link" to="/reviews/admin">Review moderation</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function DigitalCardPage() {
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
                  <a href="mailto:info@hoaws.co.za" target="_blank" rel="noreferrer"><MessageCircle size={16} /> Email</a>
                  <a href="https://www.instagram.com/hoaws.digital/" target="_blank" rel="noreferrer"><Instagram size={16} /> Instagram</a>
                  <a href="https://www.facebook.com/hoaws.digital" target="_blank" rel="noreferrer"><span className="facebook-icon">f</span> Facebook</a>
                  <a href="https://www.tiktok.com/@hoaws.digital" target="_blank" rel="noreferrer"><span className="tiktok-icon">♪</span> TikTok</a>
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

function PageHero({ kicker, title, copy }) {
  return (
    <section className="page-hero">
      <div className="container page-hero-inner">
        <p className="eyebrow">{kicker}</p>
        <h1>{title}</h1>
        <p className="page-hero-copy">{copy}</p>
      </div>
    </section>
  )
}

function ContactBand() {
  return (
    <section className="section dark-cta contact-band">
      <div className="container cta-inner">
        <div>
          <p className="eyebrow">Your next step</p>
          <h2>Bring us the<br /><em>rough idea.</em></h2>
        </div>
        <a className="button button-gold" href={whatsapp} target="_blank" rel="noreferrer">
          Chat on WhatsApp <MessageCircle size={17} />
        </a>
      </div>
    </section>
  )
}

function App() {
  return (
    <>
      <ScrollToTop />
      <RouteMetadata />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/tessera-lumen" element={<TesseraLumen />} />
        <Route path="/work" element={<Work />} />
        <Route path="/about" element={<About />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/reviews/admin" element={<ReviewAdmin />} />
        <Route path="/digital-card" element={<DigitalCardPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
