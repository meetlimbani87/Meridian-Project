"use client";

import { useEffect, useState } from "react";

interface ManifestState {
  frames: string[]; // full URLs, e.g. "/sequence/001.jpg", in playback order
  ready: boolean;
  error: string | null;
}

/**
 * Fetches the real list of files sitting in /public/sequence from the
 * server (see app/api/sequence-manifest). This is the single source of
 * truth for frame count, extension, and naming — nothing is guessed on
 * the client.
 */
export function useSequenceManifest(): ManifestState {
  const [state, setState] = useState<ManifestState>({
    frames: [],
    ready: false,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/sequence-manifest", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { files: string[]; error?: string }) => {
        if (cancelled) return;
        if (data.error) {
          setState({ frames: [], ready: true, error: data.error });
          return;
        }
        if (!data.files || data.files.length === 0) {
          setState({
            frames: [],
            ready: true,
            error:
              "public/sequence is empty — no .png/.jpg/.jpeg/.webp files found there.",
          });
          return;
        }
        setState({
          frames: data.files.map((name) => `/sequence/${name}`),
          ready: true,
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          frames: [],
          ready: true,
          error: `Failed to reach /api/sequence-manifest: ${err.message}`,
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
