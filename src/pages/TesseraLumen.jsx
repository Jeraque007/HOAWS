import { ArrowUpRight, Download, ExternalLink, MessageCircle, Smartphone, Sparkles } from 'lucide-react'
import SEO from '../components/SEO'
import { whatsapp } from '../lib/site'
import tesseraLumenOg from '../assets/tessera-lumen-og.jpg'
import tesseraLumenLogo from '../assets/tessera-lumen-logo.png'
import tesseraLumenArt from '../assets/tessera-lumen.png'
import tesseraAppIcon from '../assets/icon-512.png'
import './TesseraLumen.css'

const appUrl = 'https://app.963.co.za'
const downloadUrl = 'https://apkpure.com/p/com.godcode963.app'

const features = [
  ['Tarot Readings', 'Purchase and receive intuitive tarot card readings online.'],
  ['Channelled Guidance', 'Each reading is intuitively channelled and personalised to your energy.'],
  ['Accessible Anywhere', 'Access your readings from any device, any time.'],
  ['Part of the S.A.E™ Ecosystem', 'Tessera Lumen integrates with the broader holistic offering.'],
]

export default function TesseraLumen() {
  return (
    <main className="tessera-page">
      <SEO
        title="Tessera Lumen | HOAWS"
        description="Tessera Lumen — Oracle of Sophia. Receive intuitive tarot readings online and claim a free reading among the first 100 customers."
        path="/tessera-lumen"
      />

      <section className="tessera-hero">
        <div className="container tessera-hero-grid">
          <div className="tessera-hero-copy">
            <p className="eyebrow">Oracle of Sophia Tarot</p>
            <h1>Tessera <em>Lumen</em></h1>
            <p>Your digital portal for intuitive tarot readings. Explore guidance, purchase readings, and access wisdom curated for your journey.</p>
            <div className="tessera-actions">
              <a className="button button-primary" href={appUrl} target="_blank" rel="noopener noreferrer">
                Open Tessera Lumen <ArrowUpRight size={17} />
              </a>
              <a className="tessera-text-link" href="#tessera-experience">Explore the experience <ExternalLink size={14} /></a>
            </div>
            <div className="tessera-offer"><Sparkles size={15} /><span>Free intuitive tarot readings for the first 100 customers.</span></div>
          </div>
          <div className="tessera-hero-visual">
            <div className="tessera-poster-frame"><img src={tesseraLumenOg} alt="Tessera Lumen Oracle of Sophia tarot artwork" /></div>
            <div className="tessera-logo-mark"><img src={tesseraLumenLogo} alt="Tessera Lumen logo" /></div>
            <p className="tessera-visual-label">Ask. Draw. Receive. Reflect.</p>
          </div>
        </div>
      </section>

      <section className="section tessera-intro" id="tessera-experience">
        <div className="container tessera-intro-grid">
          <div>
            <p className="eyebrow">Welcome to the portal</p>
            <h2>A clearer way to <span>ask what matters.</span></h2>
          </div>
          <div className="tessera-intro-aside">
            <p>Create space for the question beneath the question. Tessera Lumen brings intuitive tarot guidance into a simple, accessible digital experience.</p>
            <a className="tessera-inline-link" href={appUrl} target="_blank" rel="noopener noreferrer">Open the reading room <ArrowUpRight size={15} /></a>
          </div>
        </div>
      </section>

      <section className="section tessera-showcase">
        <div className="container">
          <div className="tessera-section-heading">
            <div><p className="eyebrow">Choose your doorway</p><h2>Read your <span>way.</span></h2></div>
            <p>Use the web portal or take Tessera Lumen with you on Android.</p>
          </div>
          <div className="tessera-app-grid">
            <article className="tessera-art-card">
              <div className="tessera-art-image"><img src={tesseraLumenArt} alt="Tessera Lumen Oracle of Sophia card artwork" /></div>
              <div className="tessera-art-copy">
                <p className="eyebrow">Web experience</p>
                <h3>Open the reading room.</h3>
                <p>Purchase and receive intuitive tarot card readings online from any browser.</p>
                <a className="tessera-inline-link" href={appUrl} target="_blank" rel="noopener noreferrer">Open Tessera Lumen <ExternalLink size={15} /></a>
              </div>
            </article>
            <article className="tessera-download-card">
              <img className="tessera-app-icon" src={tesseraAppIcon} alt="Tessera Lumen app icon" />
              <div className="tessera-card-label"><Smartphone size={15} /> Android app</div>
              <h2>Download the App</h2>
              <p>Get Tessera Lumen — Oracle of Sophia on your Android device. Access your tarot readings, receive guidance, and explore your path anytime, anywhere.</p>
              <a className="button button-dark" href={downloadUrl} target="_blank" rel="noopener noreferrer">Download the App <Download size={16} /></a>
            </article>
          </div>
        </div>
      </section>

      <section className="section tessera-features-section">
        <div className="container">
          <div className="tessera-features-heading"><p className="eyebrow">What the app offers</p><h2>Guidance for the <span>whole journey.</span></h2></div>
          <div className="tessera-feature-grid">
            {features.map(([title, copy], index) => <article className="tessera-feature" key={title}><span className="tessera-feature-number">0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="tessera-cta">
        <div className="container tessera-cta-inner">
          <div><p className="eyebrow">Prefer a personal session?</p><h2>Want a Personal Session Instead?</h2><p>For one-on-one healing, coaching, or integration work, book directly via WhatsApp.</p></div>
          <a className="button button-gold" href={whatsapp} target="_blank" rel="noopener noreferrer">Book via WhatsApp <MessageCircle size={17} /></a>
        </div>
      </section>

    </main>
  )
}
