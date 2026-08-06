"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Desktop-only cursor: a small solid dot that tracks instantly, and a
 * thin ring that trails behind with soft easing. Each section is tagged
 * with data-cursor-theme="dark" | "light"; the cursor looks up the
 * element under it every frame and swaps to a charcoal ring/dot on light
 * sections or an ivory one on dark sections. This is more reliable than
 * mix-blend-mode, which can fail to read through the separate GPU
 * compositing layers that all the transform-based animations on this
 * page create.
 * No-op on touch devices; the native cursor remains untouched there.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const [label, setLabel] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const isFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isFine) return;

    document.body.classList.add("cursor-active");

    let ringX = 0;
    let ringY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let raf = 0;
    let hovering = false;
    let lastTheme: "dark" | "light" = "dark";

    function onMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    }

    function onOver(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const interactive = target.closest<HTMLElement>("a, button, [data-cursor-hover]");
      hovering = !!interactive;
      ringRef.current?.classList.toggle("scale-[2.6]", hovering);
      ringRef.current?.classList.toggle("opacity-0", hovering);
      dotRef.current?.classList.toggle("opacity-0", hovering);
      setLabel(hovering ? interactive?.dataset.cursorLabel ?? "View" : "");
    }

    function tick() {
      ringX = ringX + (mouseX - ringX) * 0.22;
      ringY = ringY + (mouseY - ringY) * 0.22;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      // Look up which themed section the pointer is currently over and
      // flip the cursor's own color to match, rather than trying to blend.
      const el = document.elementFromPoint(mouseX, mouseY) as HTMLElement | null;
      const themedAncestor = el?.closest<HTMLElement>("[data-cursor-theme]");
      const nextTheme = (themedAncestor?.dataset.cursorTheme as "dark" | "light") ?? "dark";
      if (nextTheme !== lastTheme) {
        lastTheme = nextTheme;
        setTheme(nextTheme);
      }

      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    raf = requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove("cursor-active");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  // A dark-themed (charcoal) section gets a brass/gold cursor; a light
  // (ivory) section gets a charcoal one, for contrast either way.
  const cursorColor = theme === "dark" ? "brass" : "charcoal";

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] hidden md:block">
      <div
        ref={dotRef}
        className={`absolute left-0 top-0 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[opacity,background-color] duration-200 ${
          cursorColor === "brass" ? "bg-brass" : "bg-charcoal"
        }`}
      />
      <div
        ref={ringRef}
        className={`absolute left-0 top-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-[transform,opacity,border-color] duration-300 ease-out ${
          cursorColor === "brass" ? "border-brass" : "border-charcoal"
        }`}
      />
      <span
        ref={labelRef}
        className={`eyebrow absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[0.62rem] transition-opacity duration-300 ${
          cursorColor === "brass" ? "text-charcoal" : "text-ivory"
        } ${label ? "opacity-100" : "opacity-0"}`}
      >
        {label && (
          <span
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              cursorColor === "brass" ? "bg-brass" : "bg-charcoal"
            }`}
          >
            {label}
          </span>
        )}
      </span>
    </div>
  );
}
