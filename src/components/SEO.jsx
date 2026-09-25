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

export default function SEO({ title, description, path }) {
  const { pathname } = useLocation()
  const resolvedPath = path || pathname
  const resolvedTitle = title || defaultTitle
  const resolvedDescription = description || defaultDescription

  useEffect(() => {
    document.title = resolvedTitle

    upsertMeta('name', 'description', resolvedDescription)
    upsertMeta('property', 'og:title', resolvedTitle)
    upsertMeta('property', 'og:description', resolvedDescription)
    upsertMeta('name', 'twitter:title', resolvedTitle)
    upsertMeta('name', 'twitter:description', resolvedDescription)

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', new URL(resolvedPath, siteUrl).toString())
  }, [resolvedTitle, resolvedDescription, resolvedPath])

  return null
}
