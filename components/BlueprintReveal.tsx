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

export default function BlueprintReveal({
  renderSrc = "/architecture/villa-render.png",
  blueprintSrc = "/architecture/villa-blueprint.png",
  title = "Grand Estate Facade",
  subtitle = "Architectural Blueprint & Render Inspection",
  lensRadius = 190,
}: BlueprintRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetPosRef = useRef({ pxX: 0, pxY: 0 });
  const currentPosRef = useRef({ pxX: 0, pxY: 0 });

  const [mousePos, setMousePos] = useState({ pxX: 0, pxY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [mobileMode, setMobileMode] = useState<"render" | "blueprint" | "split">("split");
  const [splitPercent, setSplitPercent] = useState(50);

  // Detect touch devices to provide a mobile-optimized control fallback
  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
    setIsTouchDevice(isTouch);
  }, []);

  // Smooth lerp loop for silky cursor movement
  useEffect(() => {
    if (isTouchDevice) return;
    let animId: number;

    function renderLoop() {
      const target = targetPosRef.current;
      const current = currentPosRef.current;

      const dx = target.pxX - current.pxX;
      const dy = target.pxY - current.pxY;

      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        current.pxX += dx * 0.16; // Eased floating cursor movement
        current.pxY += dy * 0.16;
        setMousePos({ pxX: current.pxX, pxY: current.pxY });
      }

      animId = requestAnimationFrame(renderLoop);
    }

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [isTouchDevice]);

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
    }
  }

  // Smooth Seamless Eased Radial Mask: 8-stop cubic curve eliminating any visible edge boundary
  const pcSpotlightMask = isHovered
    ? `radial-gradient(circle ${lensRadius}px at ${mousePos.pxX}px ${mousePos.pxY}px, rgba(0,0,0,1) 0%, rgba(0,0,0,0.98) 35%, rgba(0,0,0,0.92) 50%, rgba(0,0,0,0.78) 65%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.28) 88%, rgba(0,0,0,0.08) 95%, transparent 100%)`
    : "radial-gradient(circle 0px at 0px 0px, transparent 0%, transparent 100%)";

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

        {/* Blueprint Wireframe Layer: Masked with smooth 8-stop seamless radial mask */}
        <div
          className="absolute inset-0 h-full w-full pointer-events-none transition-opacity duration-300"
          style={{
            WebkitMaskImage: isTouchDevice ? mobileClipPath : pcSpotlightMask,
            maskImage: isTouchDevice ? mobileClipPath : pcSpotlightMask,
            opacity: !isTouchDevice && !isHovered ? 0 : 1,
          }}
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
