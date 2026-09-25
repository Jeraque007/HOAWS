import { Link } from 'react-router-dom'
import { ArrowUpRight, ChevronRight, ExternalLink, MessageCircle, Phone } from 'lucide-react'
import SEO from '../components/SEO'
import SectionIntro from '../components/SectionIntro'
import ProjectCard from '../components/ProjectCard'
import ContactBand from '../components/ContactBand'
import { services, whatsapp, workItems } from '../lib/site'
/* Hero tag line: the Hoaws Name Logo strip — the ONLY asset allowed in the hero tag line slot. */
import heroTagLineLogo from '../assets/hoaws-name-logo.png'
/* Home floating logo: the Hoaws Translucent crest — the ONLY asset allowed in the floating logo slot. */
import homeFloatingLogo from '../assets/hoaws-translucent.png'
import digitalCardFront from '../assets/hoaws-vcf.png'
import './Home.css'

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

export default function Home() {
  return (
    <main>
      <SEO
        title="HOAWS | Human & Online Administrative / Web Solutions"
        description="HOAWS creates digital systems, brands and online experiences that move ambitious businesses forward."
        path="/"
      />

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
            {/* Hero tag line slot — only the Hoaws Name Logo strip belongs here. */}
            <div className="hero-tag-line">
              <img src={heroTagLineLogo} className="hero-tag-line-logo" alt="Hoaws Name Logo" />
            </div>
            {/* Home floating logo slot — only the Hoaws Translucent crest belongs here. */}
            <div className="floating-logo" aria-hidden="true">
              <img src={homeFloatingLogo} alt="" />
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
              <ProjectCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <ContactBand
        band={false}
        kicker="Have a good idea?"
        title={<>Let&apos;s give it<br /><em>somewhere</em> to go.</>}
        ctaLabel="Start a conversation"
        ctaIcon={<ArrowUpRight size={17} />}
      />


    </main>
  )
}
