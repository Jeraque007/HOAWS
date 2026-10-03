import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { siteUrl } from '../lib/site'

const defaultTitle = 'HOAWS | Human & Online Administrative / Web Solutions'
const defaultDescription = 'HOAWS creates digital systems, brands and online experiences that move ambitious businesses forward.'

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

export default function SEO({ title, description, path }) {
  const { pathname } = useLocation()
  const resolvedPath = path || pathname
  const resolvedTitle = title || defaultTitle
  const resolvedDescription = description || defaultDescription
  // The private workspaces must never appear in search results. Derive this
  // from the resolved path (not a prop) so the baseline and page-level <SEO />
  // instances always agree, regardless of effect ordering.
  const privatePaths = ['/reviews/admin', '/promos/admin']
  const normalizedPath = resolvedPath.replace(/\/+$/, '') || '/'
  const resolvedRobots = privatePaths.includes(normalizedPath)
    ? 'noindex, nofollow'
    : 'index, follow'

  useEffect(() => {
    document.title = resolvedTitle

    upsertMeta('name', 'description', resolvedDescription)
    upsertMeta('property', 'og:title', resolvedTitle)
    upsertMeta('property', 'og:description', resolvedDescription)
    upsertMeta('name', 'twitter:title', resolvedTitle)
    upsertMeta('name', 'twitter:description', resolvedDescription)
    upsertMeta('name', 'robots', resolvedRobots)

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    const pageUrl = new URL(resolvedPath, siteUrl).toString()
    canonical.setAttribute('href', pageUrl)

    upsertJsonLd('seo-page-json-ld', {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: resolvedTitle,
      description: resolvedDescription,
      inLanguage: 'en',
      isPartOf: { '@id': `${siteUrl}/#website` },
    })
  }, [resolvedTitle, resolvedDescription, resolvedPath, resolvedRobots])

  return null
}
