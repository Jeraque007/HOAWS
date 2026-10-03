# Announcement popup — portable build guide

How to stand up the HOAWS announcement popup on **another site**, from zero. This
document is self-contained: follow it top to bottom and you will end up with a
working popup plus its private admin page. It assumes the target site is
React + Vite, because that is what the code is written in; Part 9 covers
swapping the backend out if the target site is not on Supabase.

Source of truth (all committed on `main`):

| File | Role |
| --- | --- |
| `src/lib/promo.js` | Pure helpers: field parser, schedule logic, limits |
| `src/components/PromoPopup.jsx` | The popup, the shared card, the admin preview |
| `src/components/PromoPopup.css` | All of the popup's styling |
| `src/pages/PromoAdmin.jsx` | The private `/promos/admin` workspace |
| `src/pages/PromoAdmin.css` | The admin page styling |
| `src/lib/supabase.js` | Data layer (promo CRUD + auth + upload) |
| `supabase/promo-popups.sql` | Table, RLS, Storage bucket and policies |
| `supabase/setup-admin.sql` | Grants an Auth user admin access |

---

## Part 0 — What you are building (the behaviour contract)

Read this first. It is the spec; the code is just one implementation of it.

**Visitor side** — one popup per page load, only when a live row exists:

- Looks up the newest live popup **once per page load**. Any failure (including
  an unconfigured Supabase or an empty table) is silent: the site carries on
  with no popup and no console noise.
- **"Live" means** `is_active = true` **and** `starts_at` is null-or-past **and**
  `ends_at` is null-or-future. Enforced twice: by an RLS policy and again in the
  client. RLS is the real boundary; the client check is a cheap safety net.
- Appears **900 ms** after load so it never competes with first paint.
- Shows **once per browser tab**, keyed by row id in `sessionStorage`. A new tab
  sees it again. (Swap `sessionStorage` → `localStorage` for once-per-day.)
- Dismisses on: **Enter site** button, the **✕**, **Esc**, **tap outside**, a
  **scroll of more than 40px**, a **wheel or touchmove outside the card**, or a
  **25 s timeout**. It can never trap a visitor.
- Accessibility: focus moves into the dialog and back to whatever had it; **Tab
  is trapped** inside; `role="dialog"` + `aria-modal`; the video gets a real
  pause control (WCAG 2.2.2, required because it autoplays); `prefers-reduced-
  motion` turns autoplay off and shows native video controls instead.
- Video: muted, looped, `playsInline`, `preload="metadata"` — the only
  combination mobile browsers allow to autoplay. Poster image optional.
- Media **keeps its own aspect ratio**; tall 9:16 reels are letterboxed inside a
  height cap, never cropped.

**Admin side** — one private route, `/promos/admin`:

- Email/password sign-in against Supabase Auth, then gated by a whitelist table.
  Signing in is not enough on its own — the whitelist row is what grants access,
  and it is enforced by RLS on the server, not by the UI.
- Paste a whole announcement block and hit **Fill the fields**, or type each
  field by hand. Upload the MP4 and/or a poster image. Optionally set a start and
  end time. Tick **Live for visitors** and save.
- Below that: a **WYSIWYG preview** that renders the *same* `PromoDialog`
  component the popup uses (so it cannot drift), plus the list of saved popups
  with switch-on/off, edit and delete.

**Tunable constants** live at the top of `PromoPopup.jsx`:
`SHOW_DELAY_MS` (900), `AUTO_DISMISS_MS` (25000), `SCROLL_DISMISS_PX` (40),
`SEEN_PREFIX` (`'hoaws-promo-seen:'` → change to your own site name).

---

## Part 1 — Prerequisites

**Target site stack** (this exact combination is assumed by the code):

- React 18 or 19 + Vite
- `react-router-dom` (the admin page links and the route)
- `lucide-react` (close, pause, play, upload icons)
- `@supabase/supabase-js`

```bash
npm install @supabase/supabase-js lucide-react react-router-dom
```

**Supabase project** — the free tier is plenty. You need:

- One table, one Storage bucket, and email/password Auth enabled.
- Two keys: the **Project URL** and the **anon public key** (Project Settings →
  API). The anon key is designed to be public — RLS is the security boundary.
  **Never** ship the `service_role` key to a browser.

**Optional but recommended** — a host that lets you set response headers (Vercel,
Netlify, Cloudflare Pages) for the CSP and `noindex` steps in Part 5.

---

## Part 2 — Supabase setup (4 steps, ~10 minutes)

### Step 2.1 — the admin whitelist table

If the target site already has a whitelist table (HOAWS reuses `review_admins`
from its reviews feature), keep it and go to 2.2. Otherwise create the minimal
one. `promo-popups.sql` names `public.review_admins` inside its policies, so
either that table exists or you rename it in both places (see Part 7).

```sql
create table if not exists public.review_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.review_admins enable row level security;
revoke all on table public.review_admins from anon, authenticated;
grant select on table public.review_admins to authenticated;

drop policy if exists "Admins can read their own record" on public.review_admins;
create policy "Admins can read their own record"
  on public.review_admins for select to authenticated
  using (user_id = auth.uid());
```

Why a whitelist *table* rather than a flag on the Auth user: it can be revoked
without touching the user, it is auditable, and every policy then shares one
predicate — `exists (select 1 from public.review_admins where user_id = auth.uid())`.

### Step 2.2 — run the schema

In the Supabase SQL Editor, paste **all** of `supabase/promo-popups.sql` and run
it. Every statement is idempotent, so re-running is safe. It creates:

- `public.promo_popups` plus an index on `(is_active, created_at desc)` for the
  "newest live popup" lookup.
- A `touch_promo_popup()` trigger so `updated_at` maintains itself.
- Grants + RLS. Visitors (`anon`) can only ever `select` a row that is switched
  on **and** inside its window. Whitelisted `authenticated` users get
  insert/update/delete.
- The public **`promo-media`** Storage bucket: `file_size_limit` 25 MB,
  `allowed_mime_types` = mp4, webm, png, jpeg, webp.
- Storage policies: anyone may read the bucket, only whitelisted admins may
  upload/overwrite/delete.

The two numbers to keep in sync with the front end are the 25 MB cap and the
MIME list — they are mirrored in `src/lib/promo.js` as `MAX_VIDEO_BYTES` and
`VIDEO_MIME_TYPES` / `IMAGE_MIME_TYPES`.

### Step 2.3 — create the admin user

Dashboard → **Authentication → Users → Add user** → email + password → tick
**Auto Confirm User**. Without that tick the account cannot sign in and you will
get "Invalid login credentials" no matter how many times you retype it. This is
the single most common way to get stuck on this feature.

### Step 2.4 — whitelist that user

Change the email on line 13 of `supabase/setup-admin.sql` to your admin login and
run the whole file. It:

- looks the address up in `auth.users`;
- raises a clear error if the Auth user does not exist yet, rather than failing
  silently;
- inserts the whitelist row with `on conflict do nothing`, so re-running is safe;
- finishes with a `select` that prints the granted row — you should see your
  email listed.

**Sanity check now, before touching any front-end code.** Query the table with
the anon key (and the row switched off) and you should get an empty array, not
the row:

```bash
curl -s "$SUPABASE_URL/rest/v1/promo_popups?select=*" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"
```

---

## Part 3 — Environment variables

`.env.local` in the target project (never commit it — it is in every sane
default `.gitignore`, and make sure it is in this one):

```bash
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Two things that bite here:

1. **Vite only exposes `VITE_`-prefixed vars to the browser.** A var named
   `SUPABASE_URL` will be `undefined` in the bundle and the popup will silently
   never appear.
2. **Vite inlines these at build time.** Adding them in your host's dashboard
   (Vercel → Settings → Environment Variables) does nothing until you
   redeploy/rebuild. And never put `service_role` here — anything in a `VITE_`
   var ships to every visitor.

The code is written to survive them being absent: `supabase` is `null` and every
call returns a friendly error instead of throwing, which is why a missing var
looks like "the popup never shows" rather than a crash.

---

## Part 4 — The files to copy

Copy these six source files **verbatim** — they are self-contained and only use
the dependencies in Part 1:

```
src/lib/promo.js
src/components/PromoPopup.jsx
src/components/PromoPopup.css
src/pages/PromoAdmin.jsx
src/pages/PromoAdmin.css
```

Plus two SQL files you only need for the setup in Part 2:

```
supabase/promo-popups.sql
supabase/setup-admin.sql
```

Raw URLs, if you would rather pull them than copy from disk
(`https://raw.githubusercontent.com/Jeraque007/HOAWS/main/` + the path):

```
src/lib/promo.js
src/components/PromoPopup.jsx
src/components/PromoPopup.css
src/pages/PromoAdmin.jsx
src/pages/PromoAdmin.css
supabase/promo-popups.sql
supabase/setup-admin.sql
```

### One file you copy *selectively*: `src/lib/supabase.js`

That file also holds the reviews feature, so do not copy it wholesale. Create a
`src/lib/supabase.js` in the target site containing the client setup:

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
```

…then bring across these members, in this order (they are contiguous-ish blocks
in the HOAWS file):

| Member | Purpose |
| --- | --- |
| `promoFields` | The one column list every query selects — keep it a single const so the shape can never drift |
| `promoConfigurationError()` | The "not configured yet" error factory |
| `trimToNull(value, max)` | Trims and clamps a field to the column's `check` length |
| `promoPayload(promo)` | Form → row mapper. Defaults `headline` to `'Announcement'` because the column is `not null` |
| `getActivePromo()` | The visitor lookup: newest live row, or `null` |
| `getPromoAdminData()` | Every row, newest first, for the admin list |
| `savePromo(promo, promoId)` | Insert or update |
| `setPromoActive(id, bool)` | The switch-on/off toggle |
| `deletePromo(id)` | Delete the row |
| `promoMimeByExtension` + `uploadPromoFile(file, kind)` | Storage upload |
| `getAdminSession()` | `supabase.auth.getSession()` wrapper |
| `subscribeToAdminAuth(cb)` | `onAuthStateChange`, returns an unsubscribe |
| `signInAdmin(email, password)` | `signInWithPassword` |
| `signOutAdmin()` | `signOut` |

The row shape the front end expects (this is the table, field for field):

```
id uuid · kicker · headline · body · quote · attribution ·
image_url · video_url · cta_label · cta_url ·
is_active bool · starts_at · ends_at · created_at · updated_at
```

`headline` is the only required text column. `kicker`, `body`, `quote`,
`attribution`, `cta_label` and `cta_url` all render conditionally, so an empty
value simply hides that element — you can ship a text-only popup, an
image-only popup, or a video-only popup with no changes.

---

## Part 5 — Wiring it into the target app (5 edits)

### 5.1 Register the admin route

```jsx
const PromoAdmin = lazy(() => import('./pages/PromoAdmin'))

<Route path="/promos/admin" element={<PromoAdmin />} />
```

Lazy-load it: the page drags in the auth and admin code, and visitors have no
business downloading that. The consequence to keep in mind is that a **cold
direct hit** on `/promos/admin` is the first thing that loads, so any stylesheet
the page uses via a class (not via an imported component) must be imported by
the page itself. That is why `PromoAdmin.jsx` starts with:

```js
import '../components/PageHero.css'   // it uses .page-hero classes but not the component
import './PromoAdmin.css'
```

Keep both imports. `PromoPopup.css` needs no wiring — `PromoPopup.jsx` imports
its own stylesheet, so it travels with the component.

### 5.2 Mount the popup

Drop `<PromoPopup />` at the top of whichever page should show it. In HOAWS that
is `src/pages/Home.jsx`:

```jsx
import PromoPopup from '../components/PromoPopup'
...
<PromoPopup />
```

It renders `null` when there is no live row, so mounting it in your app shell
instead gives you a site-wide popup with no other change — just be deliberate
about that choice, and remember the lookup runs once per mount.

### 5.3 Keep the private route out of search results

Two belts, because one is not enough:

1. In `SEO.jsx`, add the path to the `privatePaths` array — it flips
   `<meta name="robots">` to `noindex, nofollow`:

   ```js
   const privatePaths = ['/reviews/admin', '/promos/admin']
   ```

2. Add a response header in `vercel.json` (or your host's equivalent):

   ```json
   {
     "source": "/promos/admin",
     "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }]
   }
   ```

Also add a `Disallow: /promos/admin` line to `robots.txt`.

### 5.4 Content-Security-Policy, if the target site sets one

The popup streams video from Supabase Storage and the admin talks to Supabase
Auth, so the CSP needs:

```
media-src   'self' blob: https://*.supabase.co;
connect-src 'self' https://*.supabase.co wss://*.supabase.co;
img-src     'self' data: blob: https:;
```

Both failure modes are invisible: no `media-src` entry and the video just
refuses to play with nothing in the UI; no `wss://` entry and sign-in hangs on
the realtime auth socket.

### 5.5 Change the admin email

`setup-admin.sql` hardcodes the address `info@hoaws.co.za` — change it to your own
admin login before you run it. Everything else (table name, bucket name, route,
sessionStorage prefix) is renameable, and Part 7 lists every place each name
appears so nothing gets missed. Out of the box it all works as-is.

---

## Part 6 — Styling: the only outside dependencies

The files you copy are self-contained apart from **eight custom properties**,
**three fonts**, and a few shared utility classes the admin page borrows.

### The eight custom properties

| Token | Colours |
| --- | --- |
| `--ink` | Popup card + dialog background, the dark backdrop behind the admin preview |
| `--cyan` | Kicker, the "Enter site" button, focus rings |
| `--cyan-deep` | Admin focus rings, links, the "back" link hover |
| `--gold` | The left rule on the quoted line |
| `--gold-soft` | The quote text itself |
| `--cream` | Admin input/textarea backgrounds |
| `--line` | Admin input borders, dividers |
| `--white` | Card copy, admin card backgrounds |

### The fonts

The kicker and credit use **DM Mono**, everything else **Manrope**, and the
quote **Playfair Display** (italic). Copy this into the target `index.html` — the
`preconnect` pair is what stops the font CSS sitting in a render-blocking chain:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,600&display=swap" />
```

### Shared utility classes the admin page uses

`.button` + `.button-primary` (the Enter site button), `.container`, `.section`,
and the `.page-hero*` classes. If the target site lacks them, paste this into its
global stylesheet — the values are HOAWS's, retheme at will:

```css
:root {
  --ink: #07131b;
  --cyan: #5ce3ed;
  --cyan-deep: #1b9db0;
  --gold: #efbd53;
  --gold-soft: #f9dd9a;
  --cream: #f6f4ed;
  --line: rgba(9, 38, 49, 0.14);
  --white: #fff;
}
.button {
  display: inline-flex; align-items: center; justify-content: center; gap: 9px;
  padding: 14px 19px; border: 0; border-radius: 999px;
  font: 700 12px 'Manrope', sans-serif; cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease;
}
.button:hover { transform: translateY(-2px); }
.button-primary { background: var(--cyan); color: var(--ink); box-shadow: 0 12px 30px rgba(92, 227, 237, .28); }
.container { width: min(1180px, calc(100% - 72px)); margin: 0 auto; }
.section { padding: 120px 0; }
```

Also copy **`src/components/PageHero.css`** if you want the admin page's header
block to look like the rest of the workspace pages — `PromoAdmin.jsx` already
imports it and falls back to unstyled when it is missing.

### The one non-obvious sizing rule

The admin preview must render at the **same width** as the live popup, or the
text wraps differently and it stops being a truthful preview. The live dialog is
`width: min(100%, 420px)`, so the sidebar column is sized:

```
420 (dialog) + 36 (preview padding) + 56 (card padding) = 512px
```

(It is set to 520px in `PromoAdmin.css`.) If you retheme the dialog width, move
that column with it.

---

## Part 7 — Rename map

Everything is renameable. This is the complete list of the places each name
appears, so nothing gets missed:

| To rename | Change it in |
| --- | --- |
| table `promo_popups` | `promo-popups.sql` (table, index, trigger, every policy), the `promoFields` const, and every `.from('promo_popups')` in `lib/supabase.js` |
| bucket `promo-media` | the `insert into storage.buckets` block **and** all four Storage policies in the SQL, plus the two `.from('promo-media')` calls in `uploadPromoFile` |
| whitelist table `review_admins` | Step 2.1's SQL, `setup-admin.sql`, and the `exists (select 1 from public.review_admins …)` predicate in every policy in `promo-popups.sql` |
| upload folders `video/`, `posters/` | the `const folder = kind === 'image' ? 'posters' : 'video'` line in `uploadPromoFile` |
| route `/promos/admin` | the route in `App.jsx`, the `privatePaths` array in `SEO.jsx`, the `vercel.json` header rule, `robots.txt` |
| sessionStorage prefix | `SEEN_PREFIX` at the top of `PromoPopup.jsx` |
| the admin email | line 13 of `setup-admin.sql` |
| timings | `SHOW_DELAY_MS`, `AUTO_DISMISS_MS`, `SCROLL_DISMISS_PX` in `PromoPopup.jsx` |
| upload limits | `MAX_VIDEO_BYTES` / `MAX_IMAGE_BYTES` in `lib/promo.js` **and** the bucket's `file_size_limit` in the SQL — change both together |

**Keep the `promo-*` CSS class prefix.** Renaming classes means editing the JSX
and both stylesheets for zero benefit.

---

## Part 8 — Verification checklist

Run these in order after wiring. Each one catches a different class of failure,
and several of them caught real bugs while this was being built.

1. **RLS gate.** With the row switched off, the anon REST query from Step 2.4
   returns `[]`. Switch it on and it returns one row. This proves the anon key is
   doing what you think it is.
2. **Auth user exists.** Sign in at the admin route. "Invalid login credentials"
   with a password you *know* is correct almost always means the Auth user was
   never created, or **Auto Confirm User** was not ticked. It is an account
   problem, not a code problem.
3. **Whitelist row.** Signing in can succeed and the page still show nothing.
   RLS returns *zero rows* rather than an error, so an empty list after a
   successful sign-in = missing whitelist row (Step 2.4).
4. **Upload lands.** Upload the MP4, save, then check Storage for
   `video/<timestamp>-<random>.mp4` and confirm the row's `video_url` is the
   `.../storage/v1/object/public/promo-media/video/...` URL.
5. **The MIME trap.** If an upload fails with "mime type ... is not supported",
   the browser sent `text/plain;charset=UTF-8` because `file.type` was empty —
   `uploadPromoFile` resolves the MIME from the file extension for exactly this
   reason. Do not "simplify" that away and never trust `file.type` alone.
6. **Both media ratios.** Upload one **square** file and one **9:16** file and
   confirm neither is cropped. The card deliberately does not force a square box:
   `height: auto` + `object-fit: contain` + a height cap preserves the source
   ratio and letterboxes tall video instead of slicing it.
7. **Once per tab.** Reload in the same tab → no popup. Open a new tab → popup.
   (Clear the `promo-seen:<id>` sessionStorage key to re-test in the same tab.)
8. **Every dismiss path.** Enter site, ✕, Esc, tap outside, scroll past 40px,
   wheel, and letting the 25 s timer run out.
9. **Reduced motion.** DevTools → Rendering → *Emulate prefers-reduced-motion:
   reduce*. The video must not autoplay and must show native controls.
10. **No live row.** Switch it off and load the page: no popup, and a clean
    console.
11. **Deploy caching.** Production assets are hash-named and immutable. If the
    site still behaves like the old build, hard-refresh (`Ctrl+Shift+R`) and
    compare the asset filenames in *view-source*, not the rendered page. A stale
    bundle compared against a fresh admin page is what made this feature look
    broken twice during development.

---

## Part 9 — If the target site is not on Supabase

The popup component only ever calls **one** thing: `getActivePromo()`. So the
whole backend is replaceable by writing a different `src/lib/supabase.js` that
exports the same names with the same return shapes:

| Export | Return shape |
| --- | --- |
| `getActivePromo()` | `Promise<{ data: Row \| null, error }>` — the only one the popup touches |
| `getPromoAdminData()` | `Promise<{ data: { promos: Row[] }, error }>` |
| `savePromo(promo, promoId)` | `Promise<{ data, error }>` |
| `setPromoActive(promoId, isActive)` | `Promise<{ data, error }>` |
| `deletePromo(promoId)` | `Promise<{ data, error }>` |
| `uploadPromoFile(file, kind)` | `Promise<{ data: { path, url }, error }>` |
| `getAdminSession()` | `Promise<{ data: { session } }>` |
| `subscribeToAdminAuth(cb)` | returns an unsubscribe function |
| `signInAdmin(email, password)` | `Promise<{ data, error }>` |
| `signOutAdmin()` | `Promise<{ error }>` |

Two cautions:

- **Do not ship a write endpoint that trusts the client.** On Supabase the anon
  key is public by design and RLS is the boundary. If you swap in your own API,
  that boundary becomes your responsibility — the admin route being "hidden" is
  not security.
- If the site has no auth at all, the smallest honest option is to put HTTP Basic
  / an edge-signed cookie in front of both the admin page *and* the upload and
  insert endpoints. Front-end-only gating is decoration.

If the target site is not React, the CSS ports as-is but the component does not:
it is ~150 lines of plain React hooks (`useState`/`useEffect`/`useRef`/
`useCallback`) with no libraries beyond the lucide icons. Port it against the
behaviour contract in **Part 0** — that, not the code, is the specification.

---

## Part 10 — Decisions worth keeping, and the failure each one prevents

Every one of these was a real problem in this codebase. If you rewrite something
in Parts 4–6, check this table first — most of them look like over-engineering
until you have the bug.

| Decision in the code | The failure it prevents |
| --- | --- |
| Media keeps its own aspect ratio (`height: auto` + `object-fit: contain` + height cap) | Forcing a square box cropped a 576×1024 reel to the middle of the frame |
| One exported `PromoDialog` renders both the popup and the admin preview | The preview showed native video controls and no Enter-site button while the live popup autoplayed — "it doesn't match the admin side" |
| `preview` mode swaps the buttons for inert `<span>`s and sets `aria-hidden` | The admin preview silently becomes a real, clickable dialog |
| Sidebar sized so the preview dialog is a true 420px | The preview wrapped its text at 378px, so it lied about the live popup |
| MIME resolved from the file extension in `uploadPromoFile` | storage-js defaults to `text/plain;charset=UTF-8` when `file.type` is empty, which the bucket's allow-list rejects |
| `headline` defaults to `'Announcement'` | The `not null` column rejects an empty form with a raw Postgres error |
| Schedule checked in RLS **and** in the client | A popup whose window just expired stays on screen until the next reload |
| `sessionStorage`, keyed per row id | The popup nags on every single reload |
| Visitor-path errors swallowed (`catch(() => {})`) | A Supabase outage would throw inside render and blank the page |
| Focus moved in, Tab trapped, focus restored | Keyboard users end up stuck behind the dialog or focused on the page underneath it |
| Explicit pause control on the autoplaying video | WCAG 2.2.2 (pause, stop, hide) — autoplay with no control is a genuine accessibility defect, and `prefers-reduced-motion` users get no autoplay at all |
| `noindex` in three places: meta, header, robots.txt | A private workspace getting crawled and indexed |

---

## Part 11 — Order of operations

Do these in this order; each step is verifiable before you move on.

1. Create the Supabase project.
2. Run Part 2.1 (the whitelist table) — **skip if you already have one**.
3. Run all of `supabase/promo-popups.sql`.
4. Create the Auth user, ticking **Auto Confirm User**.
5. Change the email in `supabase/setup-admin.sql`, run it, and check that the
   final `select` prints your address.
6. `curl` the table with the anon key (Step 2.4) and confirm you get `[]` while
   it is switched off. **Do not skip this** — it proves the security boundary
   before any UI exists to confuse you.
7. Copy the five source files plus `PageHero.css`, and add the promo + auth
   members to your `lib/supabase.js` (Part 4).
8. Add the two `VITE_` env vars, then **restart the dev server** — Vite reads
   `.env` at boot.
9. Wire it up: route (5.1), mount (5.2), `privatePaths` + header + robots (5.3),
   CSP (5.4).
10. `npm run dev` → open `/promos/admin` → sign in → paste the block → **Fill the
    fields** → upload the MP4 → tick **Live for visitors** → Save.
11. Open the site in a **new tab**. Run the Part 8 checklist.
12. Deploy, then hard-refresh.

Expected time: **about 30 minutes** for steps 1–9 on a fresh Supabase project,
plus however long the video upload takes.

---

*The parser is deliberately forgiving so a pasted block does the right thing:
line 1 splits on an em/en dash into kicker + headline when the left side is 40
characters or fewer; a line starting with a quote mark becomes the quote (the
wrapping quotes are stripped); a line starting with a dash becomes the credit;
everything else accumulates into the body, one line per line. If a block does not
parse the way you want, fix the fields by hand — nothing is saved until you press
Save.*






