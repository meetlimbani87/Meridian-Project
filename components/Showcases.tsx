"use client";

import ShowcaseSection, { ShowcaseItem } from "./ShowcaseSection";
import { useSequenceFrames, frameAt } from "@/lib/SequenceManifestContext";

interface ShowcaseData {
  eyebrow: string;
  title: string;
  description: string;
  fraction: number; // 0 = first frame, 1 = last frame
  reverse: boolean;
}

const SHOWCASES: ShowcaseData[] = [
  {
    eyebrow: "Luxury Architecture",
    title: "Form Follows Feeling",
    description:
      "Every Meridian residence begins with the land itself — sightlines, light, and shade shape each elevation before a single wall is drawn. The result is architecture that feels inevitable, never imposed.",
    fraction: 0,
    reverse: false,
  },
  {
    eyebrow: "Premium Interiors",
    title: "Interiors, Considered",
    description:
      "Our furnishing studio pairs rare materials — hand-finished stone, aged brass, quarter-sawn timber — with restrained, tactile detailing so every room feels composed rather than decorated.",
    fraction: 0.5,
    reverse: true,
  },
  {
    eyebrow: "Smart Living",
    title: "Technology, Unseen",
    description:
      "Climate, lighting, security, and sound are woven quietly into the architecture itself. Control is effortless; the technology never announces itself.",
    fraction: 0.25,
    reverse: false,
  },
  {
    eyebrow: "Outdoor Luxury",
    title: "The Garden as a Room",
    description:
      "Pools, pergolas, and mature landscaping are designed as extensions of the interior — an uninterrupted sequence of spaces built for slow mornings and long evenings.",
    fraction: 0.75,
    reverse: true,
  },
  {
    eyebrow: "Personalized Design",
    title: "Built Around You",
    description:
      "From first sketch to final key handover, a single design team stays with you — translating how you actually live into a home built to last generations.",
    fraction: 1,
    reverse: false,
  },
];

export default function Showcases() {
  const frames = useSequenceFrames();

  const items: ShowcaseItem[] = SHOWCASES.map((s) => ({
    eyebrow: s.eyebrow,
    title: s.title,
    description: s.description,
    reverse: s.reverse,
    image: frameAt(frames, s.fraction),
  }));

  return (
    <div id="showcase">
      {items.map((item) => (
        <ShowcaseSection key={item.title} item={item} />
      ))}
    </div>
  );
}
