# Meridian — Luxury Estate Site

A single-page marketing site for a luxury architecture/real-estate brand, built with Next.js (App Router), Tailwind CSS, Framer Motion, GSAP/ScrollTrigger, and Lenis smooth scroll. The centerpiece is a scroll-scrubbed image-sequence hero (like a video, but frame-by-frame canvas drawing).

This file is meant to stay up to date as the project evolves — it's the map of how everything fits together, plus a running log of the non-obvious bugs we've already hunted down so they don't get reintroduced.

---

## Running it locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The image sequence lives in `public/sequence/` and must contain exactly frames `001.jpg` … `600.jpg` — nothing else (see the changelog below for why that matters).

---

## How the page is put together

`app/page.tsx` is the single entry point. It renders, top to bottom:

| Component | What it does |
|---|---|
| `LoadingScreen` | Full-screen overlay showing the "Meridian" wordmark and a load percentage until every hero frame has downloaded. |
| `CustomCursor` | Desktop-only replacement cursor (dot + trailing ring). Color-adapts per section — see "Theming" below. |
| `Navbar` | Fixed top nav, links to each section by id. |
| `Hero` | Full-viewport canvas that scrubs through the 600-frame image sequence as you scroll, pinned via GSAP ScrollTrigger. |
| `Showcases` → `ShowcaseSection` | Alternating image/text panels (e.g. "Form Follows Feeling"). |
| `FeaturedProjects` | Horizontal-scrolling row of project cards, pulling still frames out of the same image sequence. |
| `WhyChooseUs` | Light-themed value-prop section. |
| `Statistics` | Light-themed stat counters (250+ homes, 18+ years, etc). |
| `Testimonials` | Light-themed client quote cards. |
| `CTA` | Dark closing call-to-action band. |
| `Footer` | Site footer. |
| `BackToTop` | Floating button, appears after scrolling past the hero. |

### Data flow for the hero image sequence

1. `hooks/useSequenceManifest.ts` calls `app/api/sequence-manifest/route.ts`, which reads `public/sequence/` on the server and returns a sorted list of frame filenames.
2. `hooks/useImageSequence.ts` takes that list and preloads every frame as an `Image()` object with a small concurrency pool (12 at a time), reporting `progress` (0–100) as they resolve.
3. `Hero.tsx` receives the loaded `images` array and draws the frame matching the current scroll position onto a `<canvas>`, driven by a GSAP ScrollTrigger with `scrub: true`.
4. `FeaturedProjects.tsx` reuses the same loaded frames to pull a representative still for each project card (via a `fraction` — e.g. 0.15 means "the frame 15% of the way through the sequence").

### Smooth scroll + ScrollTrigger sync

`hooks/useLenis.ts` sets up Lenis for eased scrolling and ticks it from `gsap.ticker` every frame, and explicitly calls `ScrollTrigger.update` on every Lenis scroll event so the pinned Hero canvas stays in perfect sync with the smoothed scroll position instead of fighting it.

### Theming (dark/light sections + the cursor)

The palette is just two tones: `charcoal` (dark) and `ivory` (light) — see `tailwind.config.ts`. Every section explicitly sets its own `bg-charcoal` or `bg-ivory`; nothing relies on the page's base background.

Each section also carries a `data-cursor-theme="dark"` or `"light"` attribute. `CustomCursor.tsx` checks what's under the pointer every frame via `document.elementFromPoint()`, walks up to the nearest themed ancestor, and swaps its own color to match: **brass/gold on dark sections, charcoal on light sections.** This is deliberately *not* done with `mix-blend-mode: difference` — that approach is fragile here because Framer Motion's heavy use of `transform`/`translate3d` throughout the page pushes elements onto separate GPU compositing layers, and blend modes don't reliably read through those layer boundaries.

If you add a new section, remember to tag it with `data-cursor-theme` — otherwise the cursor falls back to "dark" (brass) styling over it.

---

## Changelog / bugs already fixed

Keeping this list because most of these are the kind of bug that's easy to accidentally reintroduce.

- **Loading screen stuck at 100% forever.** Two causes, both fixed:
  - `public/sequence/` had two stray oversized PNGs (`001.png`, `300.png`) alongside the proper `001.jpg`–`600.jpg` set, making the total 602 instead of 600. The progress percentage used `Math.round`, which can read "100%" while a frame is still genuinely in flight. Removed the stray files and switched to `Math.floor` so the display can't claim done before it is. Also added a 15s per-image timeout in `useImageSequence.ts` so one stalled request can never hang the whole page again.
  - The loading screen was gated on `loaded && heroReady`, where `heroReady` only flipped once Hero successfully painted a canvas frame — an unnecessary second point of failure. Now it's gated on `loaded` alone (`app/page.tsx`).
- **Wheel scroll barely worked / felt glitchy.** `gsap.ticker` reports elapsed time in *seconds*, but `lenis.raf()` expects a millisecond timestamp. Missing the `* 1000` conversion meant Lenis's eased position barely advanced each frame. Fixed in `hooks/useLenis.ts`, along with adding `lenis.on("scroll", ScrollTrigger.update)` so the pinned hero doesn't fight the smoothing.
- **"Form Follows Feeling" section rendering with a light background instead of dark.** `bg-charcoal` was applied to the same div as `max-w-7xl mx-auto`, so it only painted the centered content box, not the full section width. Split into an outer full-bleed wrapper (`bg-charcoal`) with an inner centered content grid (`ShowcaseSection.tsx`).
- **Featured Projects cards showing ghosted/doubled text and clipped labels.** Each card had two overlapping name labels (always-visible + hover-reveal) stacked in the same spot, and a `-ml-16` negative margin "fanned deck" layout was clipping the next card's label behind the previous one. Simplified to one label per card in a normal (non-overlapping) row (`FeaturedProjects.tsx`).
- **Default browser scrollbar clashing with the design.** Styled to a thin brass thumb on a transparent track (`app/globals.css`), and switched the page's base `html`/`body` background from ivory to charcoal so the scrollbar gutter doesn't show a stray white sliver next to the mostly-dark page (every section already sets its own explicit background, so this was safe).
- **Custom cursor not inverting correctly over light sections.** Originally used `mix-blend-mode: difference`, which turned out unreliable given how many transformed/animated elements are on the page. Replaced with the explicit `data-cursor-theme` lookup described above, and colored brass on dark sections / charcoal on light ones.
- **Vercel build failing with `Module '"@/lib/utils"' has no exported member 'SequenceExtension'`.** `lib/SequenceExtensionContext.tsx` was leftover dead code from an earlier iteration of the sequence-loading approach (before the manifest-API described above existed) — it referenced a type that no longer exists in `lib/utils.ts`, and nothing in the app actually imported it anymore. Deleted the file.

---

## Notes for future changes

- If the sequence frame count ever changes, double check `public/sequence/` has no stray files — the API route (`app/api/sequence-manifest/route.ts`) just returns whatever's in that folder, sorted.
- New sections should follow the existing pattern: an explicit `bg-charcoal`/`bg-ivory` class plus a matching `data-cursor-theme`.
- Colors live in `tailwind.config.ts` (`charcoal`, `ivory`, `brass`, `brass-light`, `stone`) — change them there rather than hardcoding hex values in components.
