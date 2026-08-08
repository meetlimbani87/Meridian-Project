"use client";

import { useEffect, useRef, useState } from "react";

interface LoadingScreenProps {
  progress?: number;
  loaded?: boolean;
}

export default function LoadingScreen({ progress, loaded }: LoadingScreenProps) {
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Determine target percentage (either from prop or self-driven for subpages)
  const isSelfDriven = progress === undefined && loaded === undefined;
  const targetPercent = isSelfDriven ? 100 : Math.min(100, Math.max(0, progress || 0));
  const isLoadedComplete = isSelfDriven ? displayedProgress >= 99 : Boolean(loaded);

  // Smooth lerp loop for the progress counter to eliminate any jumpy counter glitches
  useEffect(() => {
    let animId: number;

    function updateProgress() {
      setDisplayedProgress((prev) => {
        const diff = targetPercent - prev;
        if (Math.abs(diff) < 0.5) return targetPercent;
        return prev + diff * (isSelfDriven ? 0.08 : 0.12);
      });
      animId = requestAnimationFrame(updateProgress);
    }

    animId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animId);
  }, [targetPercent, isSelfDriven]);

  // Handle smooth unmount transition once minimum display time (800ms) and loading complete
  useEffect(() => {
    if (isLoadedComplete && displayedProgress >= 95) {
      const elapsedTime = Date.now() - startTimeRef.current;
      const minDisplayTime = 800; // Guarantee 800ms minimum display so layout settles cleanly
      const remainingDelay = Math.max(0, minDisplayTime - elapsedTime);

      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, remainingDelay);

      const unmountTimer = setTimeout(() => {
        setIsUnmounted(true);
      }, remainingDelay + 700);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(unmountTimer);
      };
    }
  }, [isLoadedComplete, displayedProgress]);

  if (isUnmounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#16130F] text-white transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isFadingOut ? "pointer-events-none opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      aria-hidden={isFadingOut}
    >
      {/* Luxury Brand Emblem */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <span className="font-display text-4xl italic tracking-wide text-white">Meridian</span>
        <span className="eyebrow text-[0.68rem] tracking-[0.25em] text-brass-light uppercase">
          Architectural Estates
        </span>
      </div>

      {/* Sleek Progress Bar Container */}
      <div className="relative h-[2px] w-48 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-brass-light transition-all duration-150 ease-out shadow-[0_0_12px_rgba(212,175,55,0.6)]"
          style={{ width: `${Math.round(displayedProgress)}%` }}
        />
      </div>

      {/* Percentage Counter */}
      <div className="eyebrow mt-5 text-xs text-white/60 tracking-widest font-mono">
        {Math.round(displayedProgress)}%
      </div>
    </div>
  );
}
