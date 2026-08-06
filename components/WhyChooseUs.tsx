"use client";

import { motion } from "framer-motion";

const CARDS = [
  {
    title: "Architecture",
    description: "Bespoke residential design led by principal architects, not templates.",
  },
  {
    title: "Interior Design",
    description: "A dedicated furnishing studio sourcing rare materials worldwide.",
  },
  {
    title: "Smart Home",
    description: "Integrated systems for climate, security, and ambience — invisibly done.",
  },
  {
    title: "Turnkey Delivery",
    description: "One team, one timeline, from land acquisition to move-in day.",
  },
];

const easeExpo = [0.16, 1, 0.3, 1] as const;

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="bg-ivory px-6 py-24 lg:px-10" data-cursor-theme="light">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: easeExpo }}
          className="text-center font-display text-4xl font-light text-charcoal sm:text-5xl"
        >
          Why Choose Meridian
        </motion.h2>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, ease: easeExpo, delay: i * 0.08 }}
              className="group rounded-md border border-charcoal/8 bg-white/70 p-8 shadow-[0_1px_2px_rgba(22,19,15,0.04)] backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-[0_24px_48px_-16px_rgba(22,19,15,0.18)]"
            >
              <span className="eyebrow text-brass">0{i + 1}</span>
              <h3 className="mt-4 font-display text-2xl font-light text-charcoal">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-taupe">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
