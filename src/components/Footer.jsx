import { Link } from 'react-router-dom'
import { Download, Instagram } from 'lucide-react'
import { contactEmail, contactPhone, navItems, socials, whatsapp } from '../lib/site'
import homeLogo from '../assets/hoaws-translucent.png'
import './Footer.css'

const [instagram, facebook, tiktok] = socials

export default function Footer() {
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
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          <a href={whatsapp} target="_blank" rel="noreferrer">{contactPhone}</a>
          <div className="socials">
            <a href={instagram.url} aria-label={instagram.label} target="_blank" rel="noreferrer"><Instagram size={18} /></a>
            <a href={facebook.url} aria-label={facebook.label} target="_blank" rel="noreferrer"><span className="facebook-icon">f</span></a>
            <a href={tiktok.url} aria-label={tiktok.label} target="_blank" rel="noreferrer"><span className="tiktok-icon">♪</span></a>
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
