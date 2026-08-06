"use client";

import { motion } from "framer-motion";

const easeExpo = [0.16, 1, 0.3, 1] as const;

export default function CTA() {
  return (
    <section id="cta" className="bg-charcoal px-6 py-32 lg:px-10" data-cursor-theme="dark">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1, ease: easeExpo }}
        className="mx-auto max-w-4xl text-center"
      >
        <h2 className="font-display text-4xl font-light leading-tight text-white sm:text-6xl">
          Let&apos;s Build Your <span className="italic text-brass-light">Dream Home</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-white/60">
          Tell us about the life you want to live, and our team will translate it
          into architecture, interiors, and a timeline you can trust.
        </p>
        <a
          href="mailto:hello@meridianestates.com"
          data-cursor-hover
          className="group mt-10 inline-flex items-center gap-3 rounded-full border border-brass-light/60 px-8 py-4 text-sm font-medium uppercase tracking-[0.14em] text-brass-light transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-brass-light hover:text-charcoal"
        >
          Book Consultation
          <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
            →
          </span>
        </a>
      </motion.div>
    </section>
  );
}
