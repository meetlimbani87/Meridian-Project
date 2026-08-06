"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clamp, lerp } from "@/lib/utils";

// How much scroll distance (in viewport heights) drives the full sequence.
// Shorter on mobile — 4.5 screens of scrolling just for the hero is a lot
// on a phone, and a smaller reserved range is also less prone to ever
// mismatching the pin-spacer's height when mobile browser chrome shows or
// hides mid-scroll.
function getScrollHeightMultiplier() {
  return window.innerWidth < 768 ? 2.5 : 4.5;
}

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroProps {
  onReady?: () => void;
  onProgress?: (percent: number) => void;
}

/**
 * The hero used to preload all 600 sequence frames as separate images and
 * draw them to a canvas — visually great, but ~140MB had to download before
 * anything played. It now scrubs a single compressed video's currentTime
 * against scroll position instead (video codecs compress the redundancy
 * between consecutive frames far better than 600 independent JPEGs), which
 * gets the same effect down to ~11MB. The whole file is fetched into memory
 * up front (see the effect below) so mid-scroll seeks never have to wait on
 * the network. See public/video/hero.mp4 and README.md for the ffmpeg
 * command used to (re)generate it from source-frames/hero-sequence/ if the
 * footage ever changes.
 */
export default function Hero({ onReady, onProgress }: HeroProps) {
  const [ready, setReady] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const leftTextRef = useRef<HTMLSpanElement | null>(null);
  const rightTextRef = useRef<HTMLSpanElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const scrollCueRef = useRef<HTMLDivElement | null>(null);
  const readyFired = useRef(false);

  // Fully fetch the video into memory first, then hand the browser a blob
  // URL rather than the network URL. Scrubbing scroll can jump to any point
  // in the clip at any time — if it's still streaming progressively, a jump
  // ahead of what's downloaded so far means a stall while it fetches that
  // range, which shows up as skipped/stuck frames. Once it's a blob, every
  // seek is a pure local decode with no network involved.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    let objectUrl: string | null = null;

    async function load() {
      try {
        const res = await fetch("/video/hero.mp4");
        const total = Number(res.headers.get("content-length")) || 0;
        const reader = res.body?.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;

        if (reader) {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            received += value.length;
            if (total) {
              onProgress?.(Math.min(99, Math.floor((received / total) * 100)));
            }
          }
        }

        if (cancelled || !video) return;
        const blob = new Blob(chunks as BlobPart[], { type: "video/mp4" });
        objectUrl = URL.createObjectURL(blob);
        video.src = objectUrl;

        video.addEventListener(
          "loadedmetadata",
          () => {
            if (readyFired.current || cancelled) return;
            readyFired.current = true;
            onProgress?.(100);
            setReady(true);
            onReady?.();
          },
          { once: true }
        );
      } catch {
        // Network hiccup or fetch unsupported in this context — fall back
        // to letting the browser stream it directly rather than blocking
        // the page forever.
        if (cancelled || !video || readyFired.current) return;
        video.src = "/video/hero.mp4";
        video.addEventListener(
          "loadedmetadata",
          () => {
            if (readyFired.current) return;
            readyFired.current = true;
            onProgress?.(100);
            setReady(true);
            onReady?.();
          },
          { once: true }
        );
      }
    }

    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(resizeTimer);
      // Debounced: mobile browsers fire several resize events in a row as
      // their address bar shows/hides during scroll, and refreshing
      // ScrollTrigger on every single one is wasteful and can itself cause
      // the pin measurement to briefly desync.
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
    }
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // The pin's scroll distance is locked in as soon as the hero video is
    // ready, but the sections *below* the hero (showcase images, project
    // thumbnails, etc.) can still be loading in and changing the page's
    // total height at that point. Nothing was watching for that, so the
    // pin-spacer stayed sized for the shorter, stale document — leaving a
    // gap at the bottom (and, once anything reflows horizontally, the
    // right) until some unrelated resize event — e.g. a mobile browser's
    // address bar collapsing once you scroll far enough — happened to
    // trigger a refresh. A ResizeObserver on <body> catches every one of
    // those late layout changes directly, so the fix no longer depends on
    // the user scrolling first.
    let roTimer: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(roTimer);
      roTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    ro.observe(document.body);

    // Also catches any remaining async assets (fonts, below-the-fold
    // images not covered by the observer timing) once everything settles.
    window.addEventListener("load", handleResize);

    return () => {
      clearTimeout(resizeTimer);
      clearTimeout(roTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      window.removeEventListener("load", handleResize);
      ro.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    if (!ready) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || !video.duration) return;

    // GSAP takes a one-time snapshot of this section's computed width the
    // instant the pin below first engages, and locks pin.style.width /
    // max-width to that exact value for as long as it stays pinned — later
    // ScrollTrigger.refresh() calls do not update it again. `ready` becoming
    // true is also the signal page.tsx uses to lift body's overflow:hidden
    // (set during the loading screen), and that toggle happens in a
    // *sibling* component's separate effect, so there's no guarantee it has
    // already committed by the time this runs — the snapshot can land
    // either just before or just after the scrollbar appears, giving an
    // inconsistent locked-in width (a gap on one side, or overflow on the
    // other). Resolving it here first, then forcing a synchronous layout
    // flush, guarantees the snapshot GSAP takes below is already correct.
    if (document.body.style.overflow === "hidden") {
      document.body.style.overflow = "";
    }
    void document.body.offsetHeight; // flush layout synchronously

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        // A function, not a static string — ScrollTrigger.refresh() (fired
        // on resize/orientation change) re-invokes this against the
        // *current* viewport height, instead of forever reusing whatever
        // height happened to be current the moment the trigger was first
        // created. Without this, a resize after mount (e.g. DevTools
        // device toolbar, or a mobile browser's address bar changing the
        // viewport) leaves the pin release point stale, so the pin can let
        // go too early and expose the spacer's raw background as a gap.
        end: () => `+=${window.innerHeight * getScrollHeightMultiplier()}`,
        pin: true,
        pinSpacing: true,
        // "fixed" (the default) removes the pinned element from normal flow
        // and pads it to compensate for the browser's default scrollbar
        // width — but our scrollbar is deliberately thinner (see the
        // scrollbar-width: thin rule in globals.css), so that compensation
        // over-pads and leaves a bare strip of background on the right for
        // as long as the hero is pinned. "transform" keeps the pinned
        // element inside normal flow instead, so it just inherits the
        // actual current width and never needs that compensation at all.
        pinType: "transform",
        scrub: 0.4,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;

          // Drive the video across the full scroll range by seeking it,
          // rather than swapping canvas frames.
          video.currentTime = clamp(progress * video.duration, 0, video.duration);

          // Title + subtitle hold fully visible early on, then fade out by
          // roughly a third of the way through the scroll range.
          const TEXT_HOLD = 0.05; // stays fully visible until ~5% scroll
          const TEXT_FADE_END = 0.42; // fully faded by ~42% scroll
          const textProgress = clamp(
            (progress - TEXT_HOLD) / (TEXT_FADE_END - TEXT_HOLD),
            0,
            1
          );
          const ease = 1 - Math.pow(1 - textProgress, 3); // cubic ease-out

          if (leftTextRef.current) {
            gsap.set(leftTextRef.current, {
              xPercent: lerp(0, -60, ease),
              opacity: lerp(1, 0, ease),
            });
          }
          if (rightTextRef.current) {
            gsap.set(rightTextRef.current, {
              xPercent: lerp(0, 60, ease),
              opacity: lerp(1, 0, ease),
            });
          }
          if (subtitleRef.current) {
            gsap.set(subtitleRef.current, {
              opacity: lerp(1, 0, textProgress),
              y: lerp(0, -12, textProgress),
            });
          }
          if (overlayRef.current) {
            gsap.set(overlayRef.current, {
              opacity: lerp(0.38, 0.18, ease),
            });
          }
          if (scrollCueRef.current) {
            gsap.set(scrollCueRef.current, {
              opacity: lerp(1, 0, clamp(progress / 0.08, 0, 1)),
            });
          }
        },
      });

      return () => st.kill();
    }, section);

    return () => ctx.revert();
  }, [ready]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-charcoal"
      style={{ height: "100dvh" }}
      aria-label="Meridian Estates introduction"
      data-cursor-theme="dark"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        poster="/poster.jpg"
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 bg-charcoal"
        style={{ opacity: 0.38 }}
      />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <h1 className="select-none font-display text-[12vw] font-light leading-[0.95] text-white sm:text-[8vw] lg:text-[6.2vw]">
          <span className="block overflow-hidden">
            <span ref={leftTextRef} className="inline-block">
              Crafting Luxury
            </span>
          </span>
          <span className="block overflow-hidden">
            <span ref={rightTextRef} className="inline-block italic">
              Living Experiences
            </span>
          </span>
        </h1>

        <p ref={subtitleRef} className="eyebrow mt-8 text-white/80">
          Luxury Homes &nbsp;•&nbsp; Premium Interiors &nbsp;•&nbsp; Bespoke Design
        </p>
      </div>

      <div
        ref={scrollCueRef}
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-white/70"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="eyebrow text-[0.62rem]">Scroll</span>
          <div className="h-10 w-px bg-white/40">
            <div className="h-full w-full origin-top animate-[scrollcue_1.8s_ease-in-out_infinite] bg-white" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollcue {
          0% { transform: scaleY(0); opacity: 0; }
          40% { transform: scaleY(1); opacity: 1; }
          100% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
        }
      `}</style>
    </section>
  );
}
