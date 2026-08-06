"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import CustomCursor from "@/components/CustomCursor";
import BackToTop from "@/components/BackToTop";
import Divider from "@/components/Divider";
import Showcases from "@/components/Showcases";
import WhyChooseUs from "@/components/WhyChooseUs";
import FeaturedProjects from "@/components/FeaturedProjects";
import Statistics from "@/components/Statistics";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { useImageSequence } from "@/hooks/useImageSequence";
import { useSequenceManifest } from "@/hooks/useSequenceManifest";
import { useLenis } from "@/hooks/useLenis";
import { SequenceManifestProvider } from "@/lib/SequenceManifestContext";

export default function Home() {
  useLenis();

  // Reads the *real* file list from public/sequence via /api/sequence-manifest —
  // no guessing at extension, padding, or frame count.
  const { frames, ready, error } = useSequenceManifest();
  const { images, progress, loaded, failedCount } = useImageSequence(frames);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    document.body.style.overflow = loaded ? "" : "hidden";
  }, [loaded]);

  if (ready && error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-charcoal px-6 text-center text-white">
        <p className="eyebrow text-red-400">Sequence not found</p>
        <p className="max-w-md text-white/70">{error}</p>
        <p className="max-w-md text-sm text-white/40">
          Add frames to <code>public/sequence/</code> (e.g. 001.jpg, 002.jpg …)
          and refresh.
        </p>
      </div>
    );
  }

  return (
    <SequenceManifestProvider value={frames}>
      <LoadingScreen progress={progress} loaded={loaded} />
      <CustomCursor />
      <Navbar />

      <main id="top">
        <Hero
          images={images}
          loaded={loaded}
          failedCount={failedCount}
          onReady={() => setHeroReady(true)}
        />

        <Showcases />

        <Divider label="The Meridian Standard" />

        <WhyChooseUs />
        <FeaturedProjects />
        <Statistics />
        <Testimonials />
        <CTA />
      </main>

      <Footer />
      <BackToTop />
    </SequenceManifestProvider>
  );
}
