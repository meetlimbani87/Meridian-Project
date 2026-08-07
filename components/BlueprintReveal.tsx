"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface BlueprintRevealProps {
  renderSrc?: string;
  blueprintSrc?: string;
  title?: string;
  subtitle?: string;
  lensRadius?: number;
}

interface TrailNode {
  id: number;
  pxX: number;
  pxY: number;
  radius: number;
  opacity: number;
}

export default function BlueprintReveal({
  renderSrc = "/architecture/villa-render.jpg",
  blueprintSrc = "/architecture/villa-blueprint.jpg",
  title = "Grand Estate Facade",
  subtitle = "Architectural Blueprint & Render Inspection",
  lensRadius = 125,
}: BlueprintRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetPosRef = useRef({ pxX: 0, pxY: 0 });
  const currentPosRef = useRef({ pxX: 0, pxY: 0 });

  const [mousePos, setMousePos] = useState({ pxX: 0, pxY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [trail, setTrail] = useState<TrailNode[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [mobileMode, setMobileMode] = useState<"render" | "blueprint" | "split">("split");
  const [splitPercent, setSplitPercent] = useState(50);

  // Unique mask IDs to avoid collisions if multiple instances exist
  const maskIdRef = useRef(`blueprint-mask-${Math.random().toString(36).substring(2, 9)}`);
  const filterIdRef = useRef(`feather-filter-${Math.random().toString(36).substring(2, 9)}`);

  // Detect touch devices to provide a mobile-optimized control fallback
  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
    setIsTouchDevice(isTouch);
  }, []);

  // Smooth lerp loop & ultra-slow trail decay animation
  useEffect(() => {
    if (isTouchDevice) return;
    let animId: number;

    function renderLoop() {
      // 1. Smoothly interpolate cursor position for floating silky movement
      const target = targetPosRef.current;
      const current = currentPosRef.current;

      const dx = target.pxX - current.pxX;
      const dy = target.pxY - current.pxY;

      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        current.pxX += dx * 0.12; // Eased floating cursor movement
        current.pxY += dy * 0.12;
        setMousePos({ pxX: current.pxX, pxY: current.pxY });

        // Add trail node along smoothed cursor path
        setTrail((prev) => [
          ...prev.slice(-100), // Keep up to 100 trail circles for long linger
          {
            id: Date.now() + Math.random(),
            pxX: current.pxX,
            pxY: current.pxY,
            radius: lensRadius, // EXACT SAME RADIUS AS MAIN CIRCLE
            opacity: 0.88,
          },
        ]);
      }

      // 2. Decay trail opacity ultra-slowly (0.0022 per frame = ~4.5 seconds linger)
      setTrail((prevTrail) =>
        prevTrail
          .map((pt) => ({
            ...pt,
            radius: lensRadius, // STAYS EXACT SAME RADIUS
            opacity: pt.opacity - 0.0022, // Ultra slow fade
          }))
          .filter((pt) => pt.opacity > 0.01)
      );

      animId = requestAnimationFrame(renderLoop);
    }

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [isTouchDevice, lensRadius]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (isTouchDevice) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    targetPosRef.current = { pxX: x, pxY: y };
  }

  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
    if (!isTouchDevice) {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        targetPosRef.current = { pxX: x, pxY: y };
        currentPosRef.current = { pxX: x, pxY: y };
        setMousePos({ pxX: x, pxY: y });
      }
      setIsHovered(true);
    }
  }

  function handleMouseLeave() {
    if (!isTouchDevice) {
      setIsHovered(false);
      setTrail([]);
    }
  }

  // Clip Path for Mobile Split Mode
  const mobileClipPath =
    mobileMode === "blueprint"
      ? "inset(0 0 0 0)"
      : mobileMode === "render"
      ? "inset(0 100% 0 0)"
      : `inset(0 0 0 ${100 - splitPercent}%)`;

  return (
    <div className="w-full space-y-6">
      {/* 16:9 Interactive Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-charcoal shadow-2xl select-none"
      >
        {/* Base Layer: Realistic Render Image */}
        <div className="absolute inset-0 h-full w-full">
          <Image
            src={renderSrc}
            alt={`${title} Render`}
            fill
            sizes="(max-width: 1600px) 100vw, 1600px"
            priority
            className="object-cover"
          />
        </div>

        {/* PC Exclusive Feathered Ultra-Slow Fading Trail Blueprint Mask */}
        {!isTouchDevice && (
          <svg className="absolute inset-0 h-full w-full pointer-events-none z-10">
            <defs>
              {/* Soft Feather Filter */}
              <filter id={filterIdRef.current} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="14" />
              </filter>

              <mask id={maskIdRef.current}>
                {/* Black background masks out the blueprint */}
                <rect x="0" y="0" width="100%" height="100%" fill="black" />

                {/* Feathered Group for soft edge blending */}
                <g filter={`url(#${filterIdRef.current})`}>
                  {/* Trailing circles staying exact same size as main circle */}
                  {trail.map((pt) => (
                    <circle
                      key={pt.id}
                      cx={pt.pxX}
                      cy={pt.pxY}
                      r={pt.radius}
                      fill="white"
                      opacity={pt.opacity}
                    />
                  ))}

                  {/* Main active cursor reveal circle */}
                  {isHovered && (
                    <circle
                      cx={mousePos.pxX}
                      cy={mousePos.pxY}
                      r={lensRadius}
                      fill="white"
                    />
                  )}
                </g>
              </mask>
            </defs>

            {/* Blueprint image rendered inside SVG using feathered dynamic mask */}
            <image
              href={blueprintSrc}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
              mask={`url(#${maskIdRef.current})`}
            />
          </svg>
        )}

        {/* Mobile / Touch Overlay Layer */}
        {isTouchDevice && (
          <div
            className="absolute inset-0 h-full w-full pointer-events-none transition-[clip-path] duration-150 ease-out"
            style={{ clipPath: mobileClipPath }}
          >
            <Image
              src={blueprintSrc}
              alt={`${title} Blueprint`}
              fill
              sizes="(max-width: 1600px) 100vw, 1600px"
              priority
              className="object-cover"
            />
          </div>
        )}

        {/* Minimal Static 16:9 Tag */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full bg-black/50 px-3.5 py-1 text-xs text-white/80 backdrop-blur-md border border-white/10">
          <span className="h-1.5 w-1.5 rounded-full bg-brass-light" />
          <span className="eyebrow text-[0.65rem] tracking-wider text-white/90">16:9 Blueprint X-Ray</span>
        </div>
      </div>

      {/* Mobile & Touch Controls */}
      {isTouchDevice && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-charcoal-light/60 p-4 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="eyebrow text-[0.68rem] text-white/70">View Mode:</span>
            <div className="flex rounded-lg bg-black/40 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setMobileMode("render")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  mobileMode === "render" ? "bg-brass-light text-charcoal" : "text-white/70 hover:text-white"
                }`}
              >
                Render
              </button>
              <button
                type="button"
                onClick={() => setMobileMode("split")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  mobileMode === "split" ? "bg-brass-light text-charcoal" : "text-white/70 hover:text-white"
                }`}
              >
                50/50 Split
              </button>
              <button
                type="button"
                onClick={() => setMobileMode("blueprint")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  mobileMode === "blueprint" ? "bg-brass-light text-charcoal" : "text-white/70 hover:text-white"
                }`}
              >
                Blueprint
              </button>
            </div>
          </div>

          {mobileMode === "split" && (
            <div className="flex items-center gap-3 w-full sm:w-auto min-w-[200px]">
              <span className="eyebrow text-[0.62rem] text-white/60">Split Position</span>
              <input
                type="range"
                min={0}
                max={100}
                value={splitPercent}
                onChange={(e) => setSplitPercent(Number(e.target.value))}
                className="w-full accent-brass-light cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* Caption & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div>
          <h3 className="font-display text-xl font-light text-white">{title}</h3>
          <p className="eyebrow mt-1 text-white/60">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-white/50">
          <span>Aspect Ratio: 16:9</span>
          <span>•</span>
          <span>Scale: 1:1 Pixel Aligned</span>
        </div>
      </div>
    </div>
  );
}
