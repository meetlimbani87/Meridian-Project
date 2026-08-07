"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import BlueprintReveal from "@/components/BlueprintReveal";
import Divider from "@/components/Divider";
import { useLenis } from "@/hooks/useLenis";

export default function ArchitecturePage() {
  useLenis();

  return (
    <>
      <CustomCursor />
      <Navbar />

      <main className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-charcoal pt-32 pb-24 text-white">
        {/* Architectural Hero Header */}
        <section className="mx-auto max-w-7xl px-6 lg:px-10 mb-16">
          <div className="flex flex-col items-start space-y-6 max-w-3xl">
            <div className="flex items-center gap-3 rounded-full border border-brass-light/30 bg-brass-light/10 px-4 py-1.5 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-brass-light animate-pulse" />
              <span className="eyebrow text-[0.7rem] text-brass-light tracking-widest">
                Architectural Masterclass & Blueprint X-Ray
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.08] text-white">
              Precision Architecture, <br />
              <span className="italic font-normal text-brass-light">Mastercrafted.</span>
            </h1>

            <p className="eyebrow text-base text-white/70 leading-relaxed max-w-2xl font-light">
              Explore the structural geometry, thermal envelope design, and raw engineering blueprints behind Meridian’s landmark luxury residences.
            </p>
          </div>
        </section>

        {/* Interactive 16:9 Blueprint X-Ray Reveal Section */}
        <section className="mx-auto max-w-7xl px-6 lg:px-10 mb-24">
          <BlueprintReveal
            renderSrc="/architecture/villa-render.png"
            blueprintSrc="/architecture/villa-blueprint.png"
            title="Meridian Grand Residence — Front Elevation"
            subtitle="Hover your cursor over the 16:9 frame to inspect the underlying architectural blueprint wireframe in real-time."
            lensRadius={190}
          />
        </section>

        <Divider label="Engineering & Material Specifications" />

        {/* Detailed Architectural Specifications Grid */}
        <section className="mx-auto max-w-7xl px-6 lg:px-10 my-24">
          <div className="mb-14 text-center max-w-2xl mx-auto">
            <span className="eyebrow text-brass-light text-xs tracking-widest uppercase">System Breakdown</span>
            <h2 className="font-display text-3xl sm:text-4xl font-light text-white mt-3">
              Architectural Systems & Integrity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group rounded-2xl bg-charcoal-light/40 border border-white/10 p-8 backdrop-blur-md transition-all duration-500 hover:border-brass-light/40 hover:-translate-y-1">
              <div className="eyebrow text-2xl font-light text-brass-light mb-4">01</div>
              <h3 className="font-display text-xl font-light text-white mb-3">Structural Frame</h3>
              <p className="eyebrow text-xs text-white/70 leading-relaxed">
                Monolithic reinforced concrete slab with 4.2m cantilevered floating terraces and post-tensioned steel support columns.
              </p>
            </div>

            <div className="group rounded-2xl bg-charcoal-light/40 border border-white/10 p-8 backdrop-blur-md transition-all duration-500 hover:border-brass-light/40 hover:-translate-y-1">
              <div className="eyebrow text-2xl font-light text-brass-light mb-4">02</div>
              <h3 className="font-display text-xl font-light text-white mb-3">Curtain Envelope</h3>
              <p className="eyebrow text-xs text-white/70 leading-relaxed">
                Triple-glazed acoustic Low-E glass panels framed in thermally broken anodized aluminum with 98% UV thermal mitigation.
              </p>
            </div>

            <div className="group rounded-2xl bg-charcoal-light/40 border border-white/10 p-8 backdrop-blur-md transition-all duration-500 hover:border-brass-light/40 hover:-translate-y-1">
              <div className="eyebrow text-2xl font-light text-brass-light mb-4">03</div>
              <h3 className="font-display text-xl font-light text-white mb-3">Spatial Atrium</h3>
              <p className="eyebrow text-xs text-white/70 leading-relaxed">
                Double-height 6.2m grand entrance atrium designed for natural stack-effect ventilation and dynamic daylight penetration.
              </p>
            </div>

            <div className="group rounded-2xl bg-charcoal-light/40 border border-white/10 p-8 backdrop-blur-md transition-all duration-500 hover:border-brass-light/40 hover:-translate-y-1">
              <div className="eyebrow text-2xl font-light text-brass-light mb-4">04</div>
              <h3 className="font-display text-xl font-light text-white mb-3">Material Craft</h3>
              <p className="eyebrow text-xs text-white/70 leading-relaxed">
                Hand-cut Portuguese limestone exterior cladding paired with brushed architectural brass details and acoustic oak ceilings.
              </p>
            </div>
          </div>
        </section>

        {/* Back Link & CTA Bar */}
        <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-brass-dark/30 via-charcoal-light/60 to-charcoal-light/30 border border-brass-light/30 p-8 backdrop-blur-lg">
            <div>
              <h3 className="font-display text-2xl font-light text-white">Interested in Custom Architectural Designs?</h3>
              <p className="eyebrow text-xs text-white/70 mt-1">Book a private blueprint consultation with our lead architectural engineers.</p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/#cta"
                className="rounded-full bg-brass-light px-7 py-3 text-xs font-medium uppercase tracking-[0.14em] text-charcoal transition-all hover:bg-white hover:scale-105"
              >
                Book Consultation
              </Link>
              <Link
                href="/"
                className="rounded-full border border-white/30 px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-white transition-all hover:border-brass-light hover:text-brass-light"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
