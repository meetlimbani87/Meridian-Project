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
}

export default function Hero({ onReady, onProgress }: HeroProps) {
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const leftTextRef = useRef<HTMLSpanElement | null>(null);
  const rightTextRef = useRef<HTMLSpanElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const scrollCueRef = useRef<HTMLDivElement | null>(null);
  const readyFired = useRef(false);

  // Canvas drawing helper for mobile image sequence
  function renderCanvasFrame(index: number) {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || !img.naturalWidth) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.clientWidth || window.innerWidth;
    const ch = canvas.clientHeight || window.innerHeight;
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }

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

  // Detect mobile viewport on mount
  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
  }, []);

  // Preload logic: MP4 video on Desktop/Tablet vs JPG Image Sequence on Mobile
  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    if (isMobile) {
      // MOBILE: Fetch sequence manifest and preload sampled JPEG frames for 60fps canvas blitting
      async function loadMobileSequence() {
        try {
          const res = await fetch("/api/sequence-manifest");
          const data = await res.json();
          const files: string[] = data.files || [];

          if (cancelled || !files.length) return;

          // Sample every 4th frame (150 total frames) for fast mobile preloading and smooth scrub
          const SAMPLE_STEP = 4;
          const sampledFiles = files.filter((_, i) => i % SAMPLE_STEP === 0);

          const loadedImages: HTMLImageElement[] = [];
          let loadedCount = 0;

          sampledFiles.forEach((filename, idx) => {
            const img = new Image();
            img.src = `/sequence/${filename}`;
            img.onload = () => {
              if (cancelled) return;
              loadedCount++;
              onProgress?.(Math.min(99, Math.floor((loadedCount / sampledFiles.length) * 100)));

              if (idx === 0) {
                renderCanvasFrame(0);
              }

              if (loadedCount >= Math.min(12, sampledFiles.length) && !readyFired.current) {
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

      loadMobileSequence();
    } else {
      // DESKTOP/TABLET: Fetch MP4 video blob into memory for smooth video currentTime scrubbing
      const video = videoRef.current;
      if (!video) return;

      async function loadVideo() {
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

      loadVideo();
    }

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // Window resize & orientation change observer
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
      resizeTimer = setTimeout(() => {
        if (isMobile) renderCanvasFrame(currentFrameRef.current);
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
  }, [isMobile]);

  // GSAP ScrollTrigger setup for both Canvas Image Scrub (Mobile) and Video Scrub (Desktop/Tablet)
  useLayoutEffect(() => {
    if (!ready) return;
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
        pinType: "transform",
        scrub: 0.4,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;

          if (isMobile) {
            // MOBILE: Canvas Image Frame Scrubbing
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
          } else {
            // DESKTOP/TABLET: MP4 Video currentTime Scrubbing
            const video = videoRef.current;
            if (video && video.duration) {
              const targetTime = clamp(progress * video.duration, 0, video.duration);
              if (Math.abs(video.currentTime - targetTime) > 0.03) {
                if ("fastSeek" in video && typeof (video as any).fastSeek === "function") {
                  (video as any).fastSeek(targetTime);
                } else {
                  video.currentTime = targetTime;
                }
              }
            }
          }

          // Title + Subtitle opacity and transform animations
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
  }, [ready, isMobile]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-charcoal"
      style={{ height: "100dvh" }}
      aria-label="Meridian Estates introduction"
      data-cursor-theme="dark"
    >
      {isMobile ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
      ) : (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          poster="/poster.jpg"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      )}

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
