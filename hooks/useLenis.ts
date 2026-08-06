"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Sets up Lenis smooth scroll and syncs it with GSAP's ticker so that
 * ScrollTrigger stays perfectly in step with the smoothed scroll position.
 */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });
    lenisRef.current = lenis;

    // Keep ScrollTrigger (which pins/scrubs the Hero canvas) perfectly in
    // step with Lenis's smoothed scroll position — otherwise pinning fights
    // the smoothing and scroll feels stuck/glitchy.
    lenis.on("scroll", ScrollTrigger.update);

    // gsap.ticker reports `time` in SECONDS, but lenis.raf() expects a
    // millisecond timestamp (like performance.now()) to compute its easing
    // deltas. Without the *1000 conversion, Lenis sees almost no elapsed
    // time each frame, so its eased scroll position barely moves — which is
    // exactly what "won't scroll / glitches" looks like.
    function raf(time: number) {
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return lenisRef;
}
