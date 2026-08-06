"use client";

import { createContext, useContext } from "react";

const SequenceManifestContext = createContext<string[]>([]);

export const SequenceManifestProvider = SequenceManifestContext.Provider;

/** Returns the real, ordered list of frame URLs read from public/sequence. */
export function useSequenceFrames(): string[] {
  return useContext(SequenceManifestContext);
}

/**
 * Picks a frame by fractional position (0 = first frame, 1 = last frame)
 * so showcase/testimonial imagery scales gracefully with however many
 * frames actually exist, instead of assuming a fixed count like 600.
 */
export function frameAt(frames: string[], fraction: number): string {
  if (frames.length === 0) return "";
  const index = Math.round(fraction * (frames.length - 1));
  return frames[Math.min(Math.max(index, 0), frames.length - 1)];
}
