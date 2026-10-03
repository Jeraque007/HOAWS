import { Link } from 'react-router-dom'
import { Download, Instagram } from 'lucide-react'
import { contactEmail, contactPhone, contactPhoneTel, navItems, socials } from '../lib/site'
import homeLogo from '../assets/hoaws-translucent.webp'
import './Footer.css'

const [instagram, facebook, tiktok] = socials
const googleBusiness = 'https://www.google.com/search?sca_esv=208f0a03c550a3c8&sxsrf=APpeQntesk0_XHYuwRlgfVy7n6Ce0ewzfw%3A1790358659388&q=Rum%20Raisin%20Digital&stick=H4sIAAAAAAAAAONgU1I1qDBJsbRIMzYzSUxNNrZITU6yMqgwSjUxNkwxN05ONUhOSTM2WcQqFFSaqxCUmFmcmafgkpmeWZKYAwCe2bt7PgAAAA&mat=Cb7oQjhhUzhn&ved=2ahUKEwiA2KbfpYqXAxVgRZ8JHX1NB78QrMcEegQIGRAC'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <img className="footer-logo" src={homeLogo} alt="HOAWS" loading="lazy" decoding="async" />
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
          <a href={contactPhoneTel}>{contactPhone}</a>
          <div className="socials">
            <a href={instagram.url} aria-label={instagram.label} target="_blank" rel="noreferrer"><Instagram size={18} /></a>
            <a href={facebook.url} aria-label={facebook.label} target="_blank" rel="noreferrer"><span className="facebook-icon">f</span></a>
            <a href={tiktok.url} aria-label={tiktok.label} target="_blank" rel="noreferrer"><span className="tiktok-icon">♪</span></a>
            <a href={googleBusiness} aria-label="Google Business for Hoaws" target="_blank" rel="noreferrer"><span className="google-icon">G</span></a>
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
