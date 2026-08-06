"use client";

import { useEffect, useState } from "react";
import DebugOverlay from "@/components/DebugOverlay";
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
import { useLenis } from "@/hooks/useLenis";

export default function Home() {
  useLenis();

  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    document.body.style.overflow = loaded ? "" : "hidden";
  }, [loaded]);

  return (
    <>
      <DebugOverlay />
      <LoadingScreen progress={progress} loaded={loaded} />
      <CustomCursor />
      <Navbar />

      <main id="top">
        <Hero onReady={() => setLoaded(true)} onProgress={setProgress} />

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
    </>
  );
}
