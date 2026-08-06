# Meridian Estates — Luxury Real Estate Landing Page

A production-ready Next.js 15 (App Router) + TypeScript + Tailwind landing
page built around a scroll-scrubbed canvas image sequence, in the style of
Apple product pages.

## How the sequence is loaded (important)

Earlier versions of this project guessed at the frame count (600) and file
extension. That guessing was fragile and caused 404s. **It's been replaced
with a server API that reads your actual `public/sequence` folder and
reports back exactly what's there.**

- `app/api/sequence-manifest/route.ts` runs on the server, reads
  `public/sequence`, filters to image files (`.png`, `.jpg`, `.jpeg`,
  `.webp`, `.avif`), and naturally sorts them by the number in each
  filename.
- `hooks/useSequenceManifest.ts` fetches that list once on page load.
- Everything downstream — the hero's frame count, the showcase/testimonial/
  project sample images — is driven by that real list. There is no
  hardcoded frame count and no assumed extension anywhere in the app.

**This means:** whatever you put in `public/sequence/` — 300 frames or 600,
`.jpg` or `.png`, zero-padded or not, with or without gaps — is exactly
what plays. If a frame is missing, that specific frame just won't appear in
the manifest; it won't 404 during playback because it's never requested.

### If the hero looks blank or a red warning banner appears

That means either:
1. `public/sequence/` has no image files in it → you'll see a clear
   "Sequence not found" screen telling you so, or
2. Some frames loaded but individual ones failed (e.g. a corrupted file)
   → a small red banner on the hero reports how many.

To debug a specific failure, open the browser's Network tab, look for the
failing request, and check that the exact URL shown matches a real file in
`public/sequence` (case, extension, and all).

## Getting your frames in place

Drop your full sequence into `public/sequence/`, e.g.:

```
public/sequence/001.jpg
public/sequence/002.jpg
...
public/sequence/300.jpg   (or however many you have)
```

Two placeholder frames from your reference images are already in there so
the app runs out of the box — replace them with your real sequence.
Frames should be a consistent aspect ratio and reasonably compressed —
hundreds of uncompressed PNGs will be heavy to preload; `.jpg` or `.webp`
at ~80% quality is a good default.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000. If you change the contents of
`public/sequence/`, just refresh the page — the manifest API always reads
the folder fresh, no restart required.

## Project structure

```
app/
  api/sequence-manifest/route.ts   # reads public/sequence off disk
  layout.tsx, page.tsx, globals.css
components/          # Hero, Navbar, Showcases, Statistics, etc.
hooks/                # useSequenceManifest, useImageSequence, useLenis
lib/                  # SequenceManifestContext, small utilities
public/sequence/      # your image sequence — any count, any extension
```

## How the scroll-scrubbed hero works

1. `useSequenceManifest` fetches the real file list from the server.
2. `useImageSequence` preloads every frame in that list with 12-way
   concurrency, reporting 0–100 progress used by `LoadingScreen`.
3. Once loaded, `Hero` sets up a single `ScrollTrigger` that **pins** the
   hero section for `4.5 × window.innerHeight` of scroll distance.
4. On every scroll update, `ScrollTrigger`'s `progress` (0–1) maps to a
   frame index (0 to frame-count − 1) and draws it to a `<canvas>` with
   cover-fit + DPR scaling — no `<video>` element anywhere.
5. The title holds fully visible for the first ~5% of scroll, then fades
   out completing by ~42% of the scroll range — i.e. roughly frame
   200–300 of a 600-frame sequence — rather than disappearing immediately.
   This is proportional to whatever frame count you actually have.
6. When the scroll range ends, `ScrollTrigger` releases the pin
   automatically and the page continues scrolling normally.

## Design tokens

Derived from the supplied reference frames (travertine stone exterior,
warm brass door and fixtures, deep olive palms, soft charcoal interior
shadow):

- `ivory` #F6F3EC, `charcoal` #16130F, `brass` #A9814A / `brass-light`
  #CBA46E, `olive` #454B39, `taupe` #8C8272, `stone` #C9BFA8
- Display face: **Fraunces** (soft, editorial serif) · Body/utility:
  **Manrope**

## Notes / next steps

- Replace the two placeholder images in `public/sequence/` with your real
  sequence.
- Showcase, testimonial, and featured-project imagery currently pick
  frames proportionally from your sequence as stand-ins — swap in real
  project photography when you have it.
