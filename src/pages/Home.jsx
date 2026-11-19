import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { whatsapp } from '../lib/site'
import homeFloatingLogo from '../assets/hoaws-translucent.webp'
import './Home.css'

const serviceCategories = [
  {
    number: '01',
    title: 'Digital Presence',
    description: 'Websites, online shops, email, hosting and digital business setup.',
  },
  {
    number: '02',
    title: 'Creative & Marketing',
    description: 'Branding, graphic design, advertising, promotional content and social media.',
  },
  {
    number: '03',
    title: 'Business Administration',
    description: 'Virtual assistance, documentation, business support and administrative solutions.',
  },
  {
    number: '04',
    title: 'Growth & Development',
    description: 'Coaching, training, digital skills and practical business guidance.',
  },
  {
    number: '05',
    title: 'Tools & Resources',
    description: 'Business templates, SOPs, guides and downloadable resources.',
  },
]

const waysToWork = [
  {
    number: '01',
    title: 'DIY',
    subtitle: 'Do It Yourself',
    description: 'Access resources, tools, templates and guidance to manage things yourself.',
  },
  {
    number: '02',
    title: 'Assisted',
    subtitle: 'Work With Us',
    description: 'Get professional assistance while remaining involved in your business decisions.',
  },
  {
    number: '03',
    title: 'Managed',
    subtitle: 'Leave It With Us',
    description: 'Choose the services you want HOAWS to manage on your behalf.',
  },
]

const quoteUrl = new URL(whatsapp)
quoteUrl.searchParams.set('text', "Hi HOAWS, I'd like to request a quote.")

export default function Home() {
  return (
    <main className="home-page">
      <section className="hero home-hero">
        <div className="hero-grid container">
          <div className="hero-copy reveal">
            <p className="home-kicker">Practical business support</p>
            <h1>
              Your Business.<br />
              Your Needs.<br />
              <em>Your Way.</em>
            </h1>
            <p className="hero-text">
              From establishing your digital presence to managing everyday business requirements,
              HOAWS brings practical solutions and professional support together in one place.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#what-we-do">
                Explore What We Do <ArrowUpRight size={17} />
              </a>
              <Link className="home-button-secondary" to="/services">
                Build Your Business <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>

          <div className="hero-visual reveal delay-2">
            <div className="hero-orbit orbit-one" aria-hidden="true" />
            <div className="hero-orbit orbit-two" aria-hidden="true" />
            <img
              src={homeFloatingLogo}
              className="hero-floating-logo"
              alt="HOAWS Crest"
              fetchPriority="high"
              decoding="async"
            />
            <span className="visual-caption">
              Digital solutions<br />
              Creative services<br />
              Business support
            </span>
          </div>
        </div>
        <div className="hero-footer container">
          <span>Based in South Africa &middot; working everywhere</span>
          <span>Flexible support for every stage</span>
        </div>
      </section>

      <section className="section home-why">
        <div className="container home-split">
          <div>
            <p className="home-kicker">Why HOAWS is evolving</p>
            <h2>Business support should fit <em>your business.</em></h2>
          </div>
          <div className="home-copy-block">
            <p>
              Business requirements change. Not every business needs a full-service agency, a large
              monthly contract or expensive digital infrastructure.
            </p>
            <p>
              Sometimes you need a website. Sometimes you need an advert, a business logo,
              administrative assistance or someone to guide you through a process.
            </p>
            <p>
              HOAWS is evolving to make these services more accessible, flexible and connected.
            </p>
            <p className="home-copy-emphasis">
              You choose what you need. You decide how involved you want to be. HOAWS provides the
              support.
            </p>
          </div>
        </div>
      </section>

      <section className="section home-offer" id="what-we-do">
        <div className="container">
          <div className="home-section-heading">
            <div>
              <p className="home-kicker">What can you expect?</p>
              <h2>Practical solutions.<br /><em>One connected place.</em></h2>
            </div>
            <p>
              Choose a service, combine a few or find the guidance and tools to take the next step
              yourself.
            </p>
          </div>
          <div className="home-category-grid">
            {serviceCategories.map(category => (
              <article className="home-category-card" key={category.number}>
                <span className="home-card-number">{category.number}</span>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section home-ways">
        <div className="container">
          <div className="home-section-heading">
            <div>
              <p className="home-kicker">How does it work?</p>
              <h2>Support on <em>your terms.</em></h2>
            </div>
            <p>
              Choose how much help you want, and stay involved in the way that works for you.
            </p>
          </div>
          <div className="home-modes-grid">
            {waysToWork.map(mode => (
              <article className="home-mode-card" key={mode.number}>
                <span className="home-card-number">{mode.number}</span>
                <p className="home-mode-subtitle">{mode.subtitle}</p>
                <h3>{mode.title}</h3>
                <p>{mode.description}</p>
              </article>
            ))}
          </div>
          <p className="home-commitment-note">Not every service requires a monthly commitment.</p>
        </div>
      </section>

      <section className="section home-flexible">
        <div className="container home-split">
          <div>
            <p className="home-kicker">Flexible by design</p>
            <h2>Support that can <em>change with you.</em></h2>
          </div>
          <div className="home-copy-block">
            <p>Start with one service or combine several.</p>
            <p>Choose a once-off service, request additional work or select ongoing support.</p>
            <p>As your business changes, your requirements can change too.</p>
            <p className="home-copy-emphasis">
              No unnecessary packages. No obligation to purchase services you don&apos;t need.
            </p>
          </div>
        </div>
      </section>

      <section className="section home-final-cta">
        <div className="container home-final-inner">
          <div>
            <p className="home-kicker">Your next step</p>
            <h2>
              Your business doesn&apos;t need everything.<br />
              <em>It needs the right things.</em>
            </h2>
            <p>Explore the possibilities with HOAWS.</p>
          </div>
          <div className="home-final-actions">
            <Link className="button button-primary" to="/services">
              Explore Services <ArrowUpRight size={17} />
            </Link>
            <a className="home-button-secondary" href={quoteUrl.toString()} target="_blank" rel="noreferrer">
              Request a Quote <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
