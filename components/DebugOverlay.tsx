"use client";

import { useEffect, useState } from "react";

/**
 * TEMPORARY diagnostic overlay for tracking down the right-side gap bug.
 * Only renders when the page is visited with ?debug=1, so it's inert in
 * normal use. Shows the same numbers we've been checking via devtools
 * directly on screen, so they're readable on a real phone with no devtools
 * access at all — visit the site on the phone, add ?debug=1 to the URL,
 * screenshot the panel. Safe to delete once the bug is resolved.
 */
export default function DebugOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [info, setInfo] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") !== "1") return;
    setEnabled(true);

    function measure() {
      const vw = document.documentElement.clientWidth;
      const offenders = Array.from(document.querySelectorAll("*"))
        .map((el) => ({ el, rect: el.getBoundingClientRect() }))
        .filter(({ rect }) => rect.right > vw + 1)
        .sort((a, b) => b.rect.right - a.rect.right)
        .slice(0, 3)
        .map(({ el, rect }) => ({
          tag: el.tagName,
          cls: (el.className || "").toString().slice(0, 40),
          right: Math.round(rect.right),
          w: Math.round(rect.width),
        }));

      setInfo({
        ua: navigator.userAgent.slice(0, 60),
        dpr: window.devicePixelRatio,
        winInnerWidth: window.innerWidth,
        winOuterWidth: window.outerWidth,
        visualViewportW: window.visualViewport
          ? Math.round(window.visualViewport.width)
          : "n/a",
        htmlClientW: document.documentElement.clientWidth,
        htmlScrollW: document.documentElement.scrollWidth,
        bodyClientW: document.body.clientWidth,
        bodyScrollW: document.body.scrollWidth,
        scrollX: Math.round(window.scrollX),
        maxScrollX: Math.round(
          document.documentElement.scrollWidth - document.documentElement.clientWidth
        ),
        overflowers: offenders,
      });
    }

    measure();
    const interval = setInterval(measure, 500);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, []);

  if (!enabled || !info) return null;

  return (
    <pre
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 999999,
        background: "rgba(0,0,0,0.9)",
        color: "#0f0",
        fontSize: "10px",
        lineHeight: 1.4,
        padding: "8px",
        margin: 0,
        maxWidth: "100vw",
        overflow: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
    >
      {JSON.stringify(info, null, 1)}
    </pre>
  );
}
