import { Writable } from 'node:stream'
import { createElement } from 'react'
import { StaticRouter } from 'react-router-dom'
import { renderToPipeableStream } from 'react-dom/server'
import App from './App'
import { defaultDescription, defaultTitle, resolveRouteMeta, routePaths } from './lib/seo-routes'

export { defaultDescription, defaultTitle, resolveRouteMeta, routePaths }

/**
 * Server entry used only at build time by scripts/prerender.mjs.
 *
 * `renderToPipeableStream` with `onAllReady` rather than `renderToString` is
 * deliberate: every inner page is code-split behind React.lazy, and
 * renderToString bails out to the Suspense fallback for those, which would ship
 * a loading spinner instead of the page. onAllReady waits for the lazy chunks to
 * resolve, so each route is written out with its real markup.
 */
export function render(url) {
  return new Promise((resolve, reject) => {
    let html = ''

    const sink = new Writable({
      write(chunk, _encoding, callback) {
        html += chunk
        callback()
      },
      final(callback) {
        resolve(html)
        callback()
      },
    })

    const { pipe } = renderToPipeableStream(
      createElement(StaticRouter, { location: url }, createElement(App)),
      {
        onAllReady() {
          pipe(sink)
        },
        onError: reject,
      },
    )
  })
}
