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
    let isScrolling = false;
    let scrollTimeout: ReturnType<typeof setTimeout>;

    function onScrollState() {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 250);
    }
    window.addEventListener("scroll", onScrollState, { passive: true });

    function handleResize() {
      if (isScrolling) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    let roTimer: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      if (isScrolling) return;
      clearTimeout(roTimer);
      roTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
    });
    ro.observe(document.body);

    window.addEventListener("load", handleResize);

    return () => {
      clearTimeout(resizeTimer);
      clearTimeout(roTimer);
      clearTimeout(scrollTimeout);
      window.removeEventListener("scroll", onScrollState);
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

    if (document.body.style.overflow === "hidden") {
      document.body.style.overflow = "";
    }
    void document.body.offsetHeight; // flush layout synchronously

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * getScrollHeightMultiplier()}`,
        pin: true,
        pinSpacing: true,
        pinType: "transform",
        scrub: 0.4,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;

          if (video.duration) {
            const targetTime = clamp(progress * video.duration, 0, video.duration);
            if (Math.abs(video.currentTime - targetTime) > 0.03) {
              if ("fastSeek" in video && typeof (video as any).fastSeek === "function") {
                (video as any).fastSeek(targetTime);
              } else {
                video.currentTime = targetTime;
              }
            }
          }

          const TEXT_HOLD = 0.05;
          const TEXT_FADE_END = 0.42;
          const textProgress = clamp(
            (progress - TEXT_HOLD) / (TEXT_FADE_END - TEXT_HOLD),
            0,
            1
          );
          const ease = 1 - Math.pow(1 - textProgress, 3);

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

      <div className="relative z-10 flex h-full w-full max-w-full flex-col items-center justify-center px-4 sm:px-6 text-center overflow-hidden">
        <h1 className="select-none font-display text-[8.5vw] xs:text-[8vw] font-light leading-[0.98] text-white sm:text-[8vw] lg:text-[6.2vw] max-w-full">
          <span className="block overflow-hidden max-w-full">
            <span ref={leftTextRef} className="inline-block max-w-full">
              Crafting Luxury
            </span>
          </span>
          <span className="block overflow-hidden max-w-full">
            <span ref={rightTextRef} className="inline-block italic max-w-full">
              Living Experiences
            </span>
          </span>
        </h1>

        <p ref={subtitleRef} className="eyebrow mt-8 text-white/80 max-w-xs sm:max-w-none mx-auto leading-relaxed">
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
