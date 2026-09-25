import { ArrowUpRight, MessageCircle } from 'lucide-react'
import { whatsapp } from '../lib/site'
import './ContactBand.css'

export default function ContactBand({
  kicker = 'Your next step',
  title = (<>Bring us the<br /><em>rough idea.</em></>),
  ctaLabel = 'Chat on WhatsApp',
  ctaIcon,
  band = true,
}) {
  return (
    <section className={`section dark-cta${band ? ' contact-band' : ''}`}>
      <div className="container cta-inner">
        <div>
          <p className="eyebrow">{kicker}</p>
          <h2>{title}</h2>
        </div>
        <a className="button button-gold" href={whatsapp} target="_blank" rel="noreferrer">
          {ctaLabel} {ctaIcon || <MessageCircle size={17} />}
        </a>
      </div>
    </section>
  )
}
