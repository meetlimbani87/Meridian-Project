"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/**
 * Sets up Lenis smooth scroll and syncs it with GSAP's ticker.
 * Pauses Lenis during native scrollbar thumb dragging to eliminate
 * any tug-of-war desync or visual section shaking.
 */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    function raf(time: number) {
      if (lenisRef.current && !lenisRef.current.isStopped) {
        lenisRef.current.raf(time * 1000);
      }
    }
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    let isDraggingScrollbar = false;

    // Detect when mouse/pointer interacts with native scrollbar region
    function onPointerDown(e: PointerEvent | MouseEvent) {
      const scrollbarWidth = 30;
      const isRightScrollbar = e.clientX >= document.documentElement.clientWidth - scrollbarWidth;
      const isLeftScrollbar = e.clientX <= scrollbarWidth;

      if (isRightScrollbar || isLeftScrollbar) {
        isDraggingScrollbar = true;
        if (lenisRef.current) {
          lenisRef.current.stop();
        }
      }
    }

    function onPointerUp() {
      if (isDraggingScrollbar) {
        isDraggingScrollbar = false;
        if (lenisRef.current) {
          lenisRef.current.scrollTo(window.scrollY, { immediate: true });
          lenisRef.current.start();
        }
      }
    }

    function onScroll() {
      if (isDraggingScrollbar) {
        ScrollTrigger.update();
      }
    }

    window.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });
    window.addEventListener("mousedown", onPointerDown, { capture: true, passive: true });
    window.addEventListener("pointerup", onPointerUp, { capture: true, passive: true });
    window.addEventListener("mouseup", onPointerUp, { capture: true, passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", onPointerDown, { capture: true });
      window.removeEventListener("mousedown", onPointerDown, { capture: true });
      window.removeEventListener("pointerup", onPointerUp, { capture: true });
      window.removeEventListener("mouseup", onPointerUp, { capture: true });
      window.removeEventListener("scroll", onScroll);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return lenisRef;
}
