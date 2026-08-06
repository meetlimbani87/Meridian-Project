# Meridian — Luxury Estate Site

A single-page marketing site for a luxury architecture/real-estate brand, built with Next.js (App Router), Tailwind CSS, Framer Motion, GSAP/ScrollTrigger, and Lenis smooth scroll. The centerpiece is a scroll-scrubbed image-sequence hero (like a video, but frame-by-frame canvas drawing).

This file is meant to stay up to date as the project evolves — it's the map of how everything fits together, plus a running log of the non-obvious bugs we've already hunted down so they don't get reintroduced.

---

## Running it locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

---

## The hero: video, not an image sequence

The hero used to preload 600 individual JPEGs (~143MB total) as `Image()` objects and draw them frame-by-frame to a canvas as you scrolled. It looked right but took a long time to become interactive, especially on a slower connection.

It now scrubs a single compressed video (`public/video/hero.mp4`, ~11MB) by setting `video.currentTime` against scroll progress instead of swapping canvas frames — video codecs compress the redundancy between consecutive frames far better than treating each one as an independent JPEG, so the visual result is the same but the payload is roughly 13x smaller. `Hero.tsx` also fully fetches the video into memory via `fetch()` and hands the browser a `Blob` URL rather than the network URL directly, so once the hero is ready, every scroll-driven seek is a pure local decode with zero chance of the network stalling it mid-scrub.

The video is encoded with a keyframe every 15 frames (`-g 15`) rather than the default (~250 frames). Seeking to an arbitrary point in a video normally means decoding forward from the nearest keyframe, so sparse keyframes plus fast scroll-driven seeks is what caused visible frame-skipping before this — frequent keyframes make every seek closer to an instant jump.

The original 600 frames are archived in `source-frames/hero-sequence/` (gitignored, not deployed) in case the footage ever needs to change — this folder is ~143MB and isn't needed to run the site at all, so it's fine to delete it if you're confident you won't re-encode the hero from different footage later. To regenerate the video from a new frame sequence:

```bash
cd source-frames/hero-sequence
ffmpeg -y -framerate 30 -i %03d.jpg -c:v libx264 -pix_fmt yuv420p -crf 20 -preset slow -g 15 -keyint_min 15 -sc_threshold 0 -movflags +faststart ../../public/video/hero.mp4
```

`public/poster.jpg` (a copy of the first frame) is used as the video's `poster` attribute so something shows instantly before the video buffers.

A handful of other sections (Featured Projects, Showcases, Testimonials) each use one or two specific stills pulled from that same original sequence — those are saved individually as small standalone files in `public/projects/` rather than depending on the full 600-frame folder.

---

## How the page is put together

`app/page.tsx` is the single entry point. It renders, top to bottom:

| Component | What it does |
|---|---|
| `LoadingScreen` | Full-screen overlay showing the "Meridian" wordmark and a load percentage until the hero video has buffered enough to scrub smoothly. |
| `CustomCursor` | Desktop-only replacement cursor (dot + trailing ring). Color-adapts per section — see "Theming" below. |
| `Navbar` | Fixed top nav, links to each section by id. Below the `md` breakpoint, the links and "Book Consultation" button collapse into a hamburger-triggered slide-down menu instead of just disappearing. |
| `Hero` | Full-viewport video that scrubs through the hero footage as you scroll, pinned via GSAP ScrollTrigger. |
| `Showcases` → `ShowcaseSection` | Alternating image/text panels (e.g. "Form Follows Feeling"). |
| `FeaturedProjects` | Horizontal-scrolling row of project cards. |
| `WhyChooseUs` | Light-themed value-prop section. |
| `Statistics` | Light-themed stat counters (250+ homes, 18+ years, etc). |
| `Testimonials` | Light-themed client quote cards. |
| `CTA` | Dark closing call-to-action band. |
| `Footer` | Site footer. |
| `BackToTop` | Floating button, appears after scrolling past the hero. |

### Data flow for the hero

`Hero.tsx` owns a `<video>` element directly — no preload hook, no context. It waits for `canplaythrough` (or a short fallback timeout so a slow connection can't hang the page forever), reports buffering progress up to `page.tsx` for the loading screen, then hands scroll control to a GSAP ScrollTrigger with `scrub: true` that sets `video.currentTime` on every update.

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
- **Hero taking a long time to become interactive.** The original approach preloaded 600 separate JPEGs (~143MB) before the page would unblock. Replaced with a single ~11MB compressed video scrubbed via `currentTime` (see "The hero: video, not an image sequence" above). This also removed the entire image-sequence manifest/preload system (`useImageSequence`, `useSequenceManifest`, `SequenceManifestContext`, the `/api/sequence-manifest` route) since nothing needs it anymore — the few other stills that used to come from that sequence (Featured Projects, Showcases, Testimonials) now reference small standalone files in `public/projects/` instead.
- **Hero video visibly skipping/stuttering frames while scrubbing.** Two compounding causes: the video was encoded with default (sparse, ~250-frame) keyframe spacing, so an arbitrary scroll-driven seek had to decode forward from a distant keyframe; and it was playing directly off the network URL, so a seek to a not-yet-downloaded point stalled waiting on a new request. Fixed by re-encoding with a keyframe every 15 frames (near-instant seeks) and switching `Hero.tsx` to `fetch()` the whole file into memory up front and scrub a `Blob` URL, so once ready, scrubbing never touches the network again.
- **No mobile navigation.** `Navbar`'s links and CTA button were both `hidden` below `md` with no fallback — on a phone there was no way to navigate at all, just the logo. Added a hamburger toggle that reveals a slide-down mobile menu (`Navbar.tsx`), locks background scroll while open, and auto-closes if the viewport is resized past mobile.
- **Navbar barely visible against bright parts of the hero video.** In its default (unscrolled) state the nav had `bg-transparent`, so the white logo/links had no contrast against light-colored parts of the hero footage (e.g. sky). Added a permanent subtle dark gradient scrim behind the nav that's independent of the scroll-triggered `glass-dark` background, so it stays readable at any scroll position.
- **Plain gap appearing below the pinned Hero, first white then still visible as black.** GSAP's ScrollTrigger `pin: true` wraps the pinned Hero in its own spacer div (`.pin-spacer`) to reserve scroll space. First pass: gave that spacer an explicit `background: var(--color-charcoal)` in `globals.css`, since it has no background of its own. That only hid the symptom, though — the real bug was that `end` on the ScrollTrigger was a static string computed once at mount (`` `+=${scrollLength}` ``). Calling `ScrollTrigger.refresh()` later (e.g. after a DevTools resize) re-measures trigger *positions* but does **not** re-run a static `end` value, so it kept reusing the pin-release point calculated against whatever viewport height happened to exist at mount — the pin could let go too early and expose the spacer's raw background as a real, visible gap rather than smoothly filling the scroll range. Fixed properly by making `end` a function (`end: () => \`+=${window.innerHeight * getScrollHeightMultiplier()}\``) plus `invalidateOnRefresh: true`, so a refresh genuinely recalculates against the current viewport instead of a stale one. Also switched the Hero's height from `100vh` to `100dvh` (falls back to `100vh` automatically on older browsers), which better matches what mobile browsers actually display as their address bar shows/hides.
- **Navbar links/logo/CTA overlapping at tablet widths.** The full inline nav (logo + 5 links + a pill-shaped CTA button) was set to appear starting at the `md` breakpoint (768px), which isn't actually enough horizontal room for all of it — it visibly crowded together (e.g. the logo and first link nearly touching) on tablet-sized viewports. Raised the breakpoint to `xl` (1280px) throughout `Navbar.tsx`, so the compact hamburger menu now correctly covers phones *and* tablets, and the full inline layout only appears on genuinely wide desktop viewports where it has room to breathe.

---

## Notes for future changes

- New sections should follow the existing pattern: an explicit `bg-charcoal`/`bg-ivory` class plus a matching `data-cursor-theme`.
- Colors live in `tailwind.config.ts` (`charcoal`, `ivory`, `brass`, `brass-light`, `stone`) — change them there rather than hardcoding hex values in components.
- If the hero footage changes, regenerate `public/video/hero.mp4` from `source-frames/hero-sequence/` using the ffmpeg command above — don't add a new `public/sequence/` folder of loose frames, that's the exact setup that made the hero slow before.
