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
  renderSrc = "/architecture/villa-blueprint.png",
  blueprintSrc = "/architecture/villa-render.png",
  title = "Grand Estate Facade",
  subtitle = "Architectural Blueprint & Render Inspection",
  lensRadius = 270,
}: BlueprintRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetPosRef = useRef({ pxX: 0, pxY: 0 });
  const currentPosRef = useRef({ pxX: 0, pxY: 0 });

  const [mousePos, setMousePos] = useState({ pxX: 0, pxY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Click/Tap Toggle State: "xray" (Interactive Spotlight / Mobile Golden Slider) vs "clicked" (100% Full Building Photo Render)
  const [viewMode, setViewMode] = useState<"xray" | "clicked">("xray");

  // Mobile Golden Scanner Line state (starts off-screen left)
  const [mobileScanPercent, setMobileScanPercent] = useState(-8);
  const [isTouchDragging, setIsTouchDragging] = useState(false);

  // Detect mobile viewports reliably so PC/desktop mouse devices always get the circular spotlight hover animation
  useEffect(() => {
    function checkMobile() {
      const isCoarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
      const isTouchWidth = window.innerWidth < 768 && "ontouchstart" in window;
      setIsMobile(isCoarse || isTouchWidth);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // PC Smooth lerp loop for floating cursor spotlight
  useEffect(() => {
    if (isMobile) return;
    let animId: number;

    function renderLoop() {
      const target = targetPosRef.current;
      const current = currentPosRef.current;

      const dx = target.pxX - current.pxX;
      const dy = target.pxY - current.pxY;

      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        current.pxX += dx * 0.16;
        current.pxY += dy * 0.16;
        setMousePos({ pxX: current.pxX, pxY: current.pxY });
      }

      animId = requestAnimationFrame(renderLoop);
    }

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [isMobile]);

  // Mobile Continuous Back-and-Forth (Ping-Pong) Slow Luxury Golden Line Slider Sweep
  useEffect(() => {
    if (!isMobile || viewMode !== "xray") return;
    let animId: number;
    let currentPercent = -8;
    let direction = 1; // 1 = moving right, -1 = moving left

    function scanLoop() {
      if (!isTouchDragging) {
        currentPercent += direction * 0.14; // Ultra-slow smooth luxury sweep speed

        if (direction === 1 && currentPercent >= 108) {
          currentPercent = 108;
          direction = -1; // Reverse direction to sweep back left
        } else if (direction === -1 && currentPercent <= -8) {
          currentPercent = -8;
          direction = 1; // Reverse direction to sweep right
        }

        setMobileScanPercent(currentPercent);
      }
      animId = requestAnimationFrame(scanLoop);
    }

    animId = requestAnimationFrame(scanLoop);
    return () => cancelAnimationFrame(animId);
  }, [isMobile, isTouchDragging, viewMode]);

  // Handle Click / Tap to Toggle between X-Ray Animation Mode and Full Building Photo Render
  function handleContainerClick() {
    setViewMode((prev) => (prev === "xray" ? "clicked" : "xray"));
  }

  // PC Mouse Handlers
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (isMobile) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    targetPosRef.current = { pxX: x, pxY: y };
  }

  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
    if (!isMobile) {
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
    if (!isMobile) {
      setIsHovered(false);
    }
  }

  // Mobile Touch Handlers
  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    if (!isMobile) return;
    setIsTouchDragging(true);
    updateTouchPos(e);
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (!isMobile) return;
    updateTouchPos(e);
  }

  function handleTouchEnd() {
    if (!isMobile) return;
    setTimeout(() => setIsTouchDragging(false), 1200);
  }

  function updateTouchPos(e: React.TouchEvent<HTMLDivElement>) {
    const container = containerRef.current;
    if (!container || !e.touches[0]) return;
    const rect = container.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setMobileScanPercent(percent);
  }

  // Compute exact styles for Overlay Layer (villa-render.png - Actual Building Photo Render)
  const isClickedFullRender = viewMode === "clicked";

  const overlayMask = isClickedFullRender
    ? "none"
    : isMobile
    ? "none"
    : isHovered
    ? `radial-gradient(circle ${lensRadius}px at ${mousePos.pxX}px ${mousePos.pxY}px, rgba(0,0,0,1) 0%, rgba(0,0,0,0.98) 35%, rgba(0,0,0,0.92) 50%, rgba(0,0,0,0.78) 65%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.28) 88%, rgba(0,0,0,0.08) 95%, transparent 100%)`
    : "radial-gradient(circle 0px at 0px 0px, transparent 0%, transparent 100%)";

  const overlayClipPath = isClickedFullRender
    ? "none"
    : isMobile
    ? `inset(0 0 0 ${Math.max(0, Math.min(100, mobileScanPercent))}%)`
    : "none";

  const overlayOpacity = isClickedFullRender
    ? 1
    : isMobile
    ? 1
    : isHovered
    ? 1
    : 0;

  return (
    <div className="w-full space-y-6">
      {/* 16:9 Interactive Container */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="group relative w-full aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-charcoal shadow-2xl select-none cursor-pointer"
      >
        {/* Base Layer: Photorealistic Villa Photo Render (villa-render.png - Always visible underneath) */}
        <div className="absolute inset-0 h-full w-full">
          <Image
            src={renderSrc}
            alt={`${title} Photo Render`}
            fill
            sizes="(max-width: 1600px) 100vw, 1600px"
            priority
            className="object-cover"
          />
        </div>

        {/* Top Overlay Layer: Architectural Blueprint Wireframe (villa-blueprint.png - Revealed inside X-Ray spotlight/scanner) */}
        <div
          className="absolute inset-0 h-full w-full pointer-events-none transition-opacity duration-300"
          style={{
            WebkitMaskImage: overlayMask,
            maskImage: overlayMask,
            clipPath: overlayClipPath,
            opacity: overlayOpacity,
          }}
        >
          <Image
            src={blueprintSrc}
            alt={`${title} Blueprint Wireframe`}
            fill
            sizes="(max-width: 1600px) 100vw, 1600px"
            priority
            className="object-cover"
          />
        </div>

        {/* Mobile Exclusive Clean Sleek Zero-Lag Vertical Golden Slider Line */}
        {isMobile && viewMode === "xray" && (
          <div
            className="absolute top-0 bottom-0 z-30 w-[2.5px] -translate-x-[1px] bg-brass-light shadow-[0_0_15px_rgba(212,175,55,0.9),0_0_30px_rgba(212,175,55,0.6)] pointer-events-none"
            style={{ left: `${mobileScanPercent}%` }}
          />
        )}
      </div>

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
