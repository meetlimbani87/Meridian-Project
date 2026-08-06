"use client";

import ShowcaseSection, { ShowcaseItem } from "./ShowcaseSection";

interface ShowcaseData {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  reverse: boolean;
}

const SHOWCASES: ShowcaseData[] = [
  {
    eyebrow: "Luxury Architecture",
    title: "Form Follows Feeling",
    description:
      "Every Meridian residence begins with the land itself — sightlines, light, and shade shape each elevation before a single wall is drawn. The result is architecture that feels inevitable, never imposed.",
    image: "/projects/villa-aurea.jpg",
    reverse: false,
  },
  {
    eyebrow: "Premium Interiors",
    title: "Interiors, Considered",
    description:
      "Our furnishing studio pairs rare materials — hand-finished stone, aged brass, quarter-sawn timber — with restrained, tactile detailing so every room feels composed rather than decorated.",
    image: "/projects/casa-marbella.jpg",
    reverse: true,
  },
  {
    eyebrow: "Smart Living",
    title: "Technology, Unseen",
    description:
      "Climate, lighting, security, and sound are woven quietly into the architecture itself. Control is effortless; the technology never announces itself.",
    image: "/projects/showcase-technology.jpg",
    reverse: false,
  },
  {
    eyebrow: "Outdoor Luxury",
    title: "The Garden as a Room",
    description:
      "Pools, pergolas, and mature landscaping are designed as extensions of the interior — an uninterrupted sequence of spaces built for slow mornings and long evenings.",
    image: "/projects/showcase-garden.jpg",
    reverse: true,
  },
  {
    eyebrow: "Personalized Design",
    title: "Built Around You",
    description:
      "From first sketch to final key handover, a single design team stays with you — translating how you actually live into a home built to last generations.",
    image: "/projects/showcase-personalized.jpg",
    reverse: false,
  },
];

export default function Showcases() {
  const items: ShowcaseItem[] = SHOWCASES.map((s) => ({
    eyebrow: s.eyebrow,
    title: s.title,
    description: s.description,
    reverse: s.reverse,
    image: s.image,
  }));

  return (
    <div id="showcase">
      {items.map((item) => (
        <ShowcaseSection key={item.title} item={item} />
      ))}
    </div>
  );
}
