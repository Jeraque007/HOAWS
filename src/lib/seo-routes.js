import { siteUrl } from './site'

export const defaultTitle = 'HOAWS | Human & Online Administrative / Web Solutions'
export const defaultDescription =
  'HOAWS creates digital systems, brands and online experiences that move ambitious businesses forward.'

/**
 * Every routable page of the site, keyed by its canonical path.
 *
 * This is the single source of truth for a page's head tags. Both the client
 * (`src/components/SEO.jsx`) and the build-time prerenderer
 * (`scripts/prerender.mjs`) read it, so the canonical URL, title and robots
 * directive Google sees in the raw HTML are always the same ones the app writes
 * once React boots. That agreement is what keeps Search Console from filing real
 * pages under "Alternate page with proper canonical tag".
 */
const routes = {
  '/': {
    title: defaultTitle,
    description: defaultDescription,
  },
  '/services': {
    title: 'Services | HOAWS',
    description:
      'Digital strategy, web experiences, social content, and business systems from HOAWS.',
  },
  '/tessera-lumen': {
    title: 'Tessera Lumen | HOAWS',
    description:
      'Tessera Lumen — Oracle of Sophia. Receive intuitive tarot readings online and claim a free reading among the first 100 customers.',
  },
  '/work': {
    title: 'Work | HOAWS',
    description:
      'Explore selected digital brands, websites, products, and identities created by HOAWS.',
  },
  '/about': {
    title: 'About | HOAWS',
    description:
      'Meet HOAWS and discover the thinking behind its digital and business transformation work.',
  },
  '/reviews': {
    title: 'Reviews | HOAWS',
    description:
      'Read client feedback and share your experience working with HOAWS.',
  },
  '/digital-card': {
    title: 'Digital Card | HOAWS',
    description:
      'Save, call, and connect with HOAWS from one digital business card.',
  },
  // Private workspaces. They are reachable only by typing the URL, so they are
  // noindex on top of the X-Robots-Tag header set in vercel.json.
  '/reviews/admin': {
    title: 'Review moderation | HOAWS',
    description: 'Private workspace for moderating client reviews.',
    robots: 'noindex, nofollow',
  },
  '/promos/admin': {
    title: 'Announcement popup | HOAWS',
    description: 'Private workspace for the home page announcement popup.',
    robots: 'noindex, nofollow',
  },
}

/** The paths the prerenderer turns into real HTML files under dist/. */
export const routePaths = Object.keys(routes)

/**
 * Collapses every spelling of a path ("/services/", "//services", "/SERVICES")
 * onto one form, so a trailing slash or a stray capital can never make the app
 * disagree with itself about which URL is canonical.
 */
export function normalizePath(pathname) {
  return (pathname || '/').replace(/\/+$/, '').toLowerCase() || '/'
}

/**
 * Head tags for a pathname.
 *
 * Anything that is not a real page (typos, crawler probes, whatever the SPA
 * catch-all rewrite serves) deliberately comes back with `canonical: null` and
 * `noindex`: without a canonical pointing at the home page, those URLs can never
 * be filed as a duplicate of a page that should be indexed.
 */
export function resolveRouteMeta(pathname) {
  const path = normalizePath(pathname)
  const entry = routes[path]

  if (!entry) {
    return {
      path: null,
      known: false,
      title: defaultTitle,
      description: defaultDescription,
      robots: 'noindex, nofollow',
      canonical: null,
    }
  }

  return {
    path,
    known: true,
    title: entry.title,
    description: entry.description,
    robots: entry.robots || 'index, follow',
    canonical: `${siteUrl}${path === '/' ? '/' : path}`,
  }
}
