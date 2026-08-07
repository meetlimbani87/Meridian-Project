"use client";

import { motion } from "framer-motion";

export interface ShowcaseItem {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  reverse: boolean;
}

const easeExpo = [0.16, 1, 0.3, 1] as const;

export default function ShowcaseSection({ item }: { item: ShowcaseItem }) {
  return (
    <div className="bg-charcoal overflow-hidden" data-cursor-theme="dark">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:gap-16 md:py-24 lg:px-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 1.1, ease: easeExpo }}
          className={`overflow-hidden rounded-sm ${item.reverse ? "md:order-2" : "md:order-1"}`}
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          ) : (
            <div className="aspect-[4/5] w-full animate-pulse bg-stone/20" />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: easeExpo, delay: 0.15 }}
          className={item.reverse ? "md:order-1" : "md:order-2"}
        >
          <span className="eyebrow text-brass-light">{item.eyebrow}</span>
          <h3 className="mt-5 font-display text-4xl font-light leading-tight text-ivory sm:text-5xl">
            {item.title}
          </h3>
          <p className="mt-6 max-w-md text-[1.02rem] leading-relaxed text-stone">
            {item.description}
          </p>

          {item.eyebrow === "Luxury Architecture" && (
            <div className="mt-8">
              <a
                href="/architecture"
                data-cursor-hover
                className="inline-flex items-center gap-3 rounded-full border border-brass-light/40 bg-brass-light/10 px-6 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-brass-light transition-all hover:bg-brass-light hover:text-charcoal"
              >
                <span>Explore Architectural Blueprint</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
