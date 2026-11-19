/**
 * Writes a real HTML file for every route in src/lib/seo-routes.js.
 *
 * Why this exists: Vercel serves the same index.html for every path, so before
 * this script every page shipped a <head> that declared the home page as its
 * canonical. Google read that as "duplicate of the home page" and withheld the
 * real pages from the index - which is the "Alternate page with proper
 * canonical tag" notice in Search Console. Each route now gets its own
 * dist/<route>/index.html carrying the canonical, title, description and robots
 * directive resolved from the very same table the client uses, so the raw HTML
 * and the rendered HTML can no longer disagree.
 *
 * Run by `npm run build` after the client bundle (it needs dist/index.html as a
 * template) and the SSR bundle (it needs dist-ssr/entry-server.js to render
 * with).
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const distDir = join(root, 'dist')
const ssrDir = join(root, 'dist-ssr')

const ROOT_OPEN = '<div id="root">'

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Replaces exactly one tag, and fails loudly if the template changed shape. */
function replaceOnce(html, pattern, replacement, label) {
  if (!pattern.test(html)) {
    throw new Error(`prerender: expected to find a ${label} tag in dist/index.html`)
  }
  return html.replace(pattern, replacement)
}

function buildHead(template, meta) {
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  const canonical = escapeHtml(meta.canonical)

  let html = template

  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`, 'title')
  html = replaceOnce(
    html,
    /<link\b[^>]*rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${canonical}" />`,
    'canonical',
  )
  html = replaceOnce(
    html,
    /<meta\b[^>]*name="description"[^>]*>/,
    `<meta name="description" content="${description}" />`,
    'description',
  )
  html = replaceOnce(
    html,
    /<meta\b[^>]*name="robots"[^>]*>/,
    `<meta name="robots" content="${escapeHtml(meta.robots)}" />`,
    'robots',
  )
  html = replaceOnce(
    html,
    /<meta\b[^>]*property="og:title"[^>]*>/,
    `<meta property="og:title" content="${title}" />`,
    'og:title',
  )
  html = replaceOnce(
    html,
    /<meta\b[^>]*property="og:description"[^>]*>/,
    `<meta property="og:description" content="${description}" />`,
    'og:description',
  )
  html = replaceOnce(
    html,
    /<meta\b[^>]*name="twitter:title"[^>]*>/,
    `<meta name="twitter:title" content="${title}" />`,
    'twitter:title',
  )
  html = replaceOnce(
    html,
    /<meta\b[^>]*name="twitter:description"[^>]*>/,
    `<meta name="twitter:description" content="${description}" />`,
    'twitter:description',
  )

  // Same id the client upserts, so React replaces this block instead of
  // adding a second copy of it once the bundle boots.
  const origin = new URL(meta.canonical).origin
  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${meta.canonical}#webpage`,
    url: meta.canonical,
    name: meta.title,
    description: meta.description,
    inLanguage: 'en',
    isPartOf: { '@id': `${origin}/#website` },
  }

  html = replaceOnce(
    html,
    /<\/head>/,
    `  <script type="application/ld+json" id="seo-page-json-ld">${JSON.stringify(pageJsonLd)}</script>\n  </head>`,
    'closing head',
  )

  return html
}

/**
 * React streams only the component markup (no document shell), but be defensive
 * about it so a future React version that does emit <body> still works.
 */
function bodyOf(rendered) {
  const match = rendered.match(/<body[^>]*>([\s\S]*)<\/body>/)
  return match ? match[1] : rendered
}

function outputFileFor(routePath) {
  if (routePath === '/') return join(distDir, 'index.html')
  return join(distDir, ...routePath.split('/').filter(Boolean), 'index.html')
}

async function findSsrEntry() {
  let entries
  try {
    entries = await readdir(ssrDir)
  } catch {
    throw new Error(`prerender: ${relative(root, ssrDir)} is missing - run the SSR build first.`)
  }

  const entry = entries.find(name => /^entry-server\.(js|mjs|cjs)$/.test(name))
  if (!entry) {
    throw new Error(`prerender: no entry-server bundle found in ${relative(root, ssrDir)}.`)
  }
  return join(ssrDir, entry)
}

const template = await readFile(join(distDir, 'index.html'), 'utf8')
if (template.split(ROOT_OPEN).length !== 2) {
  throw new Error('prerender: expected exactly one <div id="root"> in dist/index.html.')
}

const { render, resolveRouteMeta, routePaths } = await import(
  pathToFileURL(await findSsrEntry()).href
)

for (const routePath of routePaths) {
  const meta = resolveRouteMeta(routePath)
  const body = bodyOf(await render(routePath))

  // The SSR bundle must resolve assets through the production build. If it ever
  // falls back to dev URLs the prerendered page would flash broken images, so
  // treat that as a hard failure rather than shipping it.
  if (body.includes('/src/assets/')) {
    throw new Error(`prerender: ${routePath} rendered dev-mode asset URLs; use the SSR build output.`)
  }

  // Inject the markup *inside* #root. Replacing the whole element instead
  // would park the rendered page as a sibling of the div and duplicate it once
  // React mounts, so only the opening tag is matched and the template's own
  // closing tag does the rest.
  const html = buildHead(template, meta).replace(ROOT_OPEN, `${ROOT_OPEN}${body}`)

  const outputFile = outputFileFor(routePath)
  await mkdir(dirname(outputFile), { recursive: true })
  await writeFile(outputFile, html, 'utf8')

  console.log(`  ${routePath.padEnd(16)} -> ${relative(root, outputFile)}`)
}

console.log(`Prerendered ${routePaths.length} routes.`)
