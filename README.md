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

This project uses **yt-dlp** (GitHub: [yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp)) to extract public Instagram profile/post data.

The extraction script writes to:

- `/Users/macbookpro13/Documents/New project/jerry-vsan-site/data/instagram.json`

Run:

```bash
npm run fetch:instagram
```

Optional environment variables:

- `IG_PROFILE_URL` (default: `https://www.instagram.com/daphnigg/`)
- `IG_USERNAME` (default inferred from URL)
- `IG_COOKIES_FILE` (Netscape cookie file, preferred)
- `IG_SESSIONID` (fallback if no cookies file)
- `IG_DS_USER_ID` (optional, helps with session auth)
- `IG_PLAYLIST_END` (default `500`)
- `YT_DLP_BIN` (custom yt-dlp binary path)

Example:

```bash
IG_COOKIES_FILE=/absolute/path/to/instagram-cookies.txt npm run fetch:instagram
```

Notes:

- Instagram may require authenticated session cookies for reliable extraction.
- No secrets are stored in this repository.
- Captions are stored as source material (`captionSource`) but rendered site copy uses rewritten `rewritten.de` / `rewritten.en` text.

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
