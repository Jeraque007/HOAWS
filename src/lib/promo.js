// Shared helpers for the home page announcement popup. The copy lives in
// public.promo_popups and the MP4/poster live in the "promo-media" Storage
// bucket (see supabase/promo-popups.sql).
//
// The admin page offers two ways in: paste a whole announcement block, or type
// the fields by hand. parsePromoPaste() turns a pasted block into those fields.

export const PROMO_BUCKET = 'promo-media'

// Upload guardrails - keep in sync with the bucket limits in supabase/promo-popups.sql.
export const MAX_VIDEO_BYTES = 25 * 1024 * 1024
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const VIDEO_MIME_TYPES = ['video/mp4', 'video/webm']
export const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp']

// Characters used to separate a label from a headline ("OCTOBER 2 — MAKE A PLAN").
const dashSeparator = /\s[\u2014\u2013-]\s/
const quoteStart = /^[\u201c\u201d"]/
const attributionStart = /^[\u2014\u2013-]\s*/
const wrappingQuotes = /^[\u201c\u201d"]+|[\u201c\u201d"]+$/g

function stripWrappingQuotes(value) {
  return value.replace(wrappingQuotes, '').trim()
}

/**
 * Reads a pasted announcement block and pulls out the popup fields.
 *
 *   OCTOBER 2 — MAKE A PLAN            -> kicker, headline
 *   You don't need to have ...          -> body
 *   Turn the overwhelming list into ... -> body (one line per line)
 *   "The secret to getting ahead ..."   -> quote
 *   — Mark Twain                        -> attribution
 *
 * Anything unexpected simply stays in the body, so the fields can be trimmed by
 * hand before saving. Returns null when there is nothing to read.
 */
export function parsePromoPaste(raw) {
  const text = String(raw || '').replace(/\r\n?/g, '\n').trim()
  if (!text) return null

  const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
  const remaining = []
  let quote = ''
  let attribution = ''

  lines.forEach((line) => {
    if (!quote && quoteStart.test(line)) {
      quote = stripWrappingQuotes(line)
      return
    }
    if (!attribution && attributionStart.test(line) && line.length <= 80) {
      const credit = line.replace(attributionStart, '').trim()
      if (credit) {
        attribution = credit
        return
      }
    }
    remaining.push(line)
  })

  let kicker = ''
  let headline = remaining.shift() || ''

  // Only treat the leading dash as a kicker when the left-hand side is short
  // enough to be a label; otherwise the whole line is the headline.
  const parts = headline.split(dashSeparator)
  if (parts.length > 1 && parts[0].length <= 40) {
    kicker = parts.shift().trim()
    headline = parts.join(' \u2014 ').trim()
  }

  return {
    kicker,
    headline,
    body: remaining.join('\n'),
    quote,
    attribution,
  }
}

/** True when a stored popup is switched on and inside its schedule window. */
export function isPromoLive(promo, now = Date.now()) {
  if (!promo || !promo.is_active) return false

  const startsAt = promo.starts_at ? new Date(promo.starts_at).getTime() : NaN
  const endsAt = promo.ends_at ? new Date(promo.ends_at).getTime() : NaN

  if (Number.isFinite(startsAt) && now < startsAt) return false
  if (Number.isFinite(endsAt) && now > endsAt) return false
  return true
}

/** Short, human-readable schedule summary for the admin list. */
export function describePromoSchedule(promo, now = Date.now()) {
  if (!promo) return ''
  if (!promo.is_active) return 'Switched off'

  const startsAt = promo.starts_at ? new Date(promo.starts_at).getTime() : NaN
  const endsAt = promo.ends_at ? new Date(promo.ends_at).getTime() : NaN
  const format = (time) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(time))

  if (Number.isFinite(startsAt) && now < startsAt) return `Starts ${format(startsAt)}`
  if (Number.isFinite(endsAt) && now > endsAt) return `Ended ${format(endsAt)}`
  if (Number.isFinite(endsAt)) return `Live until ${format(endsAt)}`
  return 'Live now'
}

/** Turns a stored timestamp into a value the datetime-local input accepts. */
export function toDateTimeInputValue(value) {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return ''

  const pad = (part) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Turns a datetime-local input value back into an ISO timestamp (or null). */
export function fromDateTimeInputValue(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}