"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clamp, lerp } from "@/lib/utils";

// How much scroll distance (in viewport heights) drives the full sequence.
const SCROLL_HEIGHT_MULTIPLIER = 4.5;

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroProps {
  images: HTMLImageElement[];
  loaded: boolean;
  failedCount?: number;
  onReady?: () => void;
}

export default function Hero({ images, loaded, failedCount = 0, onReady }: HeroProps) {
  const totalFrames = images.length;
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const leftTextRef = useRef<HTMLSpanElement | null>(null);
  const rightTextRef = useRef<HTMLSpanElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const scrollCueRef = useRef<HTMLDivElement | null>(null);

  const currentFrame = useRef(0);
  const drawnOnce = useRef(false);

  // Draws a given frame to the canvas using cover-fit, respecting DPR.
  function drawFrame(index: number) {
    const canvas = canvasRef.current;
    const img = images[index];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;
    let drawW: number, drawH: number, dx: number, dy: number;

    if (imgRatio > canvasRatio) {
      drawH = ch;
      drawW = ch * imgRatio;
      dx = (cw - drawW) / 2;
      dy = 0;
    } else {
      drawW = cw;
      drawH = cw / imgRatio;
      dx = 0;
      dy = (ch - drawH) / 2;
    }
    ctx.drawImage(img, dx, dy, drawW, drawH);
    drawnOnce.current = true;
  }

  useEffect(() => {
    if (loaded && !drawnOnce.current) {
      drawFrame(0);
      onReady?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  useEffect(() => {
    function handleResize() {
      drawFrame(currentFrame.current);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  useLayoutEffect(() => {
    if (!loaded || totalFrames === 0) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollLength = window.innerHeight * SCROLL_HEIGHT_MULTIPLIER;

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${scrollLength}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.4,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;

          // Drive the image sequence across the full scroll range.
          const frameIndex = clamp(
            Math.round(progress * (totalFrames - 1)),
            0,
            totalFrames - 1
          );
          if (frameIndex !== currentFrame.current) {
            currentFrame.current = frameIndex;
          }
          drawFrame(frameIndex);

          // Title + subtitle hold fully visible early on, then fade out by
          // roughly frame 200-300 (progress ~0.33-0.5) rather than
          // disappearing in the first 30% of the whole 600-frame sequence.
          const TEXT_HOLD = 0.05; // stays fully visible until ~5% scroll
          const TEXT_FADE_END = 0.42; // fully faded by ~42% scroll (~frame 250)
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
  }, [loaded]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-charcoal"
      aria-label="Meridian Estates introduction"
      data-cursor-theme="dark"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
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

        <p
          ref={subtitleRef}
          className="eyebrow mt-8 text-white/80"
        >
          Luxury Homes &nbsp;•&nbsp; Premium Interiors &nbsp;•&nbsp; Bespoke Design
        </p>
      </div>

      {failedCount > 0 && (
        <div className="absolute left-1/2 top-6 z-20 -translate-x-1/2 rounded-full bg-red-500/90 px-5 py-2 text-xs font-medium text-white shadow-lg">
          {failedCount} of {images.length} sequence frame
          {failedCount === 1 ? "" : "s"} failed to load — check the browser
          Network tab for the exact 404 URL and confirm that file exists in
          public/sequence.
        </div>
      )}

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
