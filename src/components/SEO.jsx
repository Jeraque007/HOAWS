import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { siteUrl } from '../lib/site'
import { resolveRouteMeta } from '../lib/seo-routes'

function upsertMeta(attribute, name, content) {
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function upsertJsonLd(id, data) {
  let script = document.getElementById(id)
  if (!script) {
    script = document.createElement('script')
    script.id = id
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(data)
}

/**
 * Keeps the document head in sync with whatever route is on screen.
 *
 * It deliberately takes no props: the metadata comes from the pathname through
 * `src/lib/seo-routes.js`, the same table the build-time prerenderer reads. The
 * single baseline instance in App.jsx is therefore the only writer for the head,
 * which is what makes the raw HTML and the rendered HTML agree - and that
 * agreement is the whole point, because a disagreement is what gets real pages
 * filed under "Alternate page with proper canonical tag" in Search Console.
 */
export default function SEO() {
  const { pathname } = useLocation()
  const meta = resolveRouteMeta(pathname)

  useEffect(() => {
    document.title = meta.title

    upsertMeta('name', 'description', meta.description)
    upsertMeta('property', 'og:title', meta.title)
    upsertMeta('property', 'og:description', meta.description)
    upsertMeta('name', 'twitter:title', meta.title)
    upsertMeta('name', 'twitter:description', meta.description)
    upsertMeta('name', 'robots', meta.robots)

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (meta.canonical) {
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.setAttribute('rel', 'canonical')
        document.head.appendChild(canonical)
      }
      canonical.setAttribute('href', meta.canonical)
    } else if (canonical) {
      // Unknown path. The prerendered head still points at the home page, so the
      // stale hint has to go, or Google keeps reading that URL as a duplicate of
      // a page it should be indexing instead.
      canonical.remove()
    }

    if (meta.canonical) {
      upsertJsonLd('seo-page-json-ld', {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${meta.canonical}#webpage`,
        url: meta.canonical,
        name: meta.title,
        description: meta.description,
        inLanguage: 'en',
        isPartOf: { '@id': `${siteUrl}/#website` },
      })
    } else {
      document.getElementById('seo-page-json-ld')?.remove()
    }
  }, [meta.canonical, meta.description, meta.robots, meta.title])

  return null
}
