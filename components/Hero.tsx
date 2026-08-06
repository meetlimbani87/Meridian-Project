"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clamp, lerp } from "@/lib/utils";

function getScrollHeightMultiplier() {
  return typeof window !== "undefined" && window.innerWidth < 768 ? 2.5 : 4.5;
}

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroProps {
  onReady?: () => void;
  onProgress?: (percent: number) => void;
  useCanvasSequence?: boolean;
}

export default function Hero({ onReady, onProgress, useCanvasSequence = true }: HeroProps) {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);

  const seekingLockRef = useRef<boolean>(false);
  const pendingSeekTimeRef = useRef<number | null>(null);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const leftTextRef = useRef<HTMLSpanElement | null>(null);
  const rightTextRef = useRef<HTMLSpanElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const scrollCueRef = useRef<HTMLDivElement | null>(null);
  const readyFired = useRef(false);

  // Initialize canvas internal pixel buffer with full Device Pixel Ratio (DPR) for 4K / Retina sharpness
  function setupCanvasSize() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = typeof window !== "undefined" ? Math.max(window.devicePixelRatio || 1, 2) : 1;
    const w = Math.round(window.innerWidth * dpr);
    const h = Math.round(window.innerHeight * dpr);

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  // Canvas drawing helper for image sequence — renders high-resolution pixel-perfect frames
  function renderCanvasFrame(index: number) {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || !img.naturalWidth) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const cw = canvas.width || window.innerWidth;
    const ch = canvas.height || window.innerHeight;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const canvasRatio = cw / ch;
    const imgRatio = iw / ih;

    let dw = cw;
    let dh = ch;
    let dx = 0;
    let dy = 0;

    if (imgRatio > canvasRatio) {
      dw = ch * imgRatio;
      dx = (cw - dw) / 2;
    } else {
      dh = cw / imgRatio;
      dy = (ch - dh) / 2;
    }

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // Detect mobile viewport after client mount (prevents SSR hydration mismatch #418)
  useEffect(() => {
    setMounted(true);
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
  }, []);

  const activeCanvasMode = true;

  // Preload logic: High-resolution JPG Image Sequence (Canvas Mode)
  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;

    if (activeCanvasMode) {
      setupCanvasSize();

      // Fetch sequence manifest and preload sampled JPEG frames for 120fps canvas blitting
      async function loadSequence() {
        try {
          const res = await fetch("/api/sequence-manifest");
          const data = await res.json();
          const files: string[] = data.files || [];

          if (cancelled || !files.length) return;

          // For 602 frames: desktop samples every 2nd frame (301 frames), mobile samples every 4th frame (150 frames)
          const SAMPLE_STEP = isMobile ? 4 : 2;
          const sampledFiles = files.filter((_, i) => i % SAMPLE_STEP === 0);

          const loadedImages: HTMLImageElement[] = [];
          let loadedCount = 0;

          sampledFiles.forEach((filename, idx) => {
            const img = new Image();
            img.src = `/sequence/${filename}?v=4`;
            img.onload = () => {
              if (cancelled) return;
              loadedCount++;
              onProgress?.(Math.min(99, Math.floor((loadedCount / sampledFiles.length) * 100)));

              if (idx === 0) {
                renderCanvasFrame(0);
              }

              if (loadedCount >= Math.min(10, sampledFiles.length) && !readyFired.current) {
                readyFired.current = true;
                onProgress?.(100);
                setReady(true);
                onReady?.();
              }
            };
            loadedImages[idx] = img;
          });
          imagesRef.current = loadedImages;
        } catch {
          if (!cancelled && !readyFired.current) {
            readyFired.current = true;
            onProgress?.(100);
            setReady(true);
            onReady?.();
          }
        }
      }

      loadSequence();
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCanvasMode, mounted]);

  // Window resize & orientation change observer
  useEffect(() => {
    if (!mounted) return;
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
      resizeTimer = setTimeout(() => {
        if (activeCanvasMode) {
          setupCanvasSize();
          renderCanvasFrame(currentFrameRef.current);
        }
        ScrollTrigger.refresh();
      }, 200);
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
  }, [activeCanvasMode, mounted]);

  // GSAP ScrollTrigger setup for Canvas Image Scrub
  useLayoutEffect(() => {
    if (!ready || !mounted) return;
    const section = sectionRef.current;
    if (!section) return;

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
        pinType: isMobile ? "fixed" : "transform",
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;

          // CANVAS: Image Frame Scrubbing
          const imgs = imagesRef.current;
          if (imgs.length > 0) {
            const frameIdx = clamp(
              Math.floor(progress * (imgs.length - 1)),
              0,
              imgs.length - 1
            );
            if (frameIdx !== currentFrameRef.current) {
              currentFrameRef.current = frameIdx;
              renderCanvasFrame(frameIdx);
            }
          }

          // Title + Subtitle opacity and transform animations (cleaned up by 1/4th of sequence)
          const TEXT_HOLD = 0.02;
          const TEXT_FADE_END = 0.25;
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
  }, [ready, isMobile, activeCanvasMode, mounted]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-charcoal"
      style={{ height: "100dvh" }}
      aria-label="Meridian Estates introduction"
      data-cursor-theme="dark"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full object-cover"
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
