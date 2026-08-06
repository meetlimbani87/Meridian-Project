"use client";

import { useEffect, useRef, useState } from "react";

interface UseImageSequenceResult {
  images: HTMLImageElement[];
  progress: number; // 0 - 100
  loaded: boolean;
  failedCount: number;
}

/**
 * Preloads a known list of frame URLs (from useSequenceManifest) before
 * playback begins. Loads with limited concurrency so the browser doesn't
 * choke on hundreds of simultaneous requests.
 *
 * Pass an empty array while the manifest hasn't resolved yet — the hook
 * simply won't start until `frames.length > 0`.
 */
export function useImageSequence(
  frames: string[],
  concurrency = 12
): UseImageSequenceResult {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failedCount, setFailedCount] = useState(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    if (frames.length === 0) return;
    let cancelled = false;
    const total = frames.length;
    const images: HTMLImageElement[] = new Array(total);
    let doneCount = 0;
    let errorCount = 0;
    let nextIndex = 0;

    function loadOne(): Promise<void> {
      return new Promise((resolve) => {
        if (nextIndex >= total) return resolve();
        const i = nextIndex;
        nextIndex += 1;

        let settled = false;
        // Safety net: a stalled/hung request (no load, no error — just
        // silence) would otherwise block Promise.all forever, leaving the
        // loading screen stuck even while the rounded progress reads 100%.
        const timeoutId = setTimeout(() => {
          if (settled || cancelled) return;
          settled = true;
          errorCount += 1;
          setProgress(Math.floor(((doneCount + errorCount) / total) * 100));
          resolve();
        }, 15000);

        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          if (settled || cancelled) return;
          settled = true;
          clearTimeout(timeoutId);
          doneCount += 1;
          images[i] = img;
          setProgress(Math.floor(((doneCount + errorCount) / total) * 100));
          resolve();
        };
        img.onerror = () => {
          if (settled || cancelled) return;
          settled = true;
          clearTimeout(timeoutId);
          errorCount += 1;
          setProgress(Math.floor(((doneCount + errorCount) / total) * 100));
          resolve();
        };
        img.src = frames[i];
      });
    }

    async function worker() {
      while (nextIndex < total && !cancelled) {
        await loadOne();
      }
    }

    async function run() {
      const workers = Array.from({ length: Math.min(concurrency, total) }, () =>
        worker()
      );
      await Promise.all(workers);
      if (!cancelled) {
        imagesRef.current = images;
        setLoaded(true);
        setFailedCount(errorCount);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [frames, concurrency]);

  return { images: imagesRef.current, progress, loaded, failedCount };
}
