import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { navItems, whatsapp } from '../lib/site'
import homeLogo from '../assets/hoaws-translucent.png'
import './Navbar.css'

export default function Navbar() {
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
