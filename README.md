# Daphni Georgolidis Motion Site

A motion-led **Next.js (App Router) + TypeScript + Tailwind + Framer Motion** website for comedian **Daphni Georgolidis** (`@daphnigg`) with full DE/EN parity.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion

## Design + Motion Constraints Implemented

- Motion-first UI (page transitions, layout continuity, scroll choreography, marquee motion values, hover physics, modal transitions)
- Strict 3-color system only:
  - `#19E6D4` (teal)
  - `#FFE84D` (yellow)
  - `#FFFFFF` (white)
- Bilingual routes:
  - German: `/`
  - English: `/en`
- Reduced-motion fallbacks via `prefers-reduced-motion`

## Local Development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Instagram Extraction (GitHub Tool)

This project uses **Instaloader** (GitHub: [instaloader/instaloader](https://github.com/instaloader/instaloader)) to extract public Instagram profile/post data.

The extraction script writes to:

- `data/instagram.json`
- `public/instagram/*` (downloaded posters + videos when available)

Run:

```bash
npm run fetch:instagram
```

Prereqs:

```bash
pip install instaloader
```

Optional environment variables:

- `IG_PROFILE` (default: `daphnigg`)
- `IG_MAX_POSTS` (optional dev limit)
- `IG_DOWNLOAD_VIDEOS=1` (optional: cache MP4s into `public/instagram/*` which can get large)
- `IG_MAX_VIDEO_DOWNLOADS` (optional: cap number of MP4s cached locally; default `8` when `IG_DOWNLOAD_VIDEOS=1`, unlimited if set to a non-number)
- `IG_USERNAME` + `IG_SESSIONFILE` (recommended for reliability)
- `IG_USERNAME` + `IG_SESSION_BASE64` (CI/Netlify-friendly; writes a temporary `data/ig-session-*` file)
- `IG_USERNAME` + `IG_PASSWORD` (works, but sessionfile is safer)

Example:

```bash
IG_PROFILE=daphnigg IG_MAX_POSTS=25 npm run fetch:instagram
```

Recommended auth (Instagram often blocks unauthenticated scrapes with 403):

1. Create a session file once:

```bash
instaloader --login YOUR_IG_USERNAME --sessionfile ./data/ig-session-daphnigg
```

2. Then run:

```bash
IG_PROFILE=daphnigg IG_USERNAME=YOUR_IG_USERNAME IG_SESSIONFILE=./data/ig-session-daphnigg npm run fetch:instagram
```

Notes:

- Instagram may require authenticated session cookies for reliable extraction.
- No secrets are stored in this repository.
- Captions are stored as source material (`captionSource`) but rendered site copy uses rewritten `rewritten.de` / `rewritten.en` text.
- The session file is ignored via `.gitignore` (`data/ig-session-*`).

CI/Netlify option:

- Put the session file contents into a Netlify env var as base64:
  - `IG_SESSION_BASE64` = `base64 -i ./data/ig-session-daphnigg`
- Set `IG_USERNAME` and `IG_PROFILE` too.
- Use build command: `npm run build:with-instagram`

### Readability / Outlines

Key typography uses a comic-style outline (`.comic-outline`) while staying within the strict 3-color palette
(teal/yellow/white). A true black ink outline would require relaxing that palette rule.

## How Media Is Rendered

1. `scripts/fetch-instagram.mjs` extracts profile + posts and stores JSON in `data/instagram.json`.
2. `lib/instagram.ts` loads that JSON at build/runtime (server side).
3. `components/MotionSite.tsx` renders:
   - Featured reel (score-based by views/likes/comments, fallback to newest)
   - Filterable media grid from extracted posts only
   - Click-to-play modal for direct video URLs
   - Instagram permalink fallback if direct video URL is unavailable

## Bilingual SEO

Localized metadata is implemented for both routes:

- `/` (`de-DE`)
- `/en` (`en-US`)

Includes:

- localized title/description/OG/Twitter
- canonical + hreflang alternates
- JSON-LD person + website schema
- sitemap + robots

## Netlify Deploy (GitHub → Netlify)

1. Push this repository to GitHub.
2. In Netlify: **Add new site** → **Import from Git**.
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add environment variables in Netlify UI if you want extraction in CI (optional).
5. If you want extraction before each deploy, use:
   - Build command: `npm run build:with-instagram`

Recommended: keep extraction as a manual pre-deploy step unless you can provide stable Instagram session cookies in Netlify env vars.
