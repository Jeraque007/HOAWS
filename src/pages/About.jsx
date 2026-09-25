import { MessageCircle } from 'lucide-react'
import SEO from '../components/SEO'
import PageHero from '../components/PageHero'
import SectionIntro from '../components/SectionIntro'
import { whatsapp } from '../lib/site'
import digitalCardFront from '../assets/hoaws-vcf.png'
import './About.css'

export default function About() {
  return (
    <main>
      <SEO
        title="About | HOAWS"
        description="Meet HOAWS and discover the thinking behind its digital and business transformation work."
        path="/about"
      />

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
