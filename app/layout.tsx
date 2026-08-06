import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meridian Estates | Crafting Luxury Living Experiences",
  description:
    "Meridian Estates designs and delivers premium villas and bespoke interior furnishing for those who consider a home a work of architecture. Explore our collection of luxury residences.",
  keywords: [
    "luxury real estate",
    "premium villas",
    "luxury interior design",
    "bespoke homes",
    "custom villas",
  ],
  openGraph: {
    title: "Meridian Estates | Crafting Luxury Living Experiences",
    description:
      "Premium villas and bespoke interiors, designed as a single continuous work of architecture.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="font-body bg-ivory text-charcoal">{children}</body>
    </html>
  );
}
