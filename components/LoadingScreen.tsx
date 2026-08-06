"use client";

import { useEffect, useState } from "react";

interface LoadingScreenProps {
  progress: number;
  loaded: boolean;
}

export default function LoadingScreen({ progress, loaded }: LoadingScreenProps) {
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (loaded) {
      const t1 = setTimeout(() => setHidden(true), 250);
      const t2 = setTimeout(() => setMounted(false), 1100);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [loaded]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-charcoal transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={hidden}
    >
      <div className="mb-10 font-display text-2xl italic text-white/90">
        Meridian
      </div>
      <div className="h-px w-40 overflow-hidden bg-white/15">
        <div
          className="h-full bg-brass-light transition-[width] duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="eyebrow mt-6 text-white/50">{progress}%</div>
    </div>
  );
}
