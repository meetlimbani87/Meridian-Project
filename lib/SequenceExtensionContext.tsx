"use client";

import { createContext, useContext } from "react";
import type { SequenceExtension } from "@/lib/utils";

const SequenceExtensionContext = createContext<SequenceExtension>("png");

export const SequenceExtensionProvider = SequenceExtensionContext.Provider;

/** Read the auto-detected extension (png/jpg/jpeg/webp) for /public/sequence frames. */
export function useSequenceExtension(): SequenceExtension {
  return useContext(SequenceExtensionContext);
}
